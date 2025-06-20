INSERT INTO Users (username, email, password_hash, role) VALUES
('alice123', 'alice@example.com', 'hashed123', 'owner'),
('bobwalker', 'bob@example', 'hashed456', 'walker'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('Shaggy', 'shaggy@mysteryinc.com', 'zoinkssc00b', 'owner'),
('Bruce', 'brucewayne@wayneindustries.com', 'batman123', 'owner')

INSERT INTO Dogs (owner_id, name, size) VALUES
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Rex', 'large'),
((SELECT user_id FROM Users WHERE username = 'bobwalker'), 'Buddy', 'medium'),
((SELECT user_id FROM Users WHERE username