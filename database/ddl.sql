-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_image VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: balance
CREATE TABLE IF NOT EXISTS balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code VARCHAR(50) UNIQUE NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  service_icon VARCHAR(500),
  service_tariff NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_name VARCHAR(100) NOT NULL,
  banner_image VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('TOPUP', 'PAYMENT')),
  description VARCHAR(255),
  total_amount NUMERIC(15, 2) NOT NULL,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed: services
INSERT INTO services (service_code, service_name, service_icon, service_tariff) VALUES
('PAJAK', 'Pajak PBB', 'https://nutech-integrasi.app/dummy/icons/pajak.png', 40000),
('PLN', 'Listrik', 'https://nutech-integrasi.app/dummy/icons/listrik.png', 10000),
('PDAM', 'PDAM Berlangganan', 'https://nutech-integrasi.app/dummy/icons/pdam.png', 40000),
('PULSA', 'Pulsa', 'https://nutech-integrasi.app/dummy/icons/pulsa.png', 40000),
('PGN', 'PGN Berlangganan', 'https://nutech-integrasi.app/dummy/icons/pgn.png', 50000),
('MUSIK', 'Musik Berlangganan', 'https://nutech-integrasi.app/dummy/icons/musik.png', 50000),
('TV', 'TV Berlangganan', 'https://nutech-integrasi.app/dummy/icons/tv.png', 50000),
('PAKET_DATA', 'Paket Data', 'https://nutech-integrasi.app/dummy/icons/paket_data.png', 50000),
('VOUCHER_GAME', 'Voucher Game', 'https://nutech-integrasi.app/dummy/icons/voucher_game.png', 100000),
('VOUCHER_MAKANAN', 'Voucher Makanan', 'https://nutech-integrasi.app/dummy/icons/voucher_makanan.png', 100000),
('QURBAN', 'Qurban', 'https://nutech-integrasi.app/dummy/icons/qurban.png', 200000),
('ZAKAT', 'Zakat', 'https://nutech-integrasi.app/dummy/icons/zakat.png', 300000)
ON CONFLICT (service_code) DO NOTHING;

-- Seed: banners
INSERT INTO banners (banner_name, banner_image, description) VALUES
('Banner 1', 'https://nutech-integrasi.app/dummy/banner/Banner1.png', 'Lerem Ipsum Dolor sit amet'),
('Banner 2', 'https://nutech-integrasi.app/dummy/banner/Banner2.png', 'Lerem Ipsum Dolor sit amet'),
('Banner 3', 'https://nutech-integrasi.app/dummy/banner/Banner3.png', 'Lerem Ipsum Dolor sit amet'),
('Banner 4', 'https://nutech-integrasi.app/dummy/banner/Banner4.png', 'Lerem Ipsum Dolor sit amet'),
('Banner 5', 'https://nutech-integrasi.app/dummy/banner/Banner5.png', 'Lerem Ipsum Dolor sit amet'),
('Banner 6', 'https://nutech-integrasi.app/dummy/banner/Banner6.png', 'Lerem Ipsum Dolor sit amet')
ON CONFLICT DO NOTHING;