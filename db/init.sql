-- phpMyAdmin SQL Dump
-- version 4.9.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Feb 19, 2025 at 11:41 AM
-- Server version: 5.7.26
-- PHP Version: 7.3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `myguideon`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `categories_name` varchar(255) NOT NULL,
  `categories_parent_id` int(11) DEFAULT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `categories_name`, `categories_parent_id`, `description`, `image`) VALUES
(44, 'Afrique', NULL, 'c\'est un continent', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `destination`
--

CREATE TABLE `destination` (
  `id` int(11) NOT NULL,
  `basic_info` text NOT NULL,
  `gallery` text,
  `activity` text,
  `pratical_info` text,
  `imageCover` varchar(2000) DEFAULT NULL,
  `activities` text,
  `culture` text,
  `info` text,
  `historical` text,
  `author` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `destination`
--

INSERT INTO `destination` (`id`, `basic_info`, `gallery`, `activity`, `pratical_info`, `imageCover`, `activities`, `culture`, `info`, `historical`, `author`) VALUES
(42, '{\"destinationName\":\"Maldives - The Tropical -Paradise\",\"language\":\"portuguese\",\"budget\":\"400€\",\"currency\":\"USD\",\"status\":\"Published\",\"address\":\"Luanda, Province de Luanda, Angola\",\"imgpath\":\"/public/uploads/0/meteo/1739393979886.png\",\"categories\":\"Antigua and Barbuda\",\"lon\":\"13.2439512\",\"lat\":\"-8.8272699\"}', '[\"/public/uploads/destination/gallery/1739473249968-9074196b-6014-4df0-807f-586c58010420.jpg\",\"/public/uploads/destination/gallery/1739473249968-8f03baa8-396e-47c2-84fb-6cfc88ac53e8.jpg\",\"/public/uploads/destination/gallery/1739598887543-115e7b33-de3d-40f4-97ec-e58bd273fb53.jpg\",\"/public/uploads/destination/gallery/1739598906714-23719436-feaa-49d8-a461-edac9cfd2395.png\",\"/public/uploads/destination/gallery/1739634111495-07676752-bdee-4c61-aaaa-df06beef6a91.jpg\",\"/public/uploads/destination/gallery/1739634155785-7ed99fd8-474a-4bea-985c-d65f1cc7ce7f.jpg\",\"/public/uploads/destination/gallery/1739634216690-0b0fea43-9132-4878-8871-90be68460a29.jpg\",\"/public/uploads/destination/gallery/1739634330833-9e3b7318-a5a3-48fc-aa0c-b4109e9c2843.jpg\",\"/public/uploads/destination/gallery/1739803675458-7d3ca5cf-1cea-43c8-8104-f984560281f4.jpg\",\"/public/uploads/destination/gallery/1739803675459-9cea9b10-b295-4bde-9e8b-cfd9cb73c3e4.jpg\",\"/public/uploads/destination/gallery/1739803675461-658399a5-4259-4ba2-b97b-f18fd4dc7ebe.jpg\",\"/public/uploads/destination/gallery/1739803675462-18846d5c-7ae0-4019-ad13-3759e8c26989.jpg\",\"/public/uploads/destination/gallery/1739803675463-0785e1bf-e067-4a11-80f4-ded9b9020b1c.jpg\",\"/public/uploads/destination/gallery/1739803675463-f6774e11-23f3-4acc-9fd8-7a1da36a454d.jpg\"]', NULL, NULL, '/public/uploads/destination/gallery/1739473249968-9074196b-6014-4df0-807f-586c58010420.jpg', NULL, NULL, NULL, NULL, '17'),
(45, '{\"destinationName\":\"check langue\",\"language\":\"portuguese\",\"budget\":\"200€\",\"currency\":\"USD\",\"status\":\"Published\",\"address\":\"Por, Creto, Pieve di Bono-Prezzo, Comunità delle Giudicarie, Province de Trente, Trentin-Haut-Adige, 38085, Italie\",\"imgpath\":\"/public/uploads/45/meteo/1739648109786.jpg\",\"categories\":\"Antigua and Barbuda\",\"lon\":\"10.6484344\",\"lat\":\"45.9398797\"}', '[\"/public/uploads/destination/gallery/1739648062452-915d9c68-8dfc-4107-81c8-38e88b0b57e0.jpg\",\"/public/uploads/destination/gallery/1739648062453-57abd652-2246-4e3a-a3c2-4e7e6e1b663a.jpg\",\"/public/uploads/destination/gallery/1739648062453-62fe71dc-0ca5-46fa-9069-fdd9a5030503.jpg\",\"/public/uploads/destination/gallery/1739648062454-14f1e406-2199-4343-9f8b-5c78b982d1ff.jpg\",\"/public/uploads/destination/gallery/1739648062454-85fdd0f8-fc5a-4e34-8acc-3d822fbad44e.jpg\",\"/public/uploads/destination/gallery/1739648062454-9a3d8f7d-045c-4a0c-a328-b651618555df.jpg\",\"/public/uploads/destination/gallery/1739648062454-a2b88467-7246-4292-859b-c7ab3ac5cd98.jpg\",\"/public/uploads/destination/gallery/1739648448692-d32b3c6e-b90a-4133-81f5-bf50b55d3fd4.jpg\",\"/public/uploads/destination/gallery/1739648496578-81121767-ed24-48ca-91b1-391e50750259.jpg\",\"/public/uploads/destination/gallery/1739648496580-148c3a93-427f-4522-a386-50a3863780fb.jpg\",\"/public/uploads/destination/gallery/1739648496580-23a04f16-def6-4648-95e1-6b92ef0a351e.jpg\",\"/public/uploads/destination/gallery/1739648496580-fad030c4-b2f2-4836-b091-b9d9dd2fe472.jpg\",\"/public/uploads/destination/gallery/1739648496581-6a5e2b45-1e05-478b-8102-c502338e4cd7.jpg\",\"/public/uploads/destination/gallery/1739648496581-beb6949e-2a90-466c-9058-eef2146b7868.jpg\",\"/public/uploads/destination/gallery/1739648496581-17430d77-1426-4519-a772-64e9a35c3b4f.jpg\",\"/public/uploads/destination/gallery/1739648496581-13c08cf1-4aac-4b12-956b-c17e423bc471.jpg\"]', NULL, NULL, '/public/uploads/destination/gallery/1739648062452-915d9c68-8dfc-4107-81c8-38e88b0b57e0.jpg', NULL, NULL, NULL, NULL, '17'),
(46, '{\"destinationName\":\"last\",\"language\":\"portuguese\",\"budget\":\"200€\",\"currency\":\"USD\",\"status\":\"Published\",\"address\":\"Paris, Île-de-France, France métropolitaine, France\",\"imgpath\":\"/public/uploads/45/meteo/1739648537781.jpg\",\"categories\":\"Antigua and Barbuda\",\"lon\":\"2.3200410217200766\",\"lat\":\"48.8588897\"}', '[\"/public/uploads/destination/gallery/1739649048059-29d490bc-f4bd-41ff-ad0c-6f74a041a9b3.jpg\",\"/public/uploads/destination/gallery/1739649048059-c3a14819-04e0-40b9-9cfe-3366f583843f.jpg\",\"/public/uploads/destination/gallery/1739649048060-9ebb7280-5ffc-4df7-89fc-b7a516dd5761.jpg\",\"/public/uploads/destination/gallery/1739649048060-41a1e8f1-8e24-4daa-bf7a-6aa5c5a2de7f.jpg\",\"/public/uploads/destination/gallery/1739649048060-23d430f9-c174-4870-a92c-30daf1e47eba.jpg\",\"/public/uploads/destination/gallery/1739649048060-1d8dcb88-0359-4c61-962c-49353b8804cc.jpg\",\"/public/uploads/destination/gallery/1739649048060-32008fdd-939a-48fb-9f39-9a41cbf201d7.jpg\",\"/public/uploads/destination/gallery/1739649048060-703e92f9-f8cf-4a73-a74f-a4ca8565109e.jpg\"]', NULL, NULL, '/public/uploads/destination/gallery/1739649048059-29d490bc-f4bd-41ff-ad0c-6f74a041a9b3.jpg', NULL, NULL, NULL, NULL, '17');

-- --------------------------------------------------------

--
-- Table structure for table `equipes`
--

CREATE TABLE `equipes` (
  `id` int(11) NOT NULL,
  `name` varchar(500) DEFAULT NULL,
  `permissions` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `equipes`
--

INSERT INTO `equipes` (`id`, `name`, `permissions`) VALUES
(4, 'admin', '[1,2,3,4,5,6,7,8,9,10,11]'),
(6, 'Admin destination', '[1,11]'),
(7, 'Activity Admin', '[11,10,9,8,7]');

-- --------------------------------------------------------

--
-- Table structure for table `things_to_do`
--

CREATE TABLE `things_to_do` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `adress` varchar(500) NOT NULL,
  `destination_id` varchar(500) DEFAULT NULL,
  `description` text NOT NULL,
  `logintude` varchar(500) CHARACTER SET utf8mb4 DEFAULT NULL,
  `icon` text NOT NULL,
  `gallery` text NOT NULL,
  `destination_name` varchar(500) NOT NULL,
  `lant` varchar(500) DEFAULT NULL,
  `category` varchar(500) DEFAULT NULL,
  `status` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `things_to_do`
--

INSERT INTO `things_to_do` (`id`, `name`, `adress`, `destination_id`, `description`, `logintude`, `icon`, `gallery`, `destination_name`, `lant`, `category`, `status`) VALUES
(15, 'promenade', 'Paris, France métropolitaine, France', '35', 'done test', 'undefined', '1737754033047-187852615.jpg', '[\"1737754033050-709592763.jpg\"]', 'luanda', 'undefined', 'NATURE & ADVENTURE', 'Published');

-- --------------------------------------------------------

--
-- Table structure for table `user_admin`
--

CREATE TABLE `user_admin` (
  `id` int(11) NOT NULL,
  `name` varchar(500) NOT NULL,
  `email` varchar(500) NOT NULL,
  `password` text,
  `avatar` varchar(500) DEFAULT NULL,
  `profil_id` varchar(500) DEFAULT NULL,
  `reset_code` varchar(500) DEFAULT NULL,
  `isfirsttime` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_admin`
--

INSERT INTO `user_admin` (`id`, `name`, `email`, `password`, `avatar`, `profil_id`, `reset_code`, `isfirsttime`) VALUES
(17, 'red', 'eabizimi@gmail.com', '$2b$10$A5Ks/VcLR5Z/xZiaQOybJOqXYYbOezmQ6iudlF05HmioimE7Z60eq', 'https://cdn.pixabay.com/photo/2023/06/23/11/23/ai-generated-8083323_1280.jpg', '4', NULL, NULL),
(29, 'jean', 'eabizimisd@gmail.com', '$2b$10$H9G5Aob91v1I7hmNIkw17OS2WbdB.BmRf7nqlvLaRFNbEeHcipHIq', 'https://cdn.pixabay.com/photo/2023/06/23/11/23/ai-generated-8083323_1280.jpg', '4', NULL, 'yes');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `destination`
--
ALTER TABLE `destination`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `equipes`
--
ALTER TABLE `equipes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_admin`
--
ALTER TABLE `user_admin`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `destination`
--
ALTER TABLE `destination`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `equipes`
--
ALTER TABLE `equipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_admin`
--
ALTER TABLE `user_admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;
    