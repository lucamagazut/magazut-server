ALTER TABLE contraption_type
DROP COLUMN tokens;

Insert into contraption_type (contraption_type_id, name)
values (14,'Maschio hss manuale');

Insert into contraption_type (contraption_type_id, name)
values (15,'Maschio x macchina');


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
('Maschio a mano M2','MHSS-M2',14,1,1,'',2,4,1,2),
('Maschio a mano M2.5','MHSS-M2.5',14,1,1,'',10,4,1,2.5),
('Maschio a mano M3','MHSS-M3',14,1,1,'',2,4,1,2),
('Maschio a mano M4','MHSS-M4',14,1,1,'',14,4,1,4),
('Maschio a mano M5','MHSS-M5',14,1,1,'',13,4,1,5),
('Maschio a mano M6','MHSS-M6',14,1,1,'',16,4,1,6),
('Maschio a mano M8','MHSS-M8',14,1,1,'',15,4,1,8),
('Maschio a mano M10','MHSS-M10',14,1,1,'',16,4,1,10),
('Maschio a mano M12','MHSS-M12',14,1,1,'',4,4,1,12),
('Maschio a mano M14','MHSS-M14',14,1,1,'',2,4,1,14),
('Maschio a mano M16','MHSS-M16',14,1,1,'',0,3,0,16),
('Maschio a mano M18','MHSS-M18',14,1,1,'',0,3,0,18),
('Maschio a mano M20','MHSS-M20',14,1,1,'',3,4,1,20),

('Maschio x macchina M3','MHSSM-M3',15,1,1,'',7,4,1,3),
('Maschio x macchina M4','MHSSM-M4',15,1,1,'',0,4,0,4),
('Maschio x macchina M5','MHSSM-M5',15,1,1,'',10,4,1,5),
('Maschio x macchina M6','MHSSM-M6',15,1,1,'',13,4,1,6),
('Maschio x macchina M8','MHSSM-M8',15,1,1,'',9,4,1,8),
('Maschio x macchina M10','MHSSM-M10',15,1,1,'',14,4,1,10),
('Maschio x macchina M12','MHSSM-M12',15,1,1,'',11,4,1,12),
('Maschio x macchina M14','MHSSM-M14',15,1,1,'',0,4,0,14),
('Maschio x macchina M16','MHSSM-M16',15,1,1,'',5,4,1,16);
