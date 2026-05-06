from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import db, Buttery, ButteryItemCategory, MenuItem, ButteryHours, ButteryStatusOverride
from datetime import datetime
from zoneinfo import ZoneInfo
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)

app.config.from_object(Config)
db.init_app(app)

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

CORS(app)

app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

now = datetime.now(ZoneInfo("America/New_York"))

@app.route("/test")
def test():
    return jsonify({"message": "Backend is connected!"})

@app.route("/debug-scheme")
def debug_scheme():
    return {
        "is_secure": request.is_secure,
        "scheme": request.scheme,
        "url": request.url
    }

@app.route("/")
def home():
    return {"message": "API running"}

@app.route("/butteries")
def get_butteries():
    butteries = Buttery.query.order_by(Buttery.name.asc()).all()
    return jsonify([
        {"id": b.id,
        "name": b.name,
        "display_name": b.display_name
        }
        for b in butteries
    ])

@app.route("/butteries/<int:buttery_id>/verify-admin", methods=["POST"])
def verify_admin_password(buttery_id):
    buttery = Buttery.query.get_or_404(buttery_id)
    data = request.json

    password = data.get("password")
    if not password:
        return {"error": "Password is required"}, 400

    if not buttery.admin_password_hash:
        return {"error": "No admin password set for this buttery"}, 400

    if check_password_hash(buttery.admin_password_hash, password):
        return {"success": True}

    return {"success": False}, 401

@app.route("/butteries/<int:buttery_id>/menu", methods=["GET"])
def get_buttery_menu(buttery_id):
    items = (
        MenuItem.query
        .filter_by(buttery_id=buttery_id)
        .order_by(MenuItem.name.asc())
        .all()
    )
    return jsonify([item.to_dict() for item in items])

@app.route("/butteries/<int:buttery_id>", methods=["GET"])
def get_buttery(buttery_id):
    buttery = Buttery.query.get_or_404(buttery_id)
    return jsonify({
        "id": buttery.id,
        "name": buttery.name,
        "display_name": buttery.display_name
    })

@app.route("/butteries/<int:buttery_id>/menu", methods=["POST"])
def create_buttery_menu_item(buttery_id):
    data = request.json

    category_id = data.get("category_id")

    if not data.get("name"):
        return {"error": "Name is required"}, 400

    if data.get("price") is None:
        return {"error": "Price is required"}, 400

    # make sure the chosen category belongs to this buttery
    if category_id is not None:
        category = ButteryItemCategory.query.filter_by(
            id=category_id,
            buttery_id=buttery_id
        ).first()

        if not category:
            return {"error": "Invalid category for this buttery"}, 400

    item = MenuItem(
        buttery_id=buttery_id,
        name=data["name"],
        price=data["price"],
        category_id=category_id,
        status=data.get("status", "available")
    )

    db.session.add(item)
    db.session.commit()

    return item.to_dict(), 201

@app.route("/butteries/<int:buttery_id>/menu/<int:item_id>", methods=["PUT"])
def update_buttery_menu_item(buttery_id, item_id):
    item = MenuItem.query.filter_by(id=item_id, buttery_id=buttery_id).first()

    if not item:
        return {"error": "Menu item not found for this buttery"}, 404

    data = request.json
    category_id = data.get("category_id", item.category_id)

    # Optional but recommended validation
    if category_id is not None:
        category = ButteryItemCategory.query.filter_by(
            id=category_id,
            buttery_id=buttery_id
        ).first()

        if not category:
            return {"error": "Invalid category for this buttery"}, 400

    item.name = data.get("name", item.name)
    item.price = data.get("price", item.price)
    item.category_id = category_id
    item.status = data.get("status", item.status)

    db.session.commit()

    return item.to_dict()

@app.route("/butteries/<int:buttery_id>/menu/<int:item_id>", methods=["DELETE"])
def delete_buttery_menu_item(buttery_id, item_id):
    item = MenuItem.query.filter_by(id=item_id, buttery_id=buttery_id).first()

    if not item:
        return {"error": "Menu item not found for this buttery"}, 404

    db.session.delete(item)
    db.session.commit()

    return {"message": "Deleted"}

@app.route("/butteries/<int:buttery_id>/categories")
def get_buttery_categories(buttery_id):
    categories = (
        ButteryItemCategory.query
        .filter_by(buttery_id=buttery_id)
        .order_by(ButteryItemCategory.name.asc())
        .all()
    )
    return jsonify([
        {"id": c.id, "name": c.name}
        for c in categories
    ])

@app.route("/butteries/<int:buttery_id>/hours", methods=["GET"])
def get_buttery_hours(buttery_id):
    hours = (
        ButteryHours.query
        .filter_by(buttery_id=buttery_id)
        .order_by(ButteryHours.day_of_week.asc())
        .all()
    )
    return jsonify([h.to_dict() for h in hours])

@app.route("/butteries/<int:buttery_id>/hours/<int:day_of_week>", methods=["PUT"])
def update_buttery_hours(buttery_id, day_of_week):
    hours = ButteryHours.query.filter_by(
        buttery_id=buttery_id,
        day_of_week=day_of_week
    ).first()

    if not hours:
        return {"error": "Day not found for this buttery"}, 404

    data = request.json

    hours.open_time = (
        datetime.strptime(data["open_time"], "%H:%M").time()
        if data.get("open_time")
        else hours.open_time
    )

    hours.close_time = (
        datetime.strptime(data["close_time"], "%H:%M").time()
        if data.get("close_time")
        else hours.close_time
    )

    hours.is_closed_all_day = data.get(
        "is_closed_all_day",
        hours.is_closed_all_day
    )

    db.session.commit()

    return hours.to_dict()

def is_currently_open_from_schedule(hours_row, current_time):
    if hours_row.is_closed_all_day:
        return False

    if not hours_row.open_time or not hours_row.close_time:
        return False

    open_time = hours_row.open_time
    close_time = hours_row.close_time

    # Normal same-day hours
    if open_time < close_time:
        return open_time <= current_time < close_time

    # Cross-midnight hours, like 21:30 -> 00:00
    return current_time >= open_time or current_time < close_time

@app.route("/butteries/<int:buttery_id>/status", methods=["GET"])
def get_buttery_status(buttery_id):
    latest_override = (
        ButteryStatusOverride.query
        .filter_by(buttery_id=buttery_id, cleared_at=None)
        .order_by(ButteryStatusOverride.updated_at.desc(), ButteryStatusOverride.id.desc())
        .first()
    )

    if latest_override:
        return jsonify({
            "source": "override",
            "is_open": latest_override.is_open,
            "updated_at": latest_override.updated_at.strftime("%Y-%m-%d %H:%M:%S") if latest_override.updated_at else None,
            "updated_by": latest_override.updated_by,
            "reason": latest_override.reason
        })

    now = datetime.now(ZoneInfo("America/New_York"))
    current_day = (now.weekday() + 1) % 7
    current_time = now.time()

    hours_row = ButteryHours.query.filter_by(
        buttery_id=buttery_id,
        day_of_week=current_day
    ).first()

    is_open = is_currently_open_from_schedule(hours_row, current_time) if hours_row else False

    return jsonify({
        "source": "schedule",
        "is_open": is_open,
        "updated_at": None,
        "updated_by": None,
        "reason": None
    })


@app.route("/butteries/<int:buttery_id>/override", methods=["GET"])
def get_buttery_override(buttery_id):
    latest_override = (
        ButteryStatusOverride.query
        .filter_by(buttery_id=buttery_id, cleared_at=None)
        .order_by(ButteryStatusOverride.updated_at.desc(), ButteryStatusOverride.id.desc())
        .first()
    )

    if not latest_override:
        return jsonify(None)

    return jsonify(latest_override.to_dict())

@app.route("/butteries/<int:buttery_id>/override", methods=["POST"])
def create_buttery_override(buttery_id):
    data = request.json

    if "is_open" not in data:
        return {"error": "is_open is required"}, 400

    override = ButteryStatusOverride(
        buttery_id=buttery_id,
        is_open=data["is_open"],
        updated_by=data.get("updated_by", "admin"),
        reason=data.get("reason")
    )

    db.session.add(override)
    db.session.commit()

    return jsonify(override.to_dict()), 201

@app.route("/butteries/<int:buttery_id>/override/clear", methods=["POST"])
def clear_buttery_override(buttery_id):
    latest_override = (
        ButteryStatusOverride.query
        .filter_by(buttery_id=buttery_id, cleared_at=None)
        .order_by(ButteryStatusOverride.updated_at.desc(), ButteryStatusOverride.id.desc())
        .first()
    )

    if not latest_override:
        return jsonify({"message": "No active override to clear"}), 200

    latest_override.cleared_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Override cleared"})

if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000,
        ssl_context=("10.74.223.25+2.pem", "10.74.223.25+2-key.pem")
    )