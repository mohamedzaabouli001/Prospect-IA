-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: prospect_ia
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaigns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(255) NOT NULL,
  `campaign_objective` varchar(50) NOT NULL,
  `business_type` varchar(100) NOT NULL,
  `target_industry` json NOT NULL,
  `target_company_size` json DEFAULT NULL,
  `target_geography` varchar(255) NOT NULL,
  `offer_type` varchar(50) NOT NULL,
  `product_category` varchar(50) DEFAULT NULL,
  `product_name` varchar(100) NOT NULL,
  `product_description` text NOT NULL,
  `product_benefits` text NOT NULL,
  `product_usp` varchar(255) NOT NULL,
  `product_pricing` varchar(50) DEFAULT NULL,
  `product_url` varchar(255) DEFAULT NULL,
  `target_job` text NOT NULL,
  `target_seniority` json DEFAULT NULL,
  `target_department` json DEFAULT NULL,
  `persona_pain_points` text NOT NULL,
  `persona_motivations` text,
  `persona_objections` text,
  `decision_maker` varchar(20) DEFAULT NULL,
  `scraping_sources` json NOT NULL,
  `contact_methods` json NOT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `google_maps_location` varchar(255) DEFAULT NULL,
  `other_source_url` varchar(255) DEFAULT NULL,
  `message_style` varchar(50) NOT NULL,
  `message_tone` varchar(50) NOT NULL,
  `call_to_action` varchar(50) NOT NULL,
  `company_background` text,
  `success_stories` text,
  `social_proof` text,
  `urgency_factor` varchar(255) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `daily_limit` int NOT NULL,
  `follow_up_sequence` tinyint(1) DEFAULT NULL,
  `follow_up_delay` int DEFAULT NULL,
  `follow_up_number` int DEFAULT NULL,
  `test_mode` tinyint(1) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `ix_campaigns_id` (`id`),
  CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES (1,'kjflkjf','lead_generation','kljlkj','[\"tech\"]','[\"1-10\"]','lklkjlk','digital_product','saas','knlknl','knlklk','llknlk','lklkj','free','lklkjkl.com','kl,mlkjmk','[\"C-level\"]','[\"Executive\"]','lkmkjkm','lknlkn','lknlkj','decision_maker','[\"google_maps\"]','[\"email\"]','','rest','lkjmkjmkj','direct','professional','meeting','mlkmljlk','lknlk','lknlk','lkjklj','2025-06-05','2025-11-05',11,0,0,0,1,'pending','2025-05-06 14:01:19','2025-05-06 14:01:19',1),(2,'creation des site web ','lead_generation','salle gym','[\"tech\"]','[\"1-10\"]','france','service','agency','creation de site web ','description ','gain temps','rapidité','free','lklkjkl.com','directeur','[\"Director\"]','[\"Executive\"]','monthly payment sucbscrbtion','','','decision_maker','[\"google_maps\"]','[\"email\"]','','salle gym','','direct','professional','meeting','','','','','2025-05-20','2025-05-30',11,0,0,0,1,'pending','2025-05-20 10:11:15','2025-05-20 10:11:15',1);
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-21  9:49:07
