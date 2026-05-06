from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from zoneinfo import ZoneInfo

now = datetime.now(ZoneInfo("America/New_York"))
db = SQLAlchemy()
        
class Buttery(db.Model):
    __tablename__ = "butteries"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    display_name = db.Column(db.String(100))
    admin_password_hash = db.Column(db.String(255))

class ButteryItemCategory(db.Model):
    __tablename__ = "menu_categories"

    id = db.Column(db.Integer, primary_key=True)
    buttery_id = db.Column(db.Integer, db.ForeignKey("butteries.id"), nullable=False)
    name = db.Column(db.String(50), nullable=False)

    buttery = db.relationship("Buttery")

class MenuItem(db.Model):
    __tablename__ = "menu_items"

    id = db.Column(db.Integer, primary_key=True)
    buttery_id = db.Column(db.Integer, db.ForeignKey("butteries.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("menu_categories.id"))
    price = db.Column(db.Numeric(5,2), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="available")

    buttery = db.relationship("Buttery")
    category = db.relationship("ButteryItemCategory")

    def to_dict(self):
        return {
            "id": self.id,
            "buttery_id": self.buttery_id,
            "name": self.name,
            "price": float(self.price),
            "status": self.status,
            "category": self.category.name if self.category else None,
            "category_id": self.category_id
        }

class ButteryHours(db.Model):
    __tablename__ = "buttery_hours"

    id = db.Column(db.Integer, primary_key=True)
    buttery_id = db.Column(db.Integer, db.ForeignKey("butteries.id"), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)
    open_time = db.Column(db.Time)
    close_time = db.Column(db.Time)
    is_closed_all_day = db.Column(db.Boolean, default=False)

    buttery = db.relationship("Buttery")

    def to_dict(self):
        return {
            "id": self.id,
            "buttery_id": self.buttery_id,
            "day_of_week": self.day_of_week,
            "open_time": self.open_time.strftime("%H:%M") if self.open_time else None,
            "close_time": self.close_time.strftime("%H:%M") if self.close_time else None,
            "is_closed_all_day": self.is_closed_all_day
        }

class ButteryStatusOverride(db.Model):
    __tablename__ = "buttery_status_overrides"

    id = db.Column(db.Integer, primary_key=True)
    buttery_id = db.Column(db.Integer, db.ForeignKey("butteries.id"), nullable=False)
    is_open = db.Column(db.Boolean, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.now(ZoneInfo("America/New_York")))
    updated_by = db.Column(db.String(100))
    reason = db.Column(db.Text)
    cleared_at = db.Column(db.DateTime, nullable=True)

    buttery = db.relationship("Buttery")

    def to_dict(self):
        return {
            "id": self.id,
            "buttery_id": self.buttery_id,
            "is_open": self.is_open,
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None,
            "updated_by": self.updated_by,
            "reason": self.reason,
            "cleared_at": self.cleared_at.strftime("%Y-%m-%d %H:%M:%S") if self.cleared_at else None,
        }