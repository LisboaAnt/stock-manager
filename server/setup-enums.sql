-- Script para criar os tipos ENUM necessários
-- Execute este script ANTES de executar o sql.txt principal

BEGIN;

-- Criar tipo ENUM para movimento
DO $$ BEGIN
    CREATE TYPE movement_type AS ENUM ('ENTRY', 'EXIT', 'ADJUSTMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tipo ENUM para role de usuário
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'OPERATOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Habilitar extensão para UUID (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

COMMIT;

