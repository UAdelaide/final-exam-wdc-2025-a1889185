INSERT INTO Users (username, email, password_hash, role) VALUES
('alice123', 'alice@example.com', 'hashed123', 'owner'),
('bobwalker', 'bob@example', 'hashed456', 'walker'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('shaggy123', 'shaggy@mysteryinc.com', 'zoinkssc00b', 'owner'),
('bruce123', 'brucewayne@wayneindustries.com', 'batman123', 'owner')

INSERT INTO Dogs (owner_id, name, size) VALUES
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
((SELECT user_id FROM Users WHERE username = 'shaggy123'), 'Scooby', 'large'),
((SELECT user_id FROM Users WHERE username = 'bruce123'), 'Ace', 'medium'),
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Min', 'medium')

INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
((SELECT dog_id FROM Dogs WHERE name = 'Max' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')), '2025-06-10 08:00:00', 30)