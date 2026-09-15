-- ============================================================================
-- 001_game_scoring_rules.sql — 18 Catalog Games Scoring & Par Bounds
-- ============================================================================
INSERT INTO game_scoring_rules (game_id, max_score, max_score_per_second, min_duration_sec, max_duration_sec) VALUES
    ('candy-blast', 400, 1500, 5, 3600),
    ('color-rush', 400, 800, 5, 3600),
    ('world-legends', 400, 600, 5, 3600),
    ('pop-piano', 400, 1000, 5, 3600),
    ('hill-rider', 400, 500, 5, 3600),
    ('archery-strike', 400, 700, 5, 3600),
    ('pop-balloon', 400, 900, 5, 3600),
    ('memory-match', 400, 400, 5, 3600),
    ('puzzle-block', 400, 300, 5, 3600),
    ('soccer-shooter', 400, 600, 5, 3600),
    ('bubble-shooter', 400, 500, 5, 3600),
    ('solitaire', 400, 200, 5, 3600),
    ('dama', 400, 150, 5, 3600),
    ('knife-madness', 400, 800, 5, 3600),
    ('royal-water-sort', 400, 400, 5, 3600),
    ('sorting-balls', 400, 350, 5, 3600),
    ('emoji-sorting', 400, 450, 5, 3600),
    ('soccer-ping-pong', 400, 600, 5, 3600)
ON CONFLICT (game_id) DO UPDATE SET
    max_score = EXCLUDED.max_score,
    max_score_per_second = EXCLUDED.max_score_per_second;
