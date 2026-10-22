-- CreateTable
CREATE TABLE `news_articles` (
    `id` VARCHAR(32) NOT NULL,
    `headline` VARCHAR(512) NOT NULL,
    `description` TEXT NULL,
    `byline` VARCHAR(255) NULL,
    `published_at` DATETIME(3) NOT NULL,
    `url` VARCHAR(1024) NOT NULL,
    `image_url` VARCHAR(1024) NULL,
    `image_alt` VARCHAR(1024) NULL,
    `fetched_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `news_articles_published_at_idx`(`published_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
