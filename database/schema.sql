--
-- PostgreSQL database dump
--

\restrict N3bcKVkIh8OR1YURWeSgwr1T9dYciJ4vcd7ayaJptmOknhJyAZM57PfP2Yps3vT

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-06 15:57:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 32773)
-- Name: butteries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.butteries (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100),
    admin_password_hash character varying(255)
);


ALTER TABLE public.butteries OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 32772)
-- Name: butteries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.butteries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.butteries_id_seq OWNER TO postgres;

--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 221
-- Name: butteries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.butteries_id_seq OWNED BY public.butteries.id;


--
-- TOC entry 226 (class 1259 OID 32826)
-- Name: buttery_hours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buttery_hours (
    id integer NOT NULL,
    buttery_id integer NOT NULL,
    day_of_week integer NOT NULL,
    open_time time without time zone,
    close_time time without time zone,
    is_closed_all_day boolean DEFAULT false
);


ALTER TABLE public.buttery_hours OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 32825)
-- Name: buttery_hours_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.buttery_hours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buttery_hours_id_seq OWNER TO postgres;

--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 225
-- Name: buttery_hours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.buttery_hours_id_seq OWNED BY public.buttery_hours.id;


--
-- TOC entry 228 (class 1259 OID 32852)
-- Name: buttery_status_overrides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buttery_status_overrides (
    id integer NOT NULL,
    buttery_id integer NOT NULL,
    is_open boolean NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by character varying(100),
    reason text,
    cleared_at timestamp without time zone
);


ALTER TABLE public.buttery_status_overrides OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 32851)
-- Name: buttery_status_overrides_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.buttery_status_overrides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buttery_status_overrides_id_seq OWNER TO postgres;

--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 227
-- Name: buttery_status_overrides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.buttery_status_overrides_id_seq OWNED BY public.buttery_status_overrides.id;


--
-- TOC entry 220 (class 1259 OID 24614)
-- Name: menu_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    buttery_id integer NOT NULL
);


ALTER TABLE public.menu_categories OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24613)
-- Name: menu_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 219
-- Name: menu_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_categories_id_seq OWNED BY public.menu_categories.id;


--
-- TOC entry 224 (class 1259 OID 32802)
-- Name: menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_items (
    id integer NOT NULL,
    buttery_id integer NOT NULL,
    name character varying(100) NOT NULL,
    category_id integer,
    price numeric(5,2) NOT NULL,
    status character varying(20) DEFAULT 'available'::character varying NOT NULL,
    CONSTRAINT menu_items_status_check CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'low_stock'::character varying, 'sold_out'::character varying])::text[])))
);


ALTER TABLE public.menu_items OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 32801)
-- Name: menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_items_id_seq OWNER TO postgres;

--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 223
-- Name: menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;


--
-- TOC entry 4877 (class 2604 OID 32776)
-- Name: butteries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.butteries ALTER COLUMN id SET DEFAULT nextval('public.butteries_id_seq'::regclass);


--
-- TOC entry 4880 (class 2604 OID 32829)
-- Name: buttery_hours id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buttery_hours ALTER COLUMN id SET DEFAULT nextval('public.buttery_hours_id_seq'::regclass);


--
-- TOC entry 4882 (class 2604 OID 32855)
-- Name: buttery_status_overrides id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buttery_status_overrides ALTER COLUMN id SET DEFAULT nextval('public.buttery_status_overrides_id_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 24617)
-- Name: menu_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_categories ALTER COLUMN id SET DEFAULT nextval('public.menu_categories_id_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 32805)
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- TOC entry 4892 (class 2606 OID 32782)
-- Name: butteries butteries_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.butteries
    ADD CONSTRAINT butteries_name_key UNIQUE (name);


--
-- TOC entry 4894 (class 2606 OID 32780)
-- Name: butteries butteries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.butteries
    ADD CONSTRAINT butteries_pkey PRIMARY KEY (id);


--
-- TOC entry 4898 (class 2606 OID 32837)
-- Name: buttery_hours buttery_hours_buttery_id_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buttery_hours
    ADD CONSTRAINT buttery_hours_buttery_id_day_of_week_key UNIQUE (buttery_id, day_of_week);


--
-- TOC entry 4900 (class 2606 OID 32835)
-- Name: buttery_hours buttery_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buttery_hours
    ADD CONSTRAINT buttery_hours_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 32863)
-- Name: buttery_status_overrides buttery_status_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buttery_status_overrides
    ADD CONSTRAINT buttery_status_overrides_pkey PRIMARY KEY (id);


--
-- TOC entry 4886 (class 2606 OID 24623)
-- Name: menu_categories menu_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT menu_categories_name_key UNIQUE (name);


--
-- TOC entry 4888 (class 2606 OID 24621)
-- Name: menu_categories menu_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT menu_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4896 (class 2606 OID 32814)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 32850)
-- Name: menu_categories unique_buttery_category; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT unique_buttery_category UNIQUE (buttery_id, name);


--
-- TOC entry 4906 (class 2606 OID 32838)
-- Name: buttery_hours buttery_hours_buttery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buttery_hours
    ADD CONSTRAINT buttery_hours_buttery_id_fkey FOREIGN KEY (buttery_id) REFERENCES public.butteries(id);


--
-- TOC entry 4907 (class 2606 OID 32864)
-- Name: buttery_status_overrides buttery_status_overrides_buttery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buttery_status_overrides
    ADD CONSTRAINT buttery_status_overrides_buttery_id_fkey FOREIGN KEY (buttery_id) REFERENCES public.butteries(id);


--
-- TOC entry 4903 (class 2606 OID 32843)
-- Name: menu_categories fk_menu_categories_buttery; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT fk_menu_categories_buttery FOREIGN KEY (buttery_id) REFERENCES public.butteries(id);


--
-- TOC entry 4904 (class 2606 OID 32815)
-- Name: menu_items menu_items_buttery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_buttery_id_fkey FOREIGN KEY (buttery_id) REFERENCES public.butteries(id);


--
-- TOC entry 4905 (class 2606 OID 32820)
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.menu_categories(id);


-- Completed on 2026-05-06 15:57:36

--
-- PostgreSQL database dump complete
--

\unrestrict N3bcKVkIh8OR1YURWeSgwr1T9dYciJ4vcd7ayaJptmOknhJyAZM57PfP2Yps3vT

