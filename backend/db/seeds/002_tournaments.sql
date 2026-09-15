-- ============================================================================
-- 002_tournaments.sql — 6 Core Weekly & Monthly Live Tournaments
-- ============================================================================
INSERT INTO tournaments (
    id, game_id, title, title_am, cycle, type, entry_fee_coins, entry_fee_energy,
    prize_model, prize_pool_etb, prize_pool_coins, prize_tiers,
    banner_image, sponsor, entry_requirement, starts_at, ends_at, state, participants_count
) VALUES
(
    'tourney_weekly_candy_cup',
    'candy-blast',
    'Candy Crush Walia Weekend Cup',
    'የከረሜላ ክረሽ ዋሊያ የሳምንት መጨረሻ ዋንጫ',
    'weekly',
    'free',
    0,
    1,
    'sponsored',
    15000,
    80000,
    '[
        {"rank":"1st Place","reward":"7,500 ETB Cash Prize","telebirrETB":7500},
        {"rank":"2nd Place","reward":"4,500 ETB Cash Prize","telebirrETB":4500},
        {"rank":"3rd Place","reward":"2,000 ETB Airtime Voucher","telebirrETB":2000},
        {"rank":"4th - 20th","reward":"100 ETB Airtime Voucher","telebirrETB":100}
    ]',
    'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=600&auto=format&fit=crop&q=80',
    'EthioTelecom Gaming Cup',
    'Open to All Players',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    'live',
    14890
),
(
    'tourney_weekly_color_rush',
    'color-rush',
    'Color Rush Sprint Cup',
    'የቀለም ሩጫ ስፕሪንት ዋንጫ',
    'weekly',
    'free',
    0,
    1,
    'sponsored',
    12000,
    60000,
    '[
        {"rank":"1st Place","reward":"6,000 ETB Airtime Voucher","telebirrETB":6000},
        {"rank":"2nd Place","reward":"3,500 ETB Airtime Voucher","telebirrETB":3500},
        {"rank":"3rd Place","reward":"1,500 ETB Airtime Recharge","telebirrETB":1500}
    ]',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    'EthioTelecom Youth Pack',
    'Open to All Players',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    'live',
    11420
),
(
    'tourney_weekly_world_legends',
    'world-legends',
    'Word Legend Heritage Challenge',
    'የቃላት አርበኛ የቅርስ ፈተና',
    'weekly',
    'free',
    0,
    1,
    'sponsored',
    18000,
    90000,
    '[
        {"rank":"1st Place","reward":"8,000 ETB Grand Cash Prize","telebirrETB":8000},
        {"rank":"2nd Place","reward":"5,000 ETB Cash Prize","telebirrETB":5000},
        {"rank":"3rd Place","reward":"2,500 ETB Airtime Voucher","telebirrETB":2500}
    ]',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80',
    'EthioTelecom Digital Services',
    'Open to All Players',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    'live',
    9340
),
(
    'tourney_monthly_piano',
    'pop-piano',
    'Pop Piano Grand Virtuoso',
    'የፖፕ ፒያኖ ታላቁ ቨርቹኦሶ ውድድር',
    'monthly',
    'free',
    0,
    1,
    'sponsored',
    40000,
    200000,
    '[
        {"rank":"1st Place","reward":"20,000 ETB Cash Prize + 3 Mo 5G","telebirrETB":20000},
        {"rank":"2nd Place","reward":"12,000 ETB Cash Prize","telebirrETB":12000},
        {"rank":"3rd Place","reward":"5,000 ETB Airtime Voucher","telebirrETB":5000}
    ]',
    'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=600&auto=format&fit=crop&q=80',
    'EthioTelecom Music Pass',
    'Open to All Players',
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '15 days',
    'live',
    16800
),
(
    'tourney_monthly_hill_summit',
    'hill-rider',
    'Hill Climb Highland Summit Championship',
    'የተራራ መውጣት የደጋ ጫፍ ሻምፒዮና',
    'monthly',
    'free',
    0,
    2,
    'sponsored',
    50000,
    250000,
    '[
        {"rank":"1st Place","reward":"25,000 ETB Grand Prize + 6 Mo 5G Unlimited","telebirrETB":25000},
        {"rank":"2nd Place","reward":"15,000 ETB Grand Prize + 3 Mo 5G Unlimited","telebirrETB":15000},
        {"rank":"3rd Place","reward":"7,000 ETB Prize + 1 Mo 5G Unlimited","telebirrETB":7000},
        {"rank":"4th - 50th","reward":"300 ETB Airtime Voucher","telebirrETB":300}
    ]',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80',
    'EthioTelecom 5G Ultra',
    'Open to All Players (2 Energy)',
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '15 days',
    'live',
    22450
),
(
    'tourney_monthly_pop_balloon',
    'archery-strike',
    'Pop Ballon National Championship',
    'የፊኛ መበሳት ብሔራዊ ሻምፒዮና',
    'monthly',
    'free',
    0,
    1,
    'sponsored',
    35000,
    180000,
    '[
        {"rank":"1st Place","reward":"18,000 ETB Grand Cash Prize","telebirrETB":18000},
        {"rank":"2nd Place","reward":"10,000 ETB Cash Prize","telebirrETB":10000},
        {"rank":"3rd Place","reward":"5,000 ETB Airtime Voucher","telebirrETB":5000}
    ]',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    'EthioTelecom 5G Network',
    'Open to All Players',
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '15 days',
    'live',
    18200
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    prize_pool_etb = EXCLUDED.prize_pool_etb,
    state = EXCLUDED.state;
