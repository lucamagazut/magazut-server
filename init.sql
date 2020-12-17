
ALTER TABLE transaction
ADD COLUMN it_short_description varchar(30) DEFAULT 'descrizione';

update transaction
set it_short_description='Caricato'
where transaction_id=1;

update transaction
set it_short_description='Scaricato'
where transaction_id=2;

update transaction
set it_short_description='Errore app (avvisare Luca)'
where transaction_id=0;

update transaction
set it_short_description='Creazione'
where transaction_id=3;

update transaction
set it_short_description='Modifica'
where transaction_id=4;

update transaction
set it_short_description='Cancellazione'
where transaction_id=5;

update transaction
set it_short_description='Prestato'
where transaction_id=6;

update transaction
set it_short_description='Ritornato'
where transaction_id=7;


CREATE TABLE borrowed_contraption (
	borrowed_contraption_id SERIAL PRIMARY KEY not null,
	employee_id INTEGER REFERENCES employee(employee_id) DEFAULT 0,
	contraption_id INTEGER REFERENCES contraption(contraption_id) DEFAULT 0,
	qt_to_return INTEGER DEFAULT 0
);

INSERT INTO transaction (transaction_id ,transaction_type, description, it_short_description)
values
(8, 'sharpening', 'Quando un aggeggio viene prestato a utente affilatura', 'Da affilare'),
(9, 'broken', 'Quando un aggeggio viene rotto', 'Utensile rotto');


CREATE TABLE allowed_ip (
	allowed_ip_id SERIAL PRIMARY KEY not null,
	allowed_ip_value varchar(30) DEFAULT ''
);
