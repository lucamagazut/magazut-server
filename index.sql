
CREATE TABLE machine (
	machine_id SERIAL PRIMARY KEY,
	name varchar(30),
	api_name varchar(15),
	tokens TEXT[]
);

ALTER TABLE table_name
RENAME COLUMN column_name TO new_column_name;

insert into employee (name, second_name)
values ('Luca','Forgiarini');

select * from employee;

delete from employee where employee_id=3

  insert into employee (second_name, name)
values ('Tosolini','Samuele'),('Zampa','Alessandro'),('Zuliani','Michael');

update machine
set name='Generico',tokens='{"generico"}'
where machine_id=1;

select EXTRACT(minute FROM transaction_date) from history

INSERT INTO contraption (denomination, type, machine, work_material, id_code, geometry)
values
('Inserto CNGG quadro raggio 0.8 per alluminio',3,6,5,'CNGG120408-AM HU7305','{"raggio":0.8}')
;

SELECT *
    FROM contraption LEFT JOIN machine ON (contraption.machine = machine.machine_id);

insert into id_code_filter (snippet, tokens)
values ('hss','{"hss","superrapido"}');

CREATE TABLE contraption (
	contraption_id SERIAL PRIMARY KEY,
	denomination TEXT,
  type INTEGER REFERENCES contraption_type(contraption_type_id) NOT NULL,
  machine INTEGER REFERENCES machine(machine_id) NOT NULL,
  work_material INTEGER REFERENCES material(material_id) DEFAULT 2 NOT NULL,
  id_code varchar(30),
  available_qt INTEGER DEFAULT 1,
  minimum_qt INTEGER DEFAULT 0,
  order_state INTEGER  DEFAULT 1,
  geometry JSON NOT NULL
);

CREATE TABLE history (
	history_event_id SERIAL PRIMARY KEY not null,
	user_id INTEGER REFERENCES employee(employee_id) DEFAULT 0,
	transaction_id INTEGER REFERENCES transaction(transaction_id) NOT NULL,
	contraption_id INTEGER REFERENCES contraption(contraption_id) DEFAULT 0,
	involved_quantity INTEGER DEFAULT 0,
	http_app_location JSON NOT NULL,
	http_api_location JSON NOT NULL,
	log JSON DEFAULT '{}'
	transaction_date date not null default CURRENT_TIMESTAMP
);
ALTER TABLE contraption
ALTER COLUMN geometry_diameter TYPE numeric,
ALTER COLUMN geometry_radius TYPE numeric,
ALTER COLUMN geometry_length TYPE numeric,
ALTER COLUMN geometry_degree TYPE numeric,
ALTER COLUMN geometry_thickness TYPE numeric
