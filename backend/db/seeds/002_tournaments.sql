-- ============================================================================
-- 002_tournaments.sql — 4 Tournament Games (Crazy Color, Fruit Ninja, Helix Jump, Pop Piano)
-- Tournament Entry: 2 Coins per play (1 Coin Pack = 10 Coins = 10 ETB = 5 plays)
-- ============================================================================
INSERT INTO tournaments (
    id, game_id, title, title_am, cycle, type, entry_fee_coins, entry_fee_energy,
    prize_model, prize_pool_etb, prize_pool_coins, prize_tiers,
    banner_image, sponsor, entry_requirement, starts_at, ends_at, state, participants_count
) VALUES
(
    'tourney_weekly_crazy_color',
    'crazy-colors',
    'Crazy Color Grand Tournament',
    'የክሬዚ ከለር ታላቅ ውድድር',
    'weekly',
    'paid',
    2,
    0,
    'sponsored',
    25000,
    100000,
    '[
        {"rank":"1st Place","reward":"12,500 ETB Cash Prize","telebirrETB":12500},
        {"rank":"2nd Place","reward":"7,500 ETB Cash Prize","telebirrETB":7500},
        {"rank":"3rd Place","reward":"3,500 ETB Cash Prize","telebirrETB":3500},
        {"rank":"4th - 10th","reward":"250 ETB Airtime Voucher","telebirrETB":250}
    ]',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    'telebirr SuperApp Gaming',
    '2 Coins Per Play (10 ETB Pack = 5 Plays)',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    'live',
    14890
),
(
    'tourney_weekly_fruit_ninja',
    'fruit-slice',
    'Fruit Ninja Katana Championship',
    'የፍሩት ኒንጃ የካታና ሻምፒዮና',
    'weekly',
    'paid',
    2,
    0,
    'sponsored',
    20000,
    80000,
    '[
        {"rank":"1st Place","reward":"10,000 ETB Cash Prize","telebirrETB":10000},
        {"rank":"2nd Place","reward":"6,000 ETB Cash Prize","telebirrETB":6000},
        {"rank":"3rd Place","reward":"3,000 ETB Cash Prize","telebirrETB":3000},
        {"rank":"4th - 10th","reward":"200 ETB Airtime Voucher","telebirrETB":200}
    ]',
    'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=600&auto=format&fit=crop&q=80',
    'telebirr SuperApp Gaming',
    '2 Coins Per Play (10 ETB Pack = 5 Plays)',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    'live',
    12450
),
(
    'tourney_weekly_helix_jump',
    'helix-jump',
    'Helix Jump Tower Masters',
    'የሄሊክስ ጃምፕ ታወር ማስተርስ',
    'weekly',
    'paid',
    2,
    0,
    'sponsored',
    30000,
    120000,
    '[
        {"rank":"1st Place","reward":"15,000 ETB Cash Prize","telebirrETB":15000},
        {"rank":"2nd Place","reward":"9,000 ETB Cash Prize","telebirrETB":9000},
        {"rank":"3rd Place","reward":"4,000 ETB Cash Prize","telebirrETB":4000},
        {"rank":"4th - 10th","reward":"300 ETB Airtime Voucher","telebirrETB":300}
    ]',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80',
    'telebirr SuperApp Gaming',
    '2 Coins Per Play (10 ETB Pack = 5 Plays)',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    'live',
    16800
),
(
    'tourney_monthly_pop_piano',
    'pop-piano',
    'Pop Piano Grand Virtuoso Cup',
    'የፖፕ ፒያኖ ግራንድ ቨርቹኦሶ ዋንጫ',
    'monthly',
    'paid',
    2,
    0,
    'sponsored',
    50000,
    250000,
    '[
        {"rank":"1st Place","reward":"25,000 ETB Cash Prize","telebirrETB":25000},
        {"rank":"2nd Place","reward":"15,000 ETB Cash Prize","telebirrETB":15000},
        {"rank":"3rd Place","reward":"7,000 ETB Cash Prize","telebirrETB":7000},
        {"rank":"4th - 20th","reward":"500 ETB Airtime Voucher","telebirrETB":500}
    ]',
    'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=600&auto=format&fit=crop&q=80',
    'EthioTelecom / telebirr Digital',
    '2 Coins Per Play (10 ETB Pack = 5 Plays)',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days',
    'live',
    24500
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    game_id = EXCLUDED.game_id,
    entry_fee_coins = EXCLUDED.entry_fee_coins,
    entry_fee_energy = EXCLUDED.entry_fee_energy,
    prize_pool_etb = EXCLUDED.prize_pool_etb,
    state = EXCLUDED.state;
