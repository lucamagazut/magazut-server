
ALTER TABLE contraption
ADD COLUMN borrowed_qt INTEGER DEFAULT 0;

INSERT INTO employee (employee_id, name, second_name)
values
(1000, 'Affilatura', '');

INSERT INTO transaction (transaction_type, description)
values
('borrowing', 'Quando un aggeggio viene prestato');

INSERT INTO transaction (transaction_type, description)
values
('returning', 'Quando un aggeggio viene ritornato');
