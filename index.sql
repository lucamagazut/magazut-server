
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

insert into contraption (
  denomination,
	id_code,
  type,
  machine,
  work_material,
  purchase_request,
  available_qt,
  minimum_qt,
  order_status,
  geometry_diameter
)
values
('Punta widia d6.8','PHM-d6.8',5,1,1,'',0,1,0,6.8),
('Punta widia d6.9','PHM-d6.9',5,1,1,'',0,1,0,6.9),
('Punta widia d7','PHM-d7',5,1,1,'',0,1,0,7),
('Punta widia d7.5','PHM-d7.5',5,1,1,'',0,1,0,7.5),
('Punta widia d7.8','PHM-d7.8',5,1,1,'',0,1,0,7.8),
('Punta widia d8','PHM-d8',5,1,1,'',0,1,0,8),
('Punta widia d8.1','PHM-d8.1',5,1,1,'',0,1,0,8.1),
('Punta widia d8.5','PHM-d8.5',5,1,1,'',0,1,0,8.5),
('Punta widia d8.75','PHM-d8.75',5,1,1,'',0,1,0,8.75),
('Punta widia d8.8','PHM-d8.8',5,1,1,'',0,1,0,8.8),
('Punta widia d9','PHM-d9',5,1,1,'',0,1,0,9),
('Punta widia d9.6','PHM-d9.6',5,1,1,'',0,1,0,9.6),
('Punta widia d9.7','PHM-d9.7',5,1,1,'',0,1,0,9.7),
('Punta widia d9.8','PHM-d9.8',5,1,1,'',0,1,0,9.8),
('Punta widia d10','PHM-d10',5,1,1,'',0,1,0,10),
('Punta widia d10.3','PHM-d10.3',5,1,1,'',0,1,0,10.3),
('Punta widia d10.5','PHM-d10.5',5,1,1,'',0,1,0,10.5),
('Punta widia d10.75','PHM-d10.75',5,1,1,'',0,1,0,10.75),
('Punta widia d11','PHM-d11',5,1,1,'',0,1,0,11),
('Punta widia d11.8','PHM-d11.8',5,1,1,'',0,1,0,11.8),
('Punta widia d12.5','PHM-d12.5',5,1,1,'',0,1,0,12.5),

('Punta widia d6.9 forata','PHMF-d6.9',5,1,1,'',0,1,0,6.9),
('Punta widia d6.8 forata','PHMF-d6.8',5,1,1,'',0,1,0,6.8),
('Punta widia d7 forata','PHMF-d7',5,1,1,'',0,1,0,7),
('Punta widia d7.5 forata','PHMF-d7.5',5,1,1,'',0,1,0,7.5),
('Punta widia d7.8 forata','PHMF-d7.8',5,1,1,'',0,1,0,7.8),
('Punta widia d8 forata','PHMF-d8',5,1,1,'',0,1,0,8),
('Punta widia d8.1 forata','PHMF-d8.1',5,1,1,'',0,1,0,8.1),
('Punta widia d8.5 forata','PHMF-d8.5',5,1,1,'',0,1,0,8.5),
('Punta widia d8.75 forata','PHMF-d8.75',5,1,1,'',0,1,0,8.75),
('Punta widia d8.8 forata','PHMF-d8.8',5,1,1,'',0,1,0,8.8),
('Punta widia d9 forata','PHMF-d9',5,1,1,'',0,1,0,9),
('Punta widia d9.6 forata','PHMF-d9.6',5,1,1,'',0,1,0,9.6),
('Punta widia d9.7 forata','PHMF-d9.7',5,1,1,'',0,1,0,9.7),
('Punta widia d9.8 forata','PHMF-d9.8',5,1,1,'',0,1,0,9.8),
('Punta widia d10 forata','PHMF-d10',5,1,1,'',0,1,0,10),
('Punta widia d10.3 forata','PHMF-d10.3',5,1,1,'',0,1,0,10.3),
('Punta widia d10.5 forata','PHMF-d10.5',5,1,1,'',0,1,0,10.5),
('Punta widia d10.75 forata','PHMF-d10.75',5,1,1,'',0,1,0,10.75),
('Punta widia d11 forata','PHMF-d11',5,1,1,'',0,1,0,11),
('Punta widia d11.8 forata','PHMF-d11.8',5,1,1,'',0,1,0,11.8),
('Punta widia d12.5 forata','PHMF-d12.5',5,1,1,'',0,1,0,12.5),

('Punta HSS d2','PHSS-d2',4,1,1,'',0,1,0,2),
('Punta HSS d2.25','PHSS-d2.25',4,1,1,'',0,1,0,2.25),
('Punta HSS d2.5','PHSS-d2.5',4,1,1,'',0,1,0,2.5),
('Punta HSS d2.75','PHSS-d2.75',4,1,1,'',0,1,0,2.75),
('Punta HSS d3','PHSS-d3',4,1,1,'',0,1,0,3),
('Punta HSS d3.25','PHSS-d3.25',4,1,1,'',0,1,0,3.25),
('Punta HSS d3.5','PHSS-d3.5',4,1,1,'',0,1,0,3.5),
('Punta HSS d3.75','PHSS-d3.75',4,1,1,'',0,1,0,3.75),
('Punta HSS d4','PHSS-d4',4,1,1,'',0,1,0,4),
('Punta HSS d4.25','PHSS-d4.25',4,1,1,'',0,1,0,4.25),
('Punta HSS d4.5','PHSS-d4.5',4,1,1,'',0,1,0,4.5),
('Punta HSS d4.75','PHSS-d4.75',4,1,1,'',0,1,0,4.75),
('Punta HSS d5','PHSS-d5',4,1,1,'',0,1,0,5),
('Punta HSS d5.25','PHSS-d5.25',4,1,1,'',0,1,0,5.25),
('Punta HSS d5.5','PHSS-d5.5',4,1,1,'',0,1,0,5.5),
('Punta HSS d5.75','PHSS-d5.75',4,1,1,'',0,1,0,5.75),
('Punta HSS d6','PHSS-d6',4,1,1,'',0,1,0,6),
('Punta HSS d6.25','PHSS-d6.25',4,1,1,'',0,1,0,6.25),
('Punta HSS d6.5','PHSS-d6.5',4,1,1,'',0,1,0,6.5),
('Punta HSS d6.75','PHSS-d6.75',4,1,1,'',0,1,0,6.75),
('Punta HSS d7','PHSS-d7',4,1,1,'',0,1,0,7),
('Punta HSS d7.25','PHSS-d7.25',4,1,1,'',0,1,0,7.25),
('Punta HSS d7.5','PHSS-d7.5',4,1,1,'',0,1,0,7.5),
('Punta HSS d7.75','PHSS-d7.75',4,1,1,'',0,1,0,7.75),
('Punta HSS d8','PHSS-d8',4,1,1,'',0,1,0,8),
('Punta HSS d8.25','PHSS-d8.25',4,1,1,'',0,1,0,8.25),
('Punta HSS d8.5','PHSS-d8.5',4,1,1,'',0,1,0,8.5),
('Punta HSS d8.75','PHSS-d8.75',4,1,1,'',0,1,0,8.75),
('Punta HSS d9','PHSS-d9',4,1,1,'',0,1,0,9),
('Punta HSS d9.25','PHSS-d9.25',4,1,1,'',0,1,0,9.25),
('Punta HSS d9.5','PHSS-d9.5',4,1,1,'',0,1,0,9.5),
('Punta HSS d9.75','PHSS-d9.75',4,1,1,'',0,1,0,9.75),
('Punta HSS d10','PHSS-d10',4,1,1,'',0,1,0,10),
('Punta HSS d10.25','PHSS-d10.25',4,1,1,'',0,1,0,10.25),
('Punta HSS d10.5','PHSS-d10.5',4,1,1,'',0,1,0,10.5),
('Punta HSS d10.75','PHSS-d10.75',4,1,1,'',0,1,0,10.75),
('Punta HSS d11','PHSS-d11',4,1,1,'',0,1,0,11),
('Punta HSS d11.25','PHSS-d11.25',4,1,1,'',0,1,0,11.25),
('Punta HSS d11.5','PHSS-d11.5',4,1,1,'',0,1,0,11.5),
('Punta HSS d11.75','PHSS-d11.75',4,1,1,'',0,1,0,11.75),
('Punta HSS d12','PHSS-d12',4,1,1,'',0,1,0,12),
('Punta HSS d12.25','PHSS-d12.25',4,1,1,'',0,1,0,12.25),
('Punta HSS d12.5','PHSS-d12.5',4,1,1,'',0,1,0,12.5),
('Punta HSS d12.75','PHSS-d12.75',4,1,1,'',0,1,0,12.75),
('Punta HSS d13','PHSS-d13',4,1,1,'',0,1,0,13)


update contraption set order_status=0 where order_status=5

delete from order_status where order_status_id=5


	insert into order_status (order_status_id, order_status_name)
	values (5,'Imprestato / in affilatura');


	insert into contraption (
	  denomination,
		id_code,
	  type,
	  machine,
	  work_material,
	  purchase_request,
	  available_qt,
	  minimum_qt,
	  order_status,
	  geometry_diameter
	)
	values
	('Fresa metallo duro d1','FHM-P-d1',9,2,1,'',0,1,0,1),
	('Fresa metallo duro d3','FHM-P-d3',9,2,1,'',0,1,0,3),
	('Fresa metallo duro d4','FHM-P-d4',9,2,1,'',0,1,0,4),
	('Fresa metallo duro d5','FHM-P-d5',9,2,1,'',0,1,0,5),
	('Fresa metallo duro d6','FHM-P-d6',9,2,1,'',0,1,0,6),
	('Fresa metallo duro d8','FHM-P-d8',9,2,1,'',0,1,0,8),
	('Fresa metallo duro d10','FHM-P-d10',9,2,1,'',0,1,0,10),
	('Fresa metallo duro d12','FHM-P-d12',9,2,1,'',0,1,0,12),
	('Fresa metallo duro d16','FHM-P-d16',9,2,1,'',0,1,0,16),

	('Fresa metallo duro d1 per inox','FHM-M-d1',9,2,1,'',0,1,0,1),
	('Fresa metallo duro d3 per inox','FHM-M-d3',9,2,1,'',0,1,0,3),
	('Fresa metallo duro d4 per inox','FHM-M-d4',9,2,1,'',0,1,0,4),
	('Fresa metallo duro d5 per inox','FHM-M-d5',9,2,1,'',0,1,0,5),
	('Fresa metallo duro d6 per inox','FHM-M-d6',9,2,1,'',0,1,0,6),
	('Fresa metallo duro d8 per inox','FHM-M-d8',9,2,1,'',0,1,0,8),
	('Fresa metallo duro d10 per inox','FHM-M-d10',9,2,1,'',0,1,0,10),
	('Fresa metallo duro d12 per inox','FHM-M-d12',9,2,1,'',0,1,0,12),
	('Fresa metallo duro d16 per inox','FHM-M-d16',9,2,1,'',0,1,0,16),




	ALTER TABLE contraption
	ADD COLUMN borrowed_qt INTEGER DEFAULT 0,



	INSERT INTO employee (employee_id, name, second_name)
	values
	(1000, 'Affilatura', '')

	INSERT INTO transaction (transaction_type, description)
	values
	('borrowing', 'Quando un aggeggio viene prestato')

	INSERT INTO transaction (transaction_type, description)
	values
	('returning', 'Quando un aggeggio viene ritornato')










;
