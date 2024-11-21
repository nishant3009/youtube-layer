-- CreateTable
CREATE TABLE `user_info` (
    `id` INTEGER NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `password` VARCHAR(45) NOT NULL,
    `name` VARCHAR(45) NULL,
    `login_time` DATETIME(0) NOT NULL,
    `last_logged` DATETIME(0) NOT NULL,

    UNIQUE INDEX `id_UNIQUE`(`id`),
    UNIQUE INDEX `email_UNIQUE`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
