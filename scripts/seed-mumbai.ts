/**
 * CAREMESH PMS — Mumbai Real Data Seed Script
 * Source: MUMBAI.xlsx
 * Run: npx ts-node scripts/seed-mumbai.ts
 * Only inserts Areas and Clinics. All other data unchanged.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TENANT_ID = 'e727eb86-cd40-487a-b651-1db925c58376';

const areas: { id: string; name: string; clinics: { id: string; name: string; address: string | null }[] }[] = [
  {
    id: "3389c39b-2996-475c-afd6-9cf808e299d3",
    name: "Airoli",
    clinics: [
      { id: "448cf5ed-00a3-407b-a316-cc6c489bbe9e", name: "Apple Hospital", address: "Shree Gurudutta Complex Co-op Society, Plot NO.44,45 and 46 , Sector 8, Airoli" },
      { id: "1c45f92c-c5bc-477c-b180-a9a3a50f2009", name: "Asha Hospital & Iccu", address: "101 to 103, Ground Floor, A Wing, Asiatic Society, Plot No. 134, Near Sahakar Bazaar, Sector 4, Airoli" },
      { id: "442033fe-a50e-43e6-89de-9b6dfc129afc", name: "Avadhoot Hospital & Iccu", address: "Plot No.29, Sec-19, Navi Mumbai" },
      { id: "ace6885d-b1d2-4269-b827-757d37abb02d", name: "Criti Care Iccu Multispeciality & Trauma Centre", address: "Plot No 2A Swami Sainath Complax Sector 16 Airoli New Mumbai" },
      { id: "a9a66e84-fd69-4a29-a41e-fc9237ea35f5", name: "Dr Jadhav Hospital", address: "Near Durgamata Mandir, Sector-4, Airoli-Navi Mumbai" },
      { id: "48fb3fdf-75e5-43b5-807a-dfb5254e0fdc", name: "Heritage Hospital", address: "PLOT NO 6A ,SEC 6,AIROLI," },
      { id: "36251341-164d-443c-9ce8-51617091d63a", name: "Indravati Hospital", address: "Sec-3, Near Bus Stop" },
      { id: "17869a3d-d199-434a-b666-55eaaae3a342", name: "Mody Hospital & Icu", address: "Plot No. 1, 2 & 3, Sector 2, Airoli" },
      { id: "cf3d8a0f-4124-4441-bc12-1422df7e7cf1", name: "New Bombay Hospital", address: "First floor, B-Wing, Mahavir Plaza, Sector 19, Near Gaidevi Maidan, Airoli, Navi Mumbai" },
      { id: "c77bb38f-86d5-4ebb-8b2d-341daf66a697", name: "New Medanta Hospital", address: "Plot No 04/A, Sector-1, Near Airoli Naka, Airoli, Navi Mumbai" },
      { id: "b4fbc554-a3e6-49e2-b579-341f280e65ab", name: "Sai Seva Hospital & Iccu", address: "Row House B 1 Sec-4, Opp Cidco Wgt Tank, Airoli, Navi Mumbai" },
      { id: "8881dfba-8441-4bd7-999d-967d4fd547ed", name: "Sanjivani Hospital", address: "Rajkamal Bldg, 1st Floor, Opp Bus Depot, Sector -3 ,Airoli" },
      { id: "9993d789-9213-40c0-88e2-3f8b01c2aa41", name: "Shree Eye Hospital", address: "Sector  3 ,14, National CHS, Behind Airoli Bus Depot" },
      { id: "6bc88a5d-8a78-40ee-8f50-74f04de945a9", name: "Suruchi Eye Centre", address: "B-2, Asiatic Coop H Soc, Sec-4, Near Max Mall, Airoli" },
    ],
  },
  {
    id: "9a75346d-f61a-493b-9ad2-adadbc0d517c",
    name: "Ambedkar Marg",
    clinics: [
      { id: "1dbe3e64-ac34-4a4b-b167-c6b87568cc28", name: "Dr Prabhakar Patwardhan Smruti Rugnalaya", address: "196/1, Dr Babasaheb Ambedkar Marg, Near Maitri Diagnostic Centre, Near Life Line Hospital , Panvel" },
    ],
  },
  {
    id: "935d95a2-ce62-493d-a896-b660f259b623",
    name: "Ambernath",
    clinics: [
      { id: "fb094144-ecc1-4f2d-b618-341d61ffd313", name: "Aditya Nursing Home", address: "Plot No.27, Kansai Section, Near Gajanand Maharaj Mandir, Ambernath" },
      { id: "fb175e9d-d824-41aa-9f09-e5c428d64bce", name: "Jiyas Multispeciality And Maternity Hospital", address: "Fernandes Castle, Opp. Fatima High School, Ambernath West Thane" },
    ],
  },
  {
    id: "aec5ac51-afe0-4882-ac74-867b5f8cf3f2",
    name: "Ambernath (E)",
    clinics: [
      { id: "aedbc9d2-7ddf-4ed3-acee-02a93d5e56a8", name: "Bijankur Multispeciality Hospital", address: "Near Anand Park, Navare Nagar Road, Ambernath ( E )" },
      { id: "0796c110-bfb3-42bd-9d63-fea3384beb58", name: "Dr Shah Eye & Laser Centre", address: "Aasra Appartment, Plot No. 33, Next to Rupee Co-op Bank, Near Station Road" },
    ],
  },
  {
    id: "bc4a2ff4-3628-4bec-8298-3084d81df8a0",
    name: "Andheri",
    clinics: [
      { id: "c34d7cd3-d20e-4d1c-81fa-8bf705f87483", name: "Aggarwal Eye Hospital", address: "102/5, Ketayun Mansion, Shahaji Raje Marg, Above T" },
      { id: "e93160cb-871a-4092-9189-af651a94f688", name: "Kokilaben Dhirubhai Ambani Hospital", address: "Four Bunglows, Lokhandwala" },
      { id: "1efd94fd-2cb3-4bb9-b465-753a5b675531", name: "Medicare Hospital", address: "MAROL METRO STATION, SIR M.V.ROAD, MAROL, ANDHERI EAST, MUMBAI-400059" },
      { id: "c59aa682-c667-4c43-92b7-fafcb6fbe05b", name: "Mukund Maternity & Surgical Nursing Home", address: "Mukund Nagar CHS, Marol, Andheri-Kurla Road, Andheri" },
      { id: "07173885-9369-4d83-864c-e83f0fa63a5b", name: "Paramount General Hospital & Iccu", address: "1st & 2nd FLOOR  Laxmi Commerical Premises Saki Naka Junction" },
      { id: "54af7046-e305-4806-8f76-00c3932cbf1e", name: "Patel Nursing Home", address: "B, Vishal Apartment, Sir M V Road, Andheri (E)" },
      { id: "0dc37d34-534e-4899-a1a9-62da15db3d1c", name: "R G Stone Urology & Laparoscopy ( Andheri (w)c", address: "C Wing Dhananjay APT , behind Balaji Studio Off Veera Desai road ,Andheri (W)400059" },
      { id: "dc28822d-9aae-426f-8915-12b1777bdaa3", name: "Sanjeevani Mamta Hospital & Research Center", address: "11, Nityanand Nagar, Sahar Rd, Andheri -E,Mumbai - 69" },
      { id: "aa910d4d-79d9-4c9f-bb8f-08f79c8ae0bd", name: "Sevenhills Healthcare Private Limited", address: "Marol-Maroshi Road, Andheri (E)" },
      { id: "b1ca5825-a0bd-4ae3-b54a-2fb0f34adbf0", name: "STH Hospitals Pvt Ltd", address: "G- ABHISHEK APARTMENTS JUHU VERSOVA LINK ROAD ANDHERI WEST MUMBAI" },
      { id: "9ad5a4aa-842c-4a09-97dc-23ab49eec73d", name: "Suman Eye Clinic & Surgery Centre", address: "B/103, Suman Apartment, 3rd Cross Lane, Lokhandwala Complex, Andheri (W)" },
      { id: "4401488c-9b83-4be7-9b2f-532848222a98", name: "World Gastroentrology Institute (wgi)", address: "Amboli Naka, Next to ICICI Prudential Andheri West" },
    ],
  },
  {
    id: "139922c7-5682-4f17-84b2-650429525d54",
    name: "Andheri (E)",
    clinics: [
      { id: "8761eb43-0c94-4d92-b693-11fcabc3442c", name: "Axon Hospital", address: "A-Wing, 5th Floor, Pranik Chembers, Sakinaka Junction, Andheri (E)" },
      { id: "831a8de7-b3ed-499f-9119-89557c163cc1", name: "Criticare Multispecialty Hospital & Research Center", address: "CTS 516, Telly Gally, Near SBI SME Branch, Andheri (E)" },
      { id: "13f44047-278c-4424-8113-428589f068ce", name: "Kiran Care & Cure Pvt. Ltd.", address: "Sankalp (Ground Floor), Mistry Complex, Nr. Jankal, Andheri (E)" },
      { id: "44d125a5-a9b8-48c8-9e34-1a7de909aa57", name: "Nakshatra Multispeciality Hospital Llp", address: "Grace Plaza,  Opp Arena House, Road No.12, MIDC,Opp Gold finch Hotel, Andheri (E)" },
    ],
  },
  {
    id: "af682bbc-ae22-4faa-b583-865b24fe3299",
    name: "Andheri (W)",
    clinics: [
      { id: "92f720e6-64f8-449e-a2f7-ea88d8dec00e", name: "Aastha Nursing Home", address: "10, Narsimha Niwas, 2nd Floor, Near Daud Baug, 126 JP Road, above Punjabi Ghasitaram Halwai, Andheri West , Mumbai" },
      { id: "ea78e7ac-aff8-4cc1-b415-204e401e555a", name: "Ananda Hospital", address: "1st & 2nd Floor, Krimson Amboli Park Bldg, Next to Corporation bank, Andheri (W)" },
      { id: "4eaa7e01-78c0-4e9c-afa0-7bda8de10063", name: "Criticare Multi Speciality Hospital & Research Centre", address: "Plot No 38/39, Opp. Copper Chimney, Opp Juhu Supreme shopping centre,main gulmohar road, JVPD scheme,andheri" },
      { id: "7161d02e-c591-4a88-b08c-3d9af048bf6b", name: "Sujay Hospital", address: "25, Gulmohar Park, Gulmohar Road,Juhu Scheme, Vile Parle( west)" },
    ],
  },
  {
    id: "d3323196-1d55-4d3b-91a5-8d9653d3cbe8",
    name: "Antop Hill",
    clinics: [
      { id: "c623d74a-c9cd-49b8-a114-24991b68b6e1", name: "Galaxy Multispeciality Hospital", address: "B- Wing, Anand Heights, S.M.D Road, Antop Hill, Wadala" },
    ],
  },
  {
    id: "0f4eda01-908f-4105-9d05-38ad6ed3d9d4",
    name: "Badlapur (E)",
    clinics: [
      { id: "2878dc38-3c76-4c44-b745-5867c28d0c17", name: "Dhanvantri Hospital Pvt Ltd", address: "Thakkar Plaza, Ground Floor, Opp:Swami Vivekanand, Badlapur (E)" },
      { id: "2b501bf7-9161-4a21-91c9-0424f2d8437f", name: "Matrix Multi Speciality Hospital", address: "Opp Andhra Bank, Near Ambedkar Chowk, TV Tower, Badlapur (E), Thane" },
    ],
  },
  {
    id: "782c5bc5-7ada-4076-84c3-b81565b86fc8",
    name: "Badlapur (W)",
    clinics: [
      { id: "95d235fa-8d7c-4e0c-91c4-4ba7eaffa0b7", name: "Bhagwati Healthcare Private Limited", address: "Plot No.2, Rameshwadi Badlapur (W)" },
      { id: "68ebdee4-b34e-48c5-a529-0228348f95dd", name: "Rathod Hospital", address: "201 & 202, Motibhai Tower, Opp Badlapur West Railway Stn. Near Vaishali Theater, Badlapur (W)" },
      { id: "b74bc9fb-d180-4599-a865-68425716998a", name: "Saikripa Surgical & Maternity Hospital", address: "1st floor, E Wing, Shiv Shanti Complex, Next S.T. Depot, Badlapur (W)" },
    ],
  },
  {
    id: "3e682ab5-f9a2-42eb-9f67-f85d4f23a75d",
    name: "Badlapur East",
    clinics: [
      { id: "195f5a91-e5ba-45be-8177-94e81f172ce5", name: "Sfurti Hospital", address: "Station Road, Kulgaon Badlapur (E)Dist :- Thane" },
    ],
  },
  {
    id: "682eef46-0b9c-4bb3-8d3a-2e79dd84ee2c",
    name: "Bandra (W)",
    clinics: [
      { id: "cf287465-e546-4291-a59f-3ed0d01c9d96", name: "Shanti Nursing Home And Multispeciality Hospital", address: "First Floor, blue Flame Apartment, Above Kondor International, S.V.Road, Bandra (W)" },
    ],
  },
  {
    id: "f81cd4cc-7689-46a4-a6f1-cfe249508d58",
    name: "Behind CIDCO Office",
    clinics: [
      { id: "44c0ec79-3e00-4a9f-a0a7-41b8f5f4c484", name: "Prism Eye Institute & Research Centre Llp", address: "Pl No 63 Sector 1 (S), Behind CIDCO Office New Panvel" },
    ],
  },
  {
    id: "206f91fe-6efa-4443-bbf7-61c2da3cb724",
    name: "Behind Hp Petrol Pump",
    clinics: [
      { id: "f6153ba6-6a41-46f4-8415-5b4067dfd18b", name: "Shivam Eye Foundation", address: "Sec - 25, Plot No.14, , Opp Seawood/Darave Railway Station" },
    ],
  },
  {
    id: "62dbacab-d665-4557-879d-bb049d60f1e4",
    name: "Bhandup (W)",
    clinics: [
      { id: "b5dbe015-706d-44aa-b2ce-6fadb7e71621", name: "Badwaik Maternity General Hospital", address: "LBS Marg, Jain mandir , Bhandup (west)" },
      { id: "11f794f2-376a-4fd6-8689-1c5fab0e3f8b", name: "Bhalanetra Superspeciality Eye Hospital", address: "Commercial Unit 5-8, Sachdeva Complex, Jangal Mangal Road, Opp Old Post Office, Bhandup (W), Thane" },
      { id: "4b05039f-a728-44f9-9f6e-ea9500a64a1a", name: "Bhandup Criticare Hospital", address: "1St Floor, Sahjeevan Heights, Near Kokan Nagar Bus Stop, Beside Dmk Jaoli Bank, Kokan Ngr , Bhandup West , Mumbai" },
      { id: "eab34818-3cdb-4778-a40f-77292fdd135b", name: "Bhavsar Nursing Home & Iccu", address: "Shop No 27/ 31, Ground Floor, Sky City Retail , Lake Road, Opp Bhandup Police Station, Bhandup (W)" },
      { id: "578aa4c5-0a28-492c-9550-33e9a54977ae", name: "Dr Bhatia Multispecilaity Hospital", address: "Shraddha Bhandup Village Road, Bhandup (W)" },
      { id: "1a4af042-ab9b-4b79-bc1c-b791baac90f4", name: "Dr Bhatias Ruby Hospital", address: "1st Floor, Arunoday Tower, SPS Marg, Kokannagar" },
      { id: "8e8e3706-2666-4869-a748-94808346847d", name: "Dr Bothras Hospital", address: "Ramkrishna Apartments, Gadhav Naka, Bhandup (W)" },
      { id: "fff7d87d-67ec-4705-8665-fe8743dae94e", name: "Dr Malwankars Romeen Nursing Home", address: "Gr. Floor, Goutam Dham, Gaodevi road, Bhandup (W)" },
      { id: "fd8ee0d0-5b76-44f7-8bcb-ad2f8032d867", name: "Dr Meenas Multispeciaity Hospital", address: "10/B  Miniland Tank Road Near Shivaji Talav, Bhandup(W)" },
      { id: "5fccab77-010e-4fe3-843f-929de7936106", name: "Dr Thakurs Ent Clinic", address: "100-A, R.R.Realty, Tank Road, off LBS Marg, Opp Dream Mall, Bhandup (W)" },
      { id: "61fd7d0d-de88-4812-97a4-e6bf2dd8734f", name: "Janaki Global Hospital", address: "Anmaol Garden, Malaga Road, Pisavali" },
      { id: "fa5b81d8-98b9-4dc6-b7b8-24673591b63b", name: "Krishna Nursing Home", address: "Neha Apts., LBS Marg, Bhandup (W)" },
      { id: "3ed6d78d-e901-4e35-95fc-757987b1c37f", name: "Lotus Multispeciality Hospital", address: "Shop No.1, 2 & 3, Sathyam Apartment Dutta Mandhir Road, Village Road, Bhandup West, Mumbai" },
      { id: "8395cdd0-ea5c-4bc7-af6f-3c6e6edfe16a", name: "Madhu Polyclinic & Nursing Home", address: "Mini Apts Opp Sarvodaya Nagar J M Road, Bhandup(W)" },
      { id: "d6d8c8fa-4772-456b-a2cd-2cef89b45c03", name: "Manishas Sparshad Nursing Home", address: "D-wing, 1st & 2nd Floor, Saishrutsti Bldg, Adj Shangrila Biscut Company, Opp Bharat Pertrol Pump, L.B.S.Marg, Bhandup West" },
      { id: "623833b9-5389-4a8f-9ae8-d0dc42f3c672", name: "Navkaar Hospital", address: "Lal Bahadur Shastri Marg, next to Varanda banquets, Bhandup, Bhandup West, Mumbai, Maharashtra 400078" },
      { id: "79650af6-6035-4bd3-b6c0-a6a0f436ecd2", name: "Padmani Nursing Home & Iccu", address: "110 First Floor, R.R.Realty, Above Axis Bank, Tank road. LBS Marg, Bhandup (W)" },
      { id: "acd19220-63dc-4313-993a-53f25275e37d", name: "Rathod Nursing Home", address: "Shiv Sagar Complex, Plot B, A Wing, T P Road" },
      { id: "75540eaa-9cb4-4b03-aa7b-856aab41ffeb", name: "Sanjeevani Nursing Home And Icu", address: "1st Floor, Neha Annexe, Khot Road, Near Madhuban Garden, Bhandup (W)" },
      { id: "0a4af081-d5f2-4ee7-8ef6-aa4b378553c6", name: "Shah Children Hospital & New Born Care Centre", address: "A-Wing Arunoday Tower Kotan Nagar Opp Jaoli Bank J" },
      { id: "bb545bf4-9c4c-4532-91c8-e99a07123e3c", name: "Shettys Endoscopic Surgical Centre - Samarth Orthocare", address: "12A, Miniland, Tank Road, Bhandup West, Mumbai, Maharashtra" },
      { id: "8274af54-cbf0-42ca-9580-afcf194343e9", name: "Shri Bal Chikitsalaya", address: "14-A, Miniland, Tank Road, Bhandup (W)" },
      { id: "aad0db5d-82b0-4456-8d2b-72f1d8f9ca0b", name: "Srushti Orthotech Hospital", address: "R R Realty 1st Floor, Junction of LBS Road & Tank Road" },
      { id: "966423a4-a45d-4d59-b8ce-6b5744a64725", name: "Sulochan Eye Hospital", address: "7/6r.R. point Grount Floor Off LBS Marg  opp dreams mall bhandup (W)" },
      { id: "ca009f82-24be-46ae-9c38-9c234773d920", name: "Theji Hospital", address: "B-103, 1st Floor, Aniraj Tower CHS Ltd, LBS Marg, Bhandup(W)" },
      { id: "e1a40533-7133-441b-91d3-61343707f67e", name: "Vardhaman Hospital & Iccu", address: "Sheetal Apt B Wing J M Road Opp Shiv Sena  Shakha Bhandup (W)" },
      { id: "f73973ad-8ac1-4858-a679-0dff0a7a92c5", name: "Yashadaa Hospital", address: "119-125 Sky City Retail, First Floor, Opposite Bhandup Police Station Lake Road, Bhandup (W), Mumbai" },
    ],
  },
  {
    id: "5a35d61d-6171-4663-a429-f5e074b35582",
    name: "Bhayander",
    clinics: [
      { id: "20232ea1-5645-452b-bea1-596f1940c9b3", name: "Ravi Surgical Nursing Home", address: "`B Kedarnath 60 Ft Road, Devchand Nagar, Opp : 52" },
    ],
  },
  {
    id: "7227069f-d12a-4e98-bb31-ba9d1aea80a3",
    name: "Bhayander (E)",
    clinics: [
      { id: "2de1ac6b-0e7c-497d-b442-a6cc193bcd5e", name: "Ansh Hospital", address: "Shop No1T07,1 St Floor,Visheshwar Tower, Annapurna Estate Indralok Phase-10, A-Wing, Navghar, Bhaiandar(East)" },
      { id: "6159b62a-d1f6-4c8f-b57c-57e31f30dfd0", name: "Ashirwad Maternity & General Hosital", address: "Samir Apartment, Sector K-7, (A), Jesal Park, Bhayander (E)" },
      { id: "be8dfa3b-c127-4b8c-935b-5fc08d90a65c", name: "Chirayu Medical Foundation", address: "Ground Floor, Vimal Deeep ,Sarvoday paradies, Behind Balaji Hospital, Mira Bhayander Road" },
      { id: "a8b2b795-b6d0-4bc6-97c1-99584a58a076", name: "Gurukrupa Hospital & Polyclinic", address: "Savitri Apt, B P Road, Opp. Khashi Bhavan, Bhayander (E)" },
      { id: "e78cced7-df23-4032-aede-5f349c77cb05", name: "New Saiganga Hospital", address: "101, Pandurang Krupa ,Near Hanuman Temple, Navghar Road, Bhayander (E)" },
      { id: "fb06c706-f579-41e8-bab2-9600043d5c8c", name: "Padmawati Maternity & Nursing Home", address: "215/216, Oswal Oronote, 2nd Floor, Opp Jain Temple, Jesal Park, Bhayander (E)" },
      { id: "74bab0bc-7554-4c9e-badd-3e734dc2eac8", name: "Sai Aashirwad Hospital", address: "101/104, A wing, Ratnadeep building, navghar road, Bhayander (E)" },
      { id: "e53ccd8b-cbcf-4100-b02d-b36f567ac5f3", name: "Sai Vedant Multispeciality  Hospital", address: "Cabin Cross Road, Near East West Public Bridge, Opp Prem Sagar Baker, Bhayander East" },
      { id: "33416a6f-0112-4628-af3e-76bba667137d", name: "Saibaba Hospital & Polyclinic", address: "Shivshradha Complex, 1st Floor, B P Road, Bhayander (E)" },
      { id: "5254e4ed-2d11-44d6-b9fd-20a6522b7d03", name: "Shalom Medicare Pvt Ltd", address: "behind indralok phase vi,opp. Raj classic ,bhayander e thane 05" },
      { id: "ce80b013-8972-4990-99d5-60b56c49bf1a", name: "Shree Siddhivinayak Hospital & Tanishka Polyclinic", address: "B/6, Prasanna Park Housing Society, Navghar Road, Behind Manish-Apartment, Near Venus Shiv Mandir, Bhayander (E), Thane" },
    ],
  },
  {
    id: "a03d102a-b3d9-46bf-b87f-6e7619a3277f",
    name: "Bhayander (W)",
    clinics: [
      { id: "7a70b81d-0c22-49a2-a200-bd46e7c64b0f", name: "Dhanvantari Hospital", address: "Radha Govind park, Near Police Station Bhayander West" },
      { id: "b37bb3d3-8f61-49f4-8990-9a60bc3f169e", name: "Infigo Eye Care Hospital", address: "1001, First Floor, C-Wing Janaki Heritage, Opp. Maxus Mall, Bhayander (W), Thane" },
      { id: "b5eaa5d1-f224-4c2b-8892-4f60b4df68a2", name: "Kamla Eye And Maternity Home", address: "A, G-4 Indra Complex, 60 Feet Road, Bhyander (W)" },
      { id: "5198259d-1d31-4a99-8858-b5ce6f9d4664", name: "Kkasturi Medicare Pvt Ltd", address: "1 Harshniketan, Gaondevi Road, Behind Navrang, Bhayander (W)" },
      { id: "6c754bd1-b529-4d84-9b4c-613f03962974", name: "Mira Bhayander Institute For Reproductive Assistance", address: "Plot No 568/1 Near Sacasar Susiness Park 150 Feet Cross Road Bhayander" },
      { id: "90e43445-6560-45b8-9d68-9f1369e28457", name: "Nakoda Hospital", address: "Nageshwar Park, Devchand Nagar, 60 Feet Road, Bhayander (W)" },
      { id: "03d36eb2-3e33-4061-8f03-81c26c9bfcda", name: "Neel Orthopedic Superspeciality Hospital", address: "1st floor Sheetal Niketan Co-op Hsg School Opp Hum video NR Sai baba hospital,Bhayander," },
      { id: "5f9122ef-83ee-45b6-874b-c33b5728ea21", name: "Ram Lok Ent Hospital", address: "Shree Sai Mahal Building, 1st Floor, Opposite Post Office, Fatak Road, Bhayander (W), Thane" },
      { id: "34f1b81e-de55-4d75-8084-e8d5f18b135d", name: "Sanjeevani Eye Hospital  Llp", address: "First Floor, Virandvan, Salasar CHS, Opp Maxus Mall, 150 Feet Road, Bhayander (W)" },
    ],
  },
  {
    id: "dce07b3b-ca87-4f14-8e48-54ff6752fbe3",
    name: "Bhiwandi",
    clinics: [
      { id: "76c86335-e860-4813-9a75-ae582ba174cb", name: "Dhange Hospital", address: "29, Thana Road, Near Mandai, Auto Stand, Bhiwandi, Thane" },
      { id: "def299a7-a701-4278-9c15-9e39062d2a5c", name: "Life Line Multispeciality Hospital", address: "1St Floor, Jyoti Apertment, Opp. Tata Amantra, Kalyan-Bhiwandi Bypass Road, Bhiwandi" },
      { id: "3d7124fd-23a6-4e0d-a31b-4ab49b55eb50", name: "Orange Hospital", address: "A-205, Telipada, Near Dhamankar Naka, Near City Center Mall, Bhiwandi, Thane" },
      { id: "65a81ed5-49ab-4e52-ac29-23b7da3f1324", name: "S S Hospital And Research Center", address: "Pavanputra Enclave, Opp Jain Temple, Thane Bhiwandi Road -Thane" },
      { id: "9766b665-e8b6-406d-9c6d-469f013d101b", name: "Shree Sai Dutt Multispeciality Hospital", address: "Wada Bhiwandi Road Ambadi\\\\nTaluka Bhiwandi district Thane" },
    ],
  },
  {
    id: "d89ba8c8-d600-42f9-8de9-565bd1fd2280",
    name: "Borivali",
    clinics: [
      { id: "7cabab78-db7b-4cd9-a3f7-66777edbefeb", name: "Apex Hospitals", address: "Vaishali Heights, Near Standard Chartered & Thane Sahakari Bank, Chandavakar, Borivali (W)" },
      { id: "3186cd1a-2b52-47ed-8cc3-77460e7a2688", name: "Asian Eye Institute & Laser Centre Pvt Ltd", address: "101, Satya Narayan Apt, Opp. G H School, Opp MG Road" },
      { id: "9417edd9-509c-4bc0-9572-0633e78d661c", name: "Bhagat Nursing Home Conducted By Sun Superspeciality Hospital", address: "Ganesh Nivas, 2nd Floor, Pai Nagar, Ganjawala Lane, Borivali(W)" },
      { id: "de01ea8c-b0fc-4278-95e5-3d7fb18d3743", name: "Mohit Hospital", address: "C-Koyna, Shantivan Complex, Near National Park, Bo" },
      { id: "19cacb3a-653e-4dcd-8a32-3063f9467a3d", name: "Phoenix Hospitals Pvt Ltd", address: "CTS 374 B21 Padma nagar Chikuwadi Borivali W" },
      { id: "ad9cc981-922d-4b70-b0ee-5d0374ba09e0", name: "Riddhi eye clinic", address: "104/B.S.B. Apartment rai dongri, carter road: No." },
      { id: "8b79651d-0f7d-4f44-b4af-29f74ad532da", name: "Shree Ganesh Multi Speciality Hospital", address: "Bina Apt, Near Damodar Medical , L.T.Road, Vazira Naka, Borivali West" },
      { id: "d9287ec2-5754-41ac-9c42-b5f98557b908", name: "Shree Krishna Hospital", address: "Plot No 161, Shree Krishna Nagar, Near Sona Theatre" },
    ],
  },
  {
    id: "2ed07817-f7e3-4df6-8419-41113de51fe0",
    name: "Borivali (E)",
    clinics: [
      { id: "9b6a01b6-4c70-4f37-bd60-9ad46e0f9c82", name: "Aakanksha Maternity & Nursing Home", address: "301/401/501, Navkar Bhavan, CTS 2532/1, Near Ram Mandir,Road No.7, Daulat Nagar, Borivali (E), Mumbai" },
      { id: "1c9d5085-2385-4225-ac56-0f5d06b44e33", name: "Apex Multispeciality Hospitals", address: "Off Western Express Highway, Dattapada Road, Next to Susawat Restaurent , Borivali East - 400066" },
      { id: "c42be5cf-42b8-47ac-bf10-837e39faea6e", name: "Contacare Eye Hospital", address: "Ambrosia Building, DeviPada, Western Express Highway , Near Magathane Bus Depot, Borivali (E), Mumbai" },
      { id: "0a1520c5-d06c-45a2-a24c-86de022df5af", name: "Mehta Nursing Home", address: "101, Rite Golden Creast, Opp Hanuman Temple, Daulat Nagar, Borivali (E)" },
      { id: "1d3bf66b-3f4c-4c0b-b170-2018ecfb82c4", name: "Moc Hospital", address: "1st floor, Khodiyar Apartments, Daulat Nagar, Road No. 6, Mumbai" },
      { id: "dd43d6be-8333-400f-9ed9-61a78a0ac491", name: "Narendra Hospital", address: "Kasturba Road 5, Borivali (E)" },
      { id: "e16c4267-4df8-4718-a794-28753ea8f13b", name: "National Hospital", address: "Matru ashish Bldg , Next To Madhav Hall, M.G. Road,  Borivali (E)" },
      { id: "5139e91d-0dcb-426d-ba99-3169a29270c0", name: "Purnima Hospital", address: "Road No.8, Daulat Nagar, Borivali East , Mumbai" },
      { id: "169c92fe-5630-4970-8a2a-844aafaf7a90", name: "Sunshine Hospital", address: "Amita Apartment,C-Wing,1st floor,opp Rahul Electronics,Main Carter Road, & Carter Road No.5,Borivali-East. Mumbai" },
    ],
  },
  {
    id: "859c8638-d946-433f-b077-3df71ead3a8c",
    name: "Borivali (W)",
    clinics: [
      { id: "8d1a39b5-f511-468e-b9a4-400675cf1dee", name: "Apex Superspeciality Hospitals Pvt Ltd", address: "Babhai Naka, L T Road, Besides Punjab and Sindh Bank Opp Damodar Chemist, Near Babhai Fish Market, Borivali (W)" },
      { id: "5f8bfc65-e391-412d-a191-f75e43d0f0c3", name: "Arihant Eye Care Hospital", address: "B - 104, Gomti Apts, Above Mandpeshwar Hospital, Borivali (W)" },
      { id: "8cd14973-8f86-473c-b7fb-6a000e2c18e9", name: "Dhanashri Hospital", address: "Sidhivinayak Tower, Natakwala Lane, Near Collector Office, Borivali (W)" },
      { id: "a241cdd6-41b0-4a0b-b3d4-34e5e8e8bad9", name: "Hcg Apex Cancer Hospital", address: "Holy Cross Road, Borivali -Dahisar Link Road , Opp Café Coffee day, IC Colony, Borivali (W)" },
      { id: "aabfe4f1-7840-4135-9492-a6fdeb70da52", name: "Phoenix Hospitals", address: "1st Floor, Poonam Residency 2 CHSL, Holy Cross Road, IC Colony, Borivali (W), Mumbai 400092" },
      { id: "851bf6de-e85e-4390-9c0a-9331bce9ed97", name: "Sailee Hospital & Diagnostic Centre", address: "Prathmesh Horizon, New M.H.B. colony, New link road, Near Don Bosco School Borivali (W), Mumbai" },
      { id: "ec7ed215-63e1-411f-84df-ac6913a2fc76", name: "Shree Ganesh Nursing Home", address: "FF 001, Ship India, Vishwa Ganga Building, Bhagwati Hospital lane, Borivali (W), Mumbai" },
    ],
  },
  {
    id: "8ef5e02f-eb8f-4f1b-9953-6f2c35ae0d06",
    name: "Byculla",
    clinics: [
      { id: "b54fd065-11e5-41b7-af9e-4ed8a8b8600b", name: "Balaji Heart Hospital And Diagnostic Centre Pvt Ltd", address: "Victoria Road, Cross Lane III, Byculla (E), Mumbai" },
      { id: "519a2728-b2ea-437b-864a-78d5f9e595ff", name: "Masina Hospital Trust", address: "Sant Savta Mali Marg, Near Gloria School, Near Byculla Railway Station (East), Mumbai- 400027, Maharashtra" },
    ],
  },
  {
    id: "6615b93e-e066-426a-bd72-0c7e52996d3e",
    name: "CBD Belapur",
    clinics: [
      { id: "75186405-7475-4b77-907d-3ebfcb097703", name: "Acharya Shri Nanesh Hospital", address: "Plot No 34 37, Sector 8A,  Artist Colony, CBD Belapur" },
    ],
  },
  {
    id: "6d8f5fcb-4f6c-4ead-b2e7-90fe54c88dda",
    name: "Chembur",
    clinics: [
      { id: "8bd9cd35-4ac3-4561-a6f9-3a5f10b27b08", name: "ACME Hospital", address: "3RD AND 4TH FLOOR, SIGNATURE BUSINESS PARK, POSTAL COLONY, NEAR MONO RAIL STATION, CHEMBUR" },
      { id: "1031d960-651c-43b5-8f5a-f12e310a7af0", name: "Apex Kidney Care", address: "C/o Sushrut Hospital Swastik Park 2nd Floor 365 Chembur ( E )" },
      { id: "6f814f04-48ac-49c6-8ee5-6f926a47ab3a", name: "Apollo Spectra Hospitals A Unit Of Apollo Specialty Hospitals Pvt Ltd", address: "Near Sunder Baug Opp Panal Bus Depot Borla Village" },
      { id: "e5d2cdd8-08a7-48bc-9660-5edf5fe24ecd", name: "Disha Nursing Home", address: "A Wing, Amul Commercial Premises,1st Road, Chembur(E), Mumbai" },
      { id: "b9470c86-79e3-4693-a2c9-4ba48d5e744c", name: "Dr Das Hospital & Iccu", address: "2/3/4th Floor, Gagangiri, 18th Road(Near Dr Ambedkar Garden)" },
      { id: "78f25839-e1a2-4e9f-987e-be517f6870e1", name: "Dr Rane Hospital (p) Ltd", address: "37, Dhan Laxmi Appt. Road No. 2, Pestom sagar Road, Chembur shopper stop" },
      { id: "ef341b13-71f6-4cbc-a9d0-139052522949", name: "Dr. Agarwals Healthcare Ltd. (Name changed-Aayush Eye clinic)", address: "1st Floor, Signature Business Park, Postal Colony Road, Chembur,Mumbai-400071" },
      { id: "d0f2edcd-1319-4fa4-be2f-e3e4567a542f", name: "Inlaks General Hospital", address: "Inlaks Hospital Road, Chembur Colony" },
      { id: "1e6d6ab5-01a1-47e2-b7ef-00605a8f15ed", name: "Kolekar Hospital And Icu", address: "2nd and 3rd Floor, Onparkash Arcade, Ambedkar Garden , Chembur" },
      { id: "fd6ecb4c-9be5-4549-921b-1ff6c9c5be64", name: "Shiv Polyclinic And Nursing Home", address: "16, Premnivas, Laxmi Colony, Mahul Road, Near Ashish Theater" },
      { id: "f4293753-2d8c-4e66-a289-2da0f7f985b7", name: "SRV Hospital", address: "Opposite Lokmanya Tilak Terminus Dr. Mandakini Parihar Marg Tilak Nagar Chembur-400089" },
      { id: "ead20718-76ea-4918-88e8-b12c3103d5ea", name: "Surana Sethia Hospital & Research Centre", address: "Suman Nagar Sion Trombay Rd , opp Corporate Park" },
      { id: "5f3f7e34-4248-4166-8d1f-a5a9a44d92ec", name: "Surya Children's Medicare Pvt Ltd", address: "Shrikant Chambers II, V N Purav Marg, Chembur East, Mumbai 400 071" },
      { id: "4fd536bb-c6ea-4dd1-a1af-0f858c358b8d", name: "Sushrut Hospital & Research Centre", address: "365 Swastik Park, Chembur (E)" },
      { id: "8b7b079a-74d6-4a10-bc6c-445699332447", name: "Zen Multispeciality Hospital", address: "Plot No.425, 10th Road, Chembur" },
    ],
  },
  {
    id: "3608f7b7-d68c-4f42-b857-2b6ab45160b2",
    name: "Chunabhatti (E)",
    clinics: [
      { id: "2ebe3310-edea-47b1-a1d2-1e6e11dc0642", name: "Dalvi Nursing Home", address: "Aditya Heritage Apartments Frist Floor Shop 1Bv.N Puran Marg, Chunabhatti(E)" },
    ],
  },
  {
    id: "27e81406-7c0a-41bb-a953-87a3c4e1ba89",
    name: "Colaba",
    clinics: [
      { id: "16049b5a-c4c5-49c6-83d9-549cafd7cf9e", name: "HCG ICS KHUBCHANDANI CANCER CENTRE", address: "Maharshi Karve Rd, Nariman Point" },
    ],
  },
  {
    id: "3f1b0db0-9209-45eb-8978-0cf9520fe78c",
    name: "Colaba Causeway",
    clinics: [
      { id: "df6e073f-9686-400d-84e2-82eedf568a20", name: "Kataria Eye Clinic", address: "102/103, Kartar Bhawan, Above Central Bank of India" },
    ],
  },
  {
    id: "f708bc1e-1c36-419a-bbe4-748672638212",
    name: "Dadar",
    clinics: [
      { id: "031ff295-6e1a-42c0-a04a-3fe7a189955c", name: "Nirmal Nursing Home", address: "Gokul, First Floor, 93 Ranade Road, Shivaji Park,dadar" },
    ],
  },
  {
    id: "b0ed52d9-812f-492c-8665-d83ca82939cd",
    name: "Dahisar",
    clinics: [
      { id: "76ba08b4-66dc-4170-bd0c-53d6e96ed8cc", name: "Crystal Hospital Ltd", address: "Wamanrao Sawant Road, Near Ram Krishna Hotel, Maratha Colony, Dahisar (E)" },
      { id: "2fc80f30-aacd-460d-8f35-65a1e65ee1a3", name: "Namita Polyclinic And Hospital", address: "Ganga Shalimar building,Navyug nagar,S.V.Road,Dahisar(E)," },
    ],
  },
  {
    id: "d5f4f62f-2cba-40a5-9c9f-b783b347a27e",
    name: "Dahisar (E)",
    clinics: [
      { id: "75998abf-dea9-49e4-8550-3887be0f632e", name: "Aashapuri Hospital", address: "A-101 To 104, Chamunda Apartment, Sangodkar Nagar, Ravalpada, Off.Western Express Highway, Dahisar (E) Mumbai" },
      { id: "d7eff291-da3d-4557-a9e9-b31c0731c4b9", name: "Anand Maternity And Nursing Home", address: "135 new Link Road, Near Sharda Gram, Dahisar Subway, Dahisar (E)" },
      { id: "11ad0eab-b722-440c-9bd6-684581fa0c91", name: "Ashok One Hospital", address: "Sadguru Heights -1, Ashok One Dahisar East, Above TJSB Bank, Dahisar (E)" },
      { id: "79b1eb53-5e40-476b-94dc-458d3c568019", name: "Pragati Multispeciality Hospital", address: "Sai Vaibhave Bldg, First Floor, Near Mulgaonkar Hospital, R.J. Road, Dahisar (E)" },
      { id: "2d9dffda-6d4a-4647-b236-069e4c148e18", name: "Rohit Nursing Home", address: "Meher Co-operative Hsg Soc.,4 Shanti Nagar, S V Road, Dahisar(E)" },
    ],
  },
  {
    id: "cbf52194-789c-4b19-a779-668586460290",
    name: "Dahisar (W)",
    clinics: [
      { id: "9ea8c2c1-f888-4df7-90de-6016ca903698", name: "Shree Arihant Eye Care Centre", address: "101-102, Shree Shivam CHS,Raghunath Mhatre Road,Raghunath Mhatre Road,Dahisar(w), Mumbai-68." },
    ],
  },
  {
    id: "13b414fe-70fb-4425-b9e7-7b31eee3884f",
    name: "Dharavi",
    clinics: [
      { id: "340e2979-4674-44d7-b377-3731abe737c9", name: "Sai Hospital", address: "G 1st, 2nd, & 3rd Floor At Mashia Islampura CHS.Ltd. Behind Sion Hospaital Near Dharavi police Station, 90 Feet Road" },
    ],
  },
  {
    id: "fc5e9a0e-466d-43f6-bac2-6f4a99b11b6d",
    name: "Dhokali Naka",
    clinics: [
      { id: "5c364ef8-9a42-4ef5-b578-60895a574ba9", name: "Phoenix Hospital And Icu", address: "First Floor, Siddhivinayak Annesx, Shruti park Bus Stop, Dhokali Naka, Thane (W)" },
    ],
  },
  {
    id: "cae115ec-92ec-4095-87b7-44fbd54cee21",
    name: "Dombivli (E)",
    clinics: [
      { id: "b1337912-a6b2-4f81-8081-eb25ed5da5ca", name: "Aarogyam Multispeciality Hospital & Icu", address: "Shripat Smruti Bulding 1st Floor star Colony In front of bank of baroda Dombivali (E)" },
      { id: "a77cd92e-4557-4b4e-a5d4-cf47954a466a", name: "Amrut Hospital & Endoscopy Clinic", address: "Dr Rajendra Prasad Road, Tilak Nagar" },
      { id: "fc0397ef-2450-49c4-bb60-b230facff1d9", name: "Anil Eye", address: "The signature, Ganesh Mandir Road , opp Dedhia Bhavan Dombivli ( East )" },
      { id: "b1d737c9-e80b-48cd-b3d2-2578328b01f7", name: "Anish Hospital", address: "3/4 Grd Floor Piyush Co Op Hsg Pandurang Wadi 1st Lan Manpada Road Dombivali (E)" },
      { id: "32d9459e-19d4-4aa5-b37b-e65a9b45ba44", name: "Apple Hospital", address: "GROUND FLOOR SANVI CHS GHANSHAM GUPTE RD DOMBIVLI WEST" },
      { id: "597bde42-c784-49cc-9791-20e01ff1b74d", name: "Apple Hospital Nx", address: "SPECIA ARACDE 1ST AND 2ND FLOOR ABOVE TIP TOP PLAZA DOMBIVLI EAST" },
      { id: "c99bc011-b5cc-452f-8918-f0dc995e5453", name: "Contacare Eye Hospital", address: "Jaykul Arcade, Above Raymond Showroom, Second Floor, Dombivali (E), Thane" },
      { id: "3464fbb1-1ed4-4571-800f-a88a3c478c2d", name: "Dandekar Hospital", address: "B-135, Kasturi Plaza, Manpada Road, Dombivali (E)" },
      { id: "dc079f81-6efb-4992-ac0b-4415a42b3625", name: "Disha Diabetes & Kidney Care Hospital", address: "2Nd Floor, Sonal Business Park, Above Mc Donald'S Restaurant, Gharda Circle, Dombivli East" },
      { id: "3f83cec8-b937-486b-9c7d-0b310d1bfbd0", name: "Gokhale Orthopedic Centre", address: "Globe Arcade, RP-112, Near Ganesh Mandir Road, MIDC, Dombivali(E)" },
      { id: "6baccdf5-d0e1-4a84-855d-2d5580abd9c0", name: "Icon Hospital Pvt Ltd", address: "Manpada Road, Mahaveer Nagar Corner" },
      { id: "37f2d218-c356-410c-97ef-919994805c89", name: "Ishwar Hospital", address: "1st flr, Sunder apt., Dr. R.P.Road Ramnagar, Dombivli (East)" },
      { id: "01bd25c3-2f11-434a-8662-0babfeb8b15a", name: "J K Women Hospital", address: "Maitri Raghukul, Bhagat singh path, Opp Saraswat Bank, Dombivli (E)" },
      { id: "72eb064a-6187-49e7-8450-8d5e39af1da3", name: "Koparde Hospital", address: "1st Floor, Ashutosh Apt, Kalyan Road, Dombivli (E)" },
      { id: "6d151402-3132-4e6f-8c8c-e9045a1f028e", name: "Kusum Maternity Childrens & General Hospital", address: "Sadguru Arcade, 1st Floor, Near HDFC Bank, Opposite Modern Cafe, Phadke Cross Road , Dombivli (E), Thane" },
      { id: "5ec06a64-c4e1-43f6-806c-2f0e342466e8", name: "Manasvi Spine And Ortho Care", address: "First floor, Sai Plaza, Near Tilak Post office, Dr.R P Road, Dombivali (E), Thane" },
      { id: "a6132b22-44b6-426e-b1b9-b18bc4519945", name: "Nahar Multispeciality Hospital", address: "KASURI-ASHISH 2ND FLOOR, NEAR VYANKATESH PETROL PUMP" },
      { id: "3cfe7329-c0f4-4e60-bc1d-262ccade1194", name: "Neptune Superspeciality Hospital", address: "Jai Hanuman Plaza Opp DNS Bank Shankara Nagar Kalyan- Shill Road Sonarpada" },
      { id: "032e62f2-2bdd-4867-b1fa-c66959afd01b", name: "Noble Hospital", address: "First Floor, Sant Sawata Mali, Bhaji mandai, Opp Pooja Madhuban Theater, Dombivali(E)" },
      { id: "af6b5ee9-db08-4235-984e-abbbd4611aa9", name: "Nulife Hospital", address: "Balkrishna Apt, Rajandraprasad Road,  Opp. Tilak Nagar Post  office , Dombivli (E)" },
      { id: "36cd187b-5567-4722-898a-0f4bd9dbeb3c", name: "Om Hospital & Polyclinic & Icu", address: "1st Floor Commerce Centre, Above United Western Bank, Ram Nagar, Tandon Road" },
      { id: "c03dcf7c-6af2-4a4c-8661-7db79f091530", name: "Optilife Multispeciality Hospital", address: "Opp Shivaji Udyog nagar Police Chowky, GB Patharli, Near Manpada Road, Dombivali(E)" },
      { id: "0947fd3e-6683-4455-b156-b6725bf1eecd", name: "Orion Multispeciality Hospital", address: "Nirmal Chhaya Chs, Opp Agarwal Hall, Dombivali, Kalyan" },
      { id: "515c144c-c6c9-4fd9-be58-1ba932589cc2", name: "Platinum Multispeciality Hospital", address: "Sai Priya Building, 1st Floor, Star Colony Manpada Road, Nr.Saibaba Mandir, L.B.Yende Compound, Dombivali €" },
      { id: "5709f755-6dcb-44c9-97e3-3f9f496859fe", name: "Saarth Netralaya", address: "102, Gautameshwar Dham, Ramnagar, Tandon road, Dombivli E, Thane" },
      { id: "5fda9a56-ac75-437e-ac9d-6a09603ede98", name: "Saee Children and Dental Hospital", address: "Ratnajyot Building, 1st Floor, Above Monginis Cake Shop, Near Vegetable Market, Lodha Heaven, Nilje, Dombivli (E), Thane" },
      { id: "f816ff66-a363-4e22-965a-ad65c1c79409", name: "Sai Hospital", address: "VAIBHAV NAGARI  KATAI  NAKA 2ND  3RD AND 4TH FLOOR  SURVEY 66  KALYAN SHIL PHATA DOMBIVALI EAST" },
      { id: "3a453721-79b9-492b-99b4-4c58df5762c2", name: "Sai Jyot Hospital", address: "Suchit Squere, 1st Floor, Besides Chiranjevi Hospital, Dr.R.P.Road, Dombivli (E)" },
      { id: "4ce2c03d-7f2d-4e8d-a976-b72342857824", name: "Shivam Hospital", address: "plot bno 57,crw ,chs,near MIDC-water tank,Kalyan Road," },
      { id: "b0ad7280-9a8a-48c2-a28e-1efa93d64a4f", name: "Shree Siddhivinayak Urology & Multispeciality Hospital", address: "Unit no, 1 101/102, Parth Regency, Shivaji Path, Main Gate, Opp Nehru Maidan, Dombivali(E)" },
      { id: "df7c89e4-8f4a-476f-b058-4be757f78aec", name: "Sparsh Multi Speciality Hospital & Iccu", address: "First Floor, Sudama Arcade, Bld, R.P.Road, Tilak Nagar, Dombivali East" },
      { id: "d31a324f-e5d4-4588-9447-f2aff1146ca2", name: "Srv Mamta Hospital", address: "P-43, Phase -2, Next to ICICI Bank, MIDC, Dombivali (East), Thane" },
    ],
  },
  {
    id: "90e61bb5-df44-4941-aed3-c2a0deea0789",
    name: "Dombivli (W)",
    clinics: [
      { id: "adcc331b-ab93-46e2-895d-cc3c2ce6f8e1", name: "Apex Hospital", address: "Janki Smruti Building, Gupte Road, Dombivali W, Thane" },
      { id: "61eb01e6-b5ed-4151-89fc-830d286a5bf0", name: "Asian Institute Of Medical Science", address: "Plot no. 72 milap nagar, MIDC Dombivli, Milap nagar" },
      { id: "94c74bcb-c6bd-484c-9207-9a1200e9c0d6", name: "Dr Harne Hospital", address: "2nd Floor Everest Shopping Centre Opp Rly Stn" },
      { id: "04d8127b-19dc-4a8e-86f6-3b7faad3dad1", name: "Dr Talele Shree Ashirwad Hospital", address: "Shree Complelx, Opposite Mahavir Nagar, Manpada Road" },
      { id: "58549088-310b-44a6-a17b-20581e00f985", name: "Galaxy Criticare Hospital", address: "1st Floor, Deepti palace, above prestige Hotel, G.G.Road, near GOPI Mall, Bhori Chowk, Dombivali(W)" },
      { id: "d5287944-9fb5-461f-9e22-a308eece6c8f", name: "Optilife Hospital Nx", address: "Sai Paradise Build, First Floor, G. Gupte Road, Dombivali (W)" },
      { id: "6f28695a-d9c0-46ae-bd00-e37c9d7a2824", name: "R R Hospital ( Unit Of Kagzi Hospital & Medical Research Centre )", address: "P 14 MIDC Phase Dombivali Milapnagar Opp Pendharkar college" },
      { id: "f3a9c0f2-4227-4bb8-a8df-8d2462488d67", name: "Sai Shraddha Hospital", address: "Klassik Arartment, Kopar Road, Dombivli (W)" },
      { id: "86d0ec95-3139-4709-b7b9-c125739cd0fd", name: "Sawant Hospital", address: "Ground Floor, Chamunda Villa Bldg, Dindayal Road, Near Samrat Hotel, Dombivli (W)" },
      { id: "0ab70061-59c2-4c04-8f7b-448bec50fd19", name: "Spandan Hospital & Icu", address: "Priyadarshani CHS, Fist floor, Above Allhabad Bank, Phule Road, Dombivali (W), Thane" },
      { id: "a99c2783-457b-46d9-9aae-16bca0fb8ae4", name: "Venus Hospital And  Icu", address: "Near Amba Bhavani Mandir, Dombivali Kopar Road, Dombivli (W)" },
    ],
  },
  {
    id: "e9931da1-736e-492d-91c4-60ed360510e7",
    name: "Dr Ambedkar Road",
    clinics: [
      { id: "b8d31811-d25c-4310-8d95-c2d94bcdbacc", name: "Dandekar Hospital Panvel", address: "1st floor, Commercial premises, Vasant kunj Hsg. Society, Dr Ambedkar Road" },
    ],
  },
  {
    id: "1337df92-0d01-404f-952a-38eb1dfeb5af",
    name: "E E Highway",
    clinics: [
      { id: "1a4ee480-b506-4981-919d-cc5c67f386e8", name: "Criticare Superspeciality Hospital", address: "Opp: Nitin Company, E E Highway, Thane (W)" },
      { id: "df5f1f96-67f5-4a07-9b7b-f5341ea020b4", name: "Jupiter Lifeline Hospital Ltd", address: "Eastern Express Highway , Near Cadbury  Company" },
    ],
  },
  {
    id: "6708173e-798b-4961-beb6-0007460d3e70",
    name: "Gandhi Nagar",
    clinics: [
      { id: "1eec0618-7721-4bde-b04c-3d232f32626c", name: "Pragati Hospital And Icu", address: "Ground Floor, Rajshree Sahu Maharaj Complex, Near RSM School, Rajiv Gandhi Nagar" },
    ],
  },
  {
    id: "51d7fe24-6445-4289-bf66-f080f32d28f6",
    name: "Ghansoli",
    clinics: [
      { id: "add86aab-ca31-4ec5-a095-4e4291428761", name: "Divine Multispeciality Hospital", address: "Plot no 21, Sector 6, Navi mumbai" },
      { id: "7e62ca29-7782-4684-bdaa-ad2f94f84536", name: "Laxmi Multispeciality Hospital & Icu", address: "Ghanshyam Bhuvan, Sector-3, Near Bank Of India, Ghansoli, Navi Mumbai" },
      { id: "02c0bf10-9d4c-4a62-9fe8-0f374b64b335", name: "New Life Maternity And Children Hospital", address: "Bapu Daji Niwas, Plot No. 84/85, 1St Floor, Station Road Ghansoli, Mumbai" },
      { id: "96af9b2d-9d95-4035-a243-de51a26e929c", name: "Sadguru Hospital", address: "Plot No. 170, Sector -25, Talavali Node, Ghansoli, Navi Mumbai" },
    ],
  },
  {
    id: "db8dafa9-ad1a-44cd-ad64-ca16ffafc73d",
    name: "Ghatkopar",
    clinics: [
      { id: "57214d72-5694-4246-9d2d-ec0e626cb321", name: "Ashirwad Heart Hospital", address: "1, Vivke, Tilak Road" },
      { id: "f85d8688-c80b-4178-968e-e9e8afd1abd6", name: "Cellcure Cancer Centre Pvt Ltd", address: "8th Floor, Silverpoint, Opp Sukhshanti Hospital, LBS Marg, Ghatkopar West. Mumbai 400086" },
      { id: "c74d2c16-8e85-4008-9106-69568d21b8d0", name: "Dr Dipak Desais Ent Hospital", address: "206 Gayatri Dham M G Road Ghatkopar (E)" },
      { id: "3020e25d-0a32-4687-b834-831548cf1e57", name: "Eye Essential Hospital", address: "3, milan 169 Garodia 90- feet road opp. Lavender bough ghatkopar east Mumbai" },
      { id: "bcb79daf-f601-41ff-87a8-1387275d4ece", name: "Khushal Hospital & Maternity Home", address: "102/103, Karmavihar Bldg, Station Road" },
      { id: "4a85558a-1d32-48b8-bf1d-4ecb6b52f293", name: "Mehta Eye Clinic Pvt Clinic", address: "3RD, FLOOR, JAYANT ARCADE, M. G. ROAD, GHATKOPAR (E), MUMBAI - 400077" },
      { id: "f796e0ed-6ba0-414f-9881-e8b6fc1cfb16", name: "Nulife Hospital", address: "A1, HARE KRISHNA BUILDING, 1st & 2nd FLOOR, L. B. S.MARG, GHATKOPAR WEST, MUMBAI - 400086" },
      { id: "ed746acd-ee98-4aaf-820c-53a65d789e14", name: "Parakh Hospital Pvt Ltd", address: "Khokhani Lane, Opp Ghatkopar Railway Station, Ghatkopar(E)" },
      { id: "3632c0ba-0cba-45cc-b072-12d49ab8e95f", name: "Shantiniketan Hospital", address: "E-Building, Ground Floor, L.BS Marg, Ghatkopar(W)" },
      { id: "1b797d71-f8ab-43d8-b677-b0178e5efbc8", name: "Speciality Surgical Oncology And Research Centre", address: "6th Floor Silver Point,Lal Bahadur Shastri Rd,Maneklal Estate Ghatkopar" },
      { id: "1671feee-7098-4eab-b2a5-c9c2ccf54030", name: "Varun Cardiac Clinic", address: "101-102, Gayatridham, Deresar Lane, Ghatkopar (E)" },
      { id: "478608d2-3b0c-4f13-bf03-8a688b63c9bb", name: "Zynova Hospitals Pvt Ltd", address: "Acme Elanza, CTS 1900 - 1917, LBS Marg, Ghatkopar (W), Mumbai - 400 086" },
    ],
  },
  {
    id: "0950cb9c-f3c8-4d0a-a10d-719bc7a72874",
    name: "Ghatkopar (E)",
    clinics: [
      { id: "1c25abf3-c649-41bc-a3b7-d10090de203c", name: "Mumbai Eye Care Cornea And Lasik Center", address: "101/102, Sai Vaibhav CHS, Vikrant Circle, Rajawadi, Tilak Road, Ghatkopar (E)" },
    ],
  },
  {
    id: "aa3bac83-fc78-42cf-9937-c4efba01a96d",
    name: "Ghatkopar (W)",
    clinics: [
      { id: "b035a11b-630f-4e50-9a67-3bc24f829f32", name: "Abhishek Nursing Home", address: "Jagriti CHS, Nr Maratha Mandir Co-op Bank, Bhatwadi" },
      { id: "3c1d99ed-88ae-486d-8c43-c56cfca1f691", name: "Disha Nursing Home Pvt Ltd", address: "Om Shree Saidham CHS, Jamblipada, Asalpha Village, A-Link Road, Ghatkopar(W)" },
      { id: "9d4c36ce-29de-4c2d-ac15-7bf540b670d1", name: "Dr Sonagra Medical & Surgical Centre", address: "Shiv plaza, Opp Telephone Exchange, LBS road, Ghatkopar (W)" },
      { id: "6b95da3c-caef-4164-98b2-6ed312e07e8a", name: "Furia's Eye Clinic", address: "B-301/302, BHAVESHWAR PLAZA, LBS MARG, NEAR SHREYAS CINEMA, GHATKOPAR (W), MUMBAI - 400086" },
      { id: "27b1856d-2b56-4ad7-9b2d-f4c87f32c195", name: "Global Eye Clinic", address: "305-306/, Shopzone Complex, M.G.Road, Ghatkopar West" },
      { id: "49504bdb-6456-4730-9bb2-9c4d3e10b537", name: "H J Doshi Ghatkopar Hindu Sabha Hospital", address: "Shradhanand Road Opp Railway Station Ghatkopar (W)" },
      { id: "565eac51-cc67-4f0d-b9fd-15e6bd3ec066", name: "Ruby Hospital", address: "Laxmi Shopping Centre, H.D Marg, Opp Ghatkopar Railway Station,(West) Mumba" },
      { id: "525cdf36-c703-41de-a5c8-25fd26f00c27", name: "Sapna Health Care Centre Pvt Ltd", address: "A Wing, Bhaveshwar Plaza, L.B.S. Marg, Ghatkopar (W)" },
      { id: "767392c9-7d8d-4c09-b6cf-4d3722951e1e", name: "Satyam Nursing Home", address: "Bhaveshwar Plaza C Wing 2nd Floor, LBS Road,  Ghatkopar (W)" },
      { id: "02bd2e21-3ac5-4edd-bad5-db33fbfba239", name: "Sharan Nursing Home", address: "101 Dipti Solitaire, OppVanguard navnit Cloth Store Above Axis Bank, M G Road, Ghatkopar (W)" },
    ],
  },
  {
    id: "d331418d-8654-4c54-8057-fa72e9d9ba6d",
    name: "Ghatla Chembur",
    clinics: [
      { id: "6a9ba1f2-2061-48ed-bfd7-c17679496d51", name: "Kolekar Nursing Home", address: "N.G Acharya Marg Mukti Nagar Ghatla Chembur" },
    ],
  },
  {
    id: "b6334c85-03fe-47b3-89c2-64e6cfcf27f6",
    name: "Ghodbunder Road",
    clinics: [
      { id: "f6c7e942-6b7f-4831-b15c-5ef562ffd6ec", name: "Currae Gynaec Ivf Birthing Hospital - Patni Healthcare Ltd", address: "Rosa Vista Building, Opp Suraj Water Park,Ghodbunder Road, Thane" },
      { id: "9c22f2f2-8000-4cc3-a6e6-55ae254735d4", name: "Highland Super Speciaity Hospital", address: "3rd Floor, Highland Park, Above D Mart, Dhokali, Kolshot Road, Ghodbunder Road,Thane(W)" },
      { id: "a86f0e8f-a37a-4db1-be4c-f80bb94a1eab", name: "Isha Netralaya", address: "Dosti Imperia, Sho No 2, Near R Mall, Ghodbander Road, Thane" },
      { id: "8982d626-feac-4521-b9ef-4d405f922800", name: "Shree Ramkrishna Netralaya", address: "Unit 1-4, Dosti Imperia Shopee, Opp R Mall, Manpada, Ghodbunder Road, Thane (W)" },
      { id: "a97eace7-c92b-472a-8d0b-7633c99fdfe3", name: "Thane Noble Hospital Llp", address: "3A/308, Solitair, Cosmos Jwels, Kavasar, Ghodbunder Road, Thane" },
      { id: "f1a19e89-944c-438f-9c28-b3d8c138ae31", name: "Walvatkars Eye Care Centre", address: "110/ B, Krishna Tower, Kapurbawadi Junction, Above Sanman Restourant, Ghodbunder Road, Thane (W)" },
    ],
  },
  {
    id: "f6fccf43-1d28-4513-b6cf-d732d7495357",
    name: "Gokul Nagar",
    clinics: [
      { id: "8078dd5c-4176-45f2-bea8-0dec81455313", name: "Universal Multispeciality Hospital", address: "1st Floor, Teejadeep Heights, Opp. Ginger Hotel, LBS Road, Gokul Nagar, Thane" },
    ],
  },
  {
    id: "16a32690-f07f-46da-ab3e-2ca68678efb0",
    name: "Goregaon",
    clinics: [
      { id: "4460337c-4851-43e0-b5a6-8eb47c85b147", name: "Hdl Lifecare Plus Multispecialty Hospital", address: "B1/B2, Green Lawn Apt, Opp St Pius College Aarey Road" },
      { id: "a7862759-b740-43f3-b217-1f7456491c31", name: "Radha Krishna Hospital", address: "Satelite Garden, 1st Floor, Phase II, Film City Road, Hanuman Nagar, Bus Stop, Goregaon East" },
      { id: "e0e26706-e443-42e6-8e18-8bb1c7aa9e0d", name: "Shree Sai Clinic", address: "Padmavati bldg.,unnat nagar road,no.-02,near patkar college, s.v. road,goregaon,west mumbai" },
    ],
  },
  {
    id: "9d218f0b-c9be-4b5e-b6dd-84ea9ddcdeb3",
    name: "Goregaon (E)",
    clinics: [
      { id: "c5bb6d14-c928-464a-a4db-b477aab09534", name: "Lifeline Medicare Hospital", address: "A-1, Gagan Chembers, Gokuldham, Goregaon (E)" },
      { id: "94873f5f-c2a2-4603-a6cb-f1208089b3ae", name: "Suvidha Hospital", address: "275, Ground Floor, Jawahar Nagar, Goregaon (W), Mumbai" },
      { id: "ae61fec2-8bb8-4a97-bb00-aa1c5563d7c5", name: "Vedant Multispeciality Hospital", address: "1st Floor, Safal Shopping Center, NNP, Off Filmcity Road, Goregaon (E), Mumbai" },
    ],
  },
  {
    id: "d7786696-abbc-4729-9edd-c59193b67d9f",
    name: "Goregaon (W)",
    clinics: [
      { id: "261fb1be-329b-4180-8d88-b33a6dc615d9", name: "Kapadia Multispeciality Hospital", address: "M G Road, Opp. Raga Restaurant, Goregaon (W)" },
      { id: "4081d7db-ebf0-4730-ab89-0fcb7a3c5520", name: "Lifeline Medicare Hospital Pvt Ltd", address: "DLF Park, MTNL Signal ,S.V. Road, Goregaon West" },
      { id: "10e1938b-4aba-4190-908b-88db27a3ba81", name: "Oscar Superspeciality Hospital", address: "SHEPHERD ROYAL BLDG, A & B WING, 1ST , 2ND & 3RD FLOOR , OPP. DIVINE DIAGNOSTIC CENTRE, NR. BANGUR NAGAR METRO STATION, GOREGAON WEST. MUMBAI - 400104." },
      { id: "bc73cdc5-c556-4dc5-8e06-81dad72db251", name: "Srv Hospital", address: "179/180, Kamala Charan Building, Jawahar Nagar, Road No 2, Goregaon(W), Mumbai 400062" },
    ],
  },
  {
    id: "e7784b2d-78d2-4280-ad71-5a699d5d1485",
    name: "Govandi (E)",
    clinics: [
      { id: "492d9e01-6c04-410d-8405-48faea6aa3f1", name: "Shree Siddhi Multispeciality Hospital", address: "Sai Kunj, Plot No. 120, Near Govandi Railway Station, Govandi (E), Mumbai" },
    ],
  },
  {
    id: "12a88e91-9486-47c0-9a58-f261bae54054",
    name: "Govardhanbapa Chowk",
    clinics: [
      { id: "994076ea-4044-4728-839a-49f49518d845", name: "Sir H N Reliance Foundation Hospital And Research Centre", address: "Padmasr, Raja Rammohan Roy Road, Prarthana Samaj" },
    ],
  },
  {
    id: "29051ac6-e410-4b6e-b86e-13ab446449fa",
    name: "Grant road",
    clinics: [
      { id: "0d06dd61-91bd-4c5f-8f52-704d82ab5c8c", name: "MOC Cellcure Cancer Centre Pvt Ltd.", address: "1st Floor, Shreepati Arcade, Nana Chowk, Kemps Corner, August Kranti Road, Grant Road West. Mumbai 400036" },
    ],
  },
  {
    id: "a7130c42-09dd-4b1a-b767-1b98dbeb7164",
    name: "Gurudwara Station road",
    clinics: [
      { id: "1848b8f1-f2c3-48b9-bdb8-628c64c70093", name: "Maa Vaishnavi Multispeciality Hospital", address: "Next to  Kopari, Telephone Exchange, Gurudwara Station road" },
    ],
  },
  {
    id: "538b88d5-d149-499e-a8a6-e448f347a567",
    name: "Jogeshwari (E)",
    clinics: [
      { id: "efa5b858-7628-4690-951c-7f930c608947", name: "All Cure Super Speciality Hospital", address: "1st Floor, Near State Bank of India, Kesar Plaza, Caves Road,  Station Road, Jogeshwari (E)" },
      { id: "aad704ce-3758-4f3c-8288-c027a828e8df", name: "Kokan Hospital", address: "Areshwar Building, Opposite Dhiraj Darshan, Kokan Nagar, Shivneri Vasahat Road, Jogeshwari East , Mumbai" },
      { id: "99ba5841-0bc6-4ba9-b483-9b70cf2db461", name: "Shalyak Hospital", address: "S.K.Apartment, Bldg No.2, Dalwai Compound, Near Police Station, Jogeshwari (E)" },
    ],
  },
  {
    id: "867cb70d-793d-440b-9ee8-9b636622fa35",
    name: "Jogeshwari (W)",
    clinics: [
      { id: "3e0ef749-efe5-4712-938e-ab6351901b28", name: "Mallika Hospital", address: "Sharma Estate S.V. Road, Jogeshwari (W)" },
      { id: "8575fca4-c81e-40ab-ae5a-ad961b936f0b", name: "Orbit Eye Hospital", address: "1 st Floor Aftab Classic , opp city hospital , S.v Road, Jogeshwari (W)" },
    ],
  },
  {
    id: "be0f57f6-44e5-4e25-a575-846607f91b60",
    name: "Kalamboli",
    clinics: [
      { id: "bf590ac8-8ad6-4029-8c91-2b5865c82c56", name: "Asha Multispeciality Hospital", address: "Plot No. 10, Sector -16, Near D-Mart , Roadpali Kalamboli  -Panvel" },
      { id: "22aec7ca-431a-4d33-8e51-f921620a3dc9", name: "Dr Singh City Hospital & Medical Research Centre Pvt Ltd", address: "Plot no- 32, Sector-4, Kalamboli, Near Shiv Mandir" },
      { id: "fb9f691a-8215-430f-94bd-a098a7a06450", name: "Satyam Multi Speciality Hospital & Trauma Centre", address: "F-5 Bldg sec-3E, opp fire station Kalamboli" },
      { id: "74ef3c54-fac3-4f37-b613-8bb570d4137f", name: "Suyash Surgical & Maternity Home", address: "Flat no 101 / 102 Satyam Society , Above Trupti Hotel , Sec 2 E ,Kalamboli" },
    ],
  },
  {
    id: "5cf0356a-edca-467d-ae0b-bf884d9de0f3",
    name: "Kalher Village",
    clinics: [
      { id: "b02a5857-49f9-4461-a26a-b2113d8fbc64", name: "Asha Hospital", address: "1st Floor, Rajlaxmi Complex, Thane Bhiwandi Road, Opp Jai Mata Di Compound, Kalher" },
    ],
  },
  {
    id: "d56c47b2-6dea-477b-8ffe-bba70f183a54",
    name: "Kalwa",
    clinics: [
      { id: "bbdd05a5-07d4-4475-83a1-0dd21314100b", name: "Aarogya Multispeciality Hospital And Trauma Center", address: "Herambh Heights, Old Mumbai Pune Highway, Kharegaon Naka, Kalwa" },
      { id: "c1b63dba-4d1d-481b-a477-5015e57d8436", name: "Prakruti Care Hospital & Iccu", address: "Siddheshwar Arcade, 2nd Floor, Opp. Manisha Nagar" },
      { id: "782296bd-bd21-4c3c-8bcd-e885de9bbde7", name: "Sapphire Hospital Pvt Ltd", address: "kaveri Heights, Old Mumbai Pune Road, Kharegaon , Kalwa" },
    ],
  },
  {
    id: "68a041ac-866e-45dc-a86e-ef5a925136c7",
    name: "Kalwa (W)",
    clinics: [
      { id: "1e70d4c5-65ae-4933-926f-2ed5f78cbd26", name: "Arogyadham Multispecilaity Hospital", address: "Ground Floor, Janki Tower, Mumbai Pune Road, Kalwa(W)" },
    ],
  },
  {
    id: "f4441a1e-e561-4b75-9773-05029d17e50f",
    name: "Kalyan",
    clinics: [
      { id: "2cebbf2d-20b3-4827-89c4-aeda6b507a02", name: "Dr Agarwals Healthcare Ltd", address: "Diwadkar Commercial Complex,CTS No-2878-A,2nd floor, Shivaji Chowk, Agra Road, Kalyan West" },
      { id: "a620c289-3ac7-4f1e-8ad4-90b180874738", name: "Shriyash Hospital", address: "BHALERAO APARTMENT KATERNANIVALI POONA LINK ROAD KALYAN EAST" },
    ],
  },
  {
    id: "9f7054af-0801-4105-aae1-d4c7c4253318",
    name: "Kalyan (E)",
    clinics: [
      { id: "ec65d419-1d1b-4a09-949f-253cb113c9c1", name: "Aashirwad Hospital", address: "pune link road ,tisgoan,kalyan" },
      { id: "adbbd128-3e00-4963-ba3e-77515b702d7f", name: "Amey Multispeciality Hospital", address: "1st Floor,Skylon Building, Chakki Naka, Netavali Village, Kalyan (E), Thane" },
      { id: "55a85465-d6fd-4701-a850-2d0739cffd33", name: "Balaji Hospital", address: "Sai Dham Apt, First Floor, Katemanavali, Near Ideal English School, Kalyan(E)" },
      { id: "00010b29-61af-4bd0-960c-f55dfb015608", name: "Bhanu Jyot Hospital Pvt Ltd", address: "Khushi Heights, 1st Floor,Pune Link Road, Opp, Nitinraj Hotel, Katemanivali, Kalyan (E), Thane" },
      { id: "092ae531-d9a2-41c6-ba93-5591163829be", name: "Jankalyan Multispeciality Hospital", address: "Ram Niwas Apt, Opp Kalyan Janta Sahakari Bank, Nr. Ashish Restaurant, Shree Malang Road, Kalyan E, Thane" },
      { id: "efe839a6-6ec1-46a6-af81-800b1ef95946", name: "Krishna Leela Hospital", address: "Vishwakarma Plaza, First floor, Near PMG Bank, Malang Road, Kalyan (E), Thane" },
      { id: "f8787d2b-369b-42ca-b179-ec7783a238ea", name: "Life Care Hospital", address: "First floor, Radhika Apartment, Above HDFC Bank, Poona Link Road, Chakki Naka, Kalyan (E), Thane" },
      { id: "0cd8d721-42d9-456b-8d72-b362ae213a0c", name: "Mahesh Hospital", address: "Balaji Apartments, 1st Floor, Above Bank Of Baroda" },
      { id: "b88fd4dc-67db-485a-ab01-1c1797f4a933", name: "MGM Hospital", address: "KALYAN SHILL ROAD,NEAR KATAI NAKA,DOMBIVALI (E )" },
      { id: "11e4e330-2d58-44f2-bc3a-80221f1fa123", name: "Neon Hospital", address: "1St And 2Nd Floor Mukta Arcade, Kalyan Shill Road, Above Regent Honda Showroom, Thane" },
      { id: "2e6a61f7-2857-4a8d-a540-31a9a2e44e27", name: "Sai Karuna Hospital", address: "101/102 FIRST FLOOR,VIVAAN HEIGHTS , Katemanivali , Kalyan , Maharashtra" },
      { id: "65f37c80-3eb8-46f7-ae10-30e6c5e83f77", name: "Sai Swastik Multispeciality Hospital", address: "Shiv vaibhav Aprtment No 2, Near Vittal mandir, F-cabim , Vittalwadi, Kalyan (E)" },
      { id: "8949477d-0093-44e9-880c-7759c752f2fc", name: "Shree Sadguru Krupa Accident And Fracture Hospital", address: "First floor, Mittal Heights, Near KDMC Ward, Gurudhan Hotel, Pune Link road" },
      { id: "c11c7593-652a-4499-bbc4-8c2936df65f1", name: "Sparsh Children Hospital", address: "Ganesh Lehar Villa, Opp. Nitin Raj Hotel, Near Katemanvli Fly over, Pune Link Road, Katemanavli Naka, Kalyan (E)" },
      { id: "45da031f-221d-4a5b-a4a1-8d9c4c080b1e", name: "Star City Multispeciality Hospital Pvt Ltd", address: "Anant Sudha Bhavan Gopal Chowk Chakki Naka Kalyan (E)" },
      { id: "3b48a940-2689-42b6-acd2-79a53115565f", name: "Vithalkrupa Hospital", address: "B1-6, Ground Floor, Ram Apartment, Katemaniveli Chowk, Kalyan(E)" },
    ],
  },
  {
    id: "7b7914c3-2484-4f59-b4d7-67fbe92b38a8",
    name: "Kalyan (W)",
    clinics: [
      { id: "69a8ac37-da08-4c92-8572-5a0fe354ebb6", name: "Aayush Hospital", address: "Bldg No. E-2, 2nd & 3rd Floor, Radha Nagar Shopping Complex, Radha Nagar, Opposite Police Chowki, Khadakpada, Kalyan (W)" },
      { id: "9d3dd031-5828-470a-8cb8-0ad037301a73", name: "Am Pm 24 Hrs Hospital", address: "2nd Floor, Om Supreme, Near D Mart, Above Dominos, Old Bail Bazar, Opp Hp Petrol Pump, Kalyan(W)" },
      { id: "1541d2d5-e71c-46c8-a696-c392d40df738", name: "Ankur Multispeciality Hospital", address: "Patel Plaza, Ground floor, Near Ajit Scan Center, Kalyan (W)" },
      { id: "a0325916-f09c-4546-af1d-f91135402683", name: "Anu Nursing Home", address: "1St Floor,Royal Residency Park,Next To Commissioner Bunglow, Santoshi Mata Road Nsyndicate Kalyan West Thane." },
      { id: "178a19f2-4179-4751-aff5-15dec060f4e7", name: "Apex Hospital", address: "Shiv Tirtha Apartment parnaka Kalyan" },
      { id: "9d9bd049-78c7-4607-ad03-8a7d7f7d3f43", name: "Balaji Ent & Eye Hospital", address: "Bhagwatiashish appt, 1st floor, Murbad road ,Sindhigate, Near Janata bank Kalyan west" },
      { id: "43d99f65-bbce-484c-b35f-f85b8d7ca98e", name: "City Criti Care Hospital", address: "First Floor, Subham Apartment, Above Bata Showroom, near Commissnor Bunglow, Kalyan West" },
      { id: "eea096eb-32fb-4220-8e7d-5b8256dc2430", name: "Dr C B Vaidya Memorial Hospital", address: "Opp City Post Office, Tilak Chowk, Kalyan (W)" },
      { id: "b0b23fc4-3b95-4228-9bc7-eba929ef2010", name: "Dr Thakurs Vedant Ent Hospital", address: "#102, Panchratna Tower, Opposite Cinemax, Khadakpada , Kalyan w , Thane 421301" },
      { id: "e2607367-02ad-4505-bbe3-58ad18477e8c", name: "Dr Wankhade Fracture & Accident Hospital", address: "Murbad Road, Opp. ICICI Bank Nr. Hero Honda showroom Purnima theatre area" },
      { id: "357dffa4-174f-4937-aeb4-cd4bfb15f083", name: "Fortis Hospital Ltd Kalyan", address: "Aadheshwar Park,BailBazaar,Kalyan Shill Road,Kalyan(W)" },
      { id: "28ab7281-c532-4e8e-a2c7-7371e71ca638", name: "Ganesh Memorial Hospital And Endoscopy Center", address: "5-Tulip C, Flower Vally Complex,Khadakpada Circle, Kalyan (West)" },
      { id: "3797d09b-28c9-4e39-bdde-7e02e1772840", name: "Gastrocare Hospital", address: "Regency Avenue, Besides Reliance Webworld, Syndicate" },
      { id: "573bb995-e989-45fd-aed3-2168ebca6442", name: "Holy Cross Hospital", address: "1/Karnik Road, Kalyan (W)" },
      { id: "8de28382-6da3-46f7-b7d5-42bab2c30ad6", name: "Isha Netralaya A Unit Of Dr Shahs Laser Eye Institute", address: "Ground Floor, Radhakrishna Sankul, Opp Holycross Hospital, Karnik road" },
      { id: "b25dd0fc-aa23-42d2-b352-5df1887f095f", name: "Kalyan Cancer Canter", address: "At.Bapgaon ,Po.Lonad,Tal.Bhiwandi,Dist.Thane" },
      { id: "b0d02b42-aaa8-4cc5-a4f1-71392737f2fd", name: "Khadakpada Multispeciality Hospital", address: "Swami Prasad, First floor, Building no 3, Shelar Park, Above TJSB Bank, Khadakpada Circle Kalyan west" },
      { id: "21b1471b-9995-4d66-84a2-adde74dde64d", name: "Leela Eye Institute", address: "Patel Plaza, 1 floor, Near Ajit scan centre Murbad road Kalyan" },
      { id: "51d3a2b2-969d-434d-a9c2-e2cdae2c6782", name: "Medihope Hospital", address: "Ground Floor, Radha Krishna Sankul, Near Nutan Vidayalaya, Karnik Road, Opp Holy cross hospital, Kalyan (West)" },
      { id: "fa552d9b-6280-4d0d-ba4f-8e76af124f8f", name: "Phadke Hospital", address: "Gaurav Prasad Parnaka Opp Gajanan Maharaj Mandir" },
      { id: "8b4fc839-1307-4499-9c80-aa9555a815e6", name: "Prathamesh Hospital", address: "Namdev Vihar, D-wing, 1st Floor, Don Bosco pre School, Chikanghar Rambhag No. 4, Kalyan (W) Thane" },
      { id: "d0eb9c92-4bf1-4547-a251-02c5bb9be72f", name: "Royal Childrens Hospital", address: "Radha Krishna Sankool, Opp. Holy Cross Hospital, Karnik Road, Kalyan (W), Thane" },
      { id: "46c5bb34-c11e-4fc0-bfd7-266a4c3a9ca4", name: "Saanvi Ent Hospital", address: "First floor, Shreeji Southern, Khadakpada Circle, Above Bikaner Sweets, Kalyan (W)" },
      { id: "e95a0f20-3766-4c4f-8a2c-35afc9e2d855", name: "Sai Arogyam Multispecilaity Hospital And Iccu", address: "1st Avenue, Business Park, Near Durgadi Killa, Opp Fire brigade, Kalyan (W) 421301" },
      { id: "6a16d86e-23d0-43b9-963b-214e89758fe8", name: "Shree Hospital", address: "Ganeshbaug, Murbad Road, Opposite Saraswat Bank, Kalyan, Thane" },
      { id: "c180d829-ff36-4d70-be49-78a6a77e4bff", name: "Shree Om Sai Hospital", address: "Suchak Appt, Pornima Bus Stop, Near Icici Bank, Kalyan (W), Thane" },
      { id: "f1958ac9-6d4c-4260-89a0-e63ccba2a416", name: "Shreedevi Hospital", address: "Aakash Arcade, Near Bhanu Sagar Theatre" },
      { id: "8e34204e-8982-44f8-b014-e61b0000ba26", name: "Shripada Maternity & Paediatric Nursing Home", address: "C-wing, Regency Avenue, Near masjid, Syndicate Murbad Road, Near Masjid, Kalyan West, Thane" },
      { id: "5479c4d1-eca6-4f7d-abff-6cb0e7976cb5", name: "Siddhivinayak Multispecilaity Hospital And Cardiac Care Center", address: "Bramin Society, Opp ICICI Bank, Murbad Road, Kalyan (W)" },
      { id: "e8961665-6066-4c68-9796-d77d47cbbde8", name: "Spectrum Hospital", address: "Near BSNL Agra Road, Kalyan Road(w)" },
      { id: "edc9aabd-1e54-46de-af42-95e7e922f43d", name: "The Kalyan Hospital", address: "Ground floor, Gagangiri Enclave, B-11, Near Godrej Hill, KhadakPada, Kalyan (W)" },
      { id: "8f0cbfda-f7bf-44b1-8fc6-91648211e278", name: "Vaibhav Multispeciality Hospital", address: "102/103,Ground1St Floor, Mrunmayi Palace, Near Chattri Bunglow, Chikanghar, Kalyan (W)" },
      { id: "8edc7caf-eddf-44f0-976c-d187923ad6c3", name: "Vatsalya Nursing Home", address: "1st Floor, Shri Sai Krupa Appt, Near Poornima Cinema, Santoshi Mata Road, Kalyan W, Thane" },
      { id: "e2f3a0b3-ea57-46ef-a716-7efb3725cb64", name: "Vedant Kalyan Hospital", address: "RIVER VIEW EASTE, BULDG NO.5 ADHARWADI ROAD, NEAR K.M. AGARWAL ,OPP GANDHARI OCTROI NAKA,KALYAN (W)421301" },
      { id: "d2bc27a9-462d-42f6-8dad-686168a2094b", name: "Venkatesh Hospital", address: "Plot No 7, Khadakpada, Barave Rd, Kalyan (W)" },
      { id: "4ffee9e1-da02-4a1e-8078-7c4431247ffd", name: "Venus Hospital", address: "Status Building,101 & 102, Aadharwadi Chowk, Kalyan (West)" },
    ],
  },
  {
    id: "771e5a3b-b735-4d86-b2ed-40d8686aeeb6",
    name: "Kamothe",
    clinics: [
      { id: "53d49164-0a1f-4a01-8841-761a4a7e9225", name: "B &  J Multispeciality Hospital And Research Center", address: "Mhalsa Residency, Plot No. 6, Sector  36, Above state bank of india, Kamothe" },
      { id: "a38eae43-538d-4f67-9a1d-8b0c955c8e5f", name: "Criticare Lifeline Hospital", address: "Sector-19, Plot No-85, Near White Flag Building, Kamothe, Navi Mumbai" },
      { id: "3327bb19-eb03-4597-a26b-a1daac8e7289", name: "Healing Touch Eye Hospital", address: "Satyam Heights, Plot No 81, Sector 19, Kamothe, Near Neelkant Sweets" },
      { id: "bc3ec9ca-e381-4aa9-9420-19cea71b433c", name: "Jeevan Jyot Hospital", address: "Shubh Avenue Bldg. Ground & 1st Floor,Plot No-59-C, Sector-21 Kamothe" },
      { id: "259544ff-4f7c-4ad6-83f0-365a18880f3c", name: "Jeevan Jyot Hospital", address: "Shubh Avenue Building, Ground & 1st Floor, Plot No.59-C, Sector-21, Kamothe-410209" },
      { id: "894c6213-b92f-4cfd-83ac-eef0835aa496", name: "Life Era hospital", address: "Granduer CHS. Shop No.16 , Plot No.33/34, Sector 20" },
      { id: "570b534e-e0fa-414d-bd47-9461b33f12f0", name: "Matoshree Multispeciality Hospital Advance Affordable Ethical", address: "Shop No-10/11/ 14/15, Trupati Icon, Plot No 425, Sector 20, Near Central Bank, Kamothe, Raigad" },
      { id: "51dbfeae-ed70-4aff-b320-284f5d1f92b3", name: "Mauli Accident & General Hospital", address: "Neelkanth Height , Plot NO.104A/ first floor, Sector 14, Kamothe Navi Mumbai" },
      { id: "32860bcd-12cf-41ba-ba30-d0885c2229d9", name: "New Pulse Multispeciality Hospital", address: "DHARTI HIGHT'S, PLOT NO, 28 SEC 21,KAMOTHE NAVI MUMBAI" },
      { id: "7346fa7f-a631-4d5a-bd95-6dc8934091c2", name: "Orchid Multispeciality Hospital", address: "Silver Star CHS, 1st Floor, B-wing, Shop No.3,4,5- Plot No. 50, 63, 64, 65 Sector- 18, Kamothe" },
      { id: "c22eb389-7e34-4d99-b769-d3b10e596b65", name: "Shree Sai Multispeciality Hospital", address: "B101,A103,104, Plot No 3A, First Floor, Sinhgad Scociety, Sec 7 Kamothe" },
      { id: "362e6b33-5fbd-42e7-a913-8b467be829fa", name: "Sunrise Multispeciality Hospital", address: "Shiv Kalpataru Arcade Plot No 01 Sec 17 Kamothe" },
      { id: "96fb18d2-0869-47e3-9838-ee52f1676fe2", name: "Swami Krupa Nursing Home", address: "Plot No.159, Sector 14, Kamothe Gaon Road, Near Krishna Hotel, Kamothe, Navi Mumbai" },
      { id: "45c9e4d3-b750-44b5-bdb3-aafe1f7feed6", name: "Yashoda Hospital", address: "First Floor, Satyam Arcade, Plot 26, Sector 21, Kamothe" },
    ],
  },
  {
    id: "6c0d223e-bc70-4d91-a561-591b01837293",
    name: "Kandivali",
    clinics: [
      { id: "d6fa6cbc-1d30-4a7a-aefc-7f164f5c41bf", name: "Aastha Hospital", address: "65, Balasinor Society, S.V.Road, Opp Fire Brigade, Kandivali W" },
      { id: "140bbe87-fa98-44f3-882a-a01e28985320", name: "Dna Multispeciality Hospital", address: "Whispering palms shopping center lokhandwals township next to lokhandwala sales office akurli road" },
      { id: "b558b361-7095-4659-948d-a54db93fce42", name: "Dr Vora Premature Critical Care & General Hospital", address: "2-4/A. Kokil Kunj, Behind Patel Nagar, M G X Road" },
      { id: "dc2675ca-067f-4c17-ae56-d930a9bcf7a7", name: "Oscar Multispeciality Hospital", address: "Pooja Enclave, 15-22, D & E Wing, ganesh nagar, Kandivali West" },
      { id: "c6414074-585d-45b4-8488-6a4d835e3f35", name: "Seven Star Multispeciality Hospital", address: "Surbhi house, Dimple Arcade, Behind Sai Dham, Thakur Complex, Kandivali(E)" },
      { id: "739e1388-0a5f-4efe-8b62-98cde6c4a8b1", name: "Sumangal Hospital", address: "B-Mitnayan Chs Ltd, Old Link Road, Ganesh nagar" },
    ],
  },
  {
    id: "5a8114cf-1228-4d5e-9a24-9f0eecb35a4c",
    name: "Kandivali (E)",
    clinics: [
      { id: "30102ae6-6607-49bb-a5d1-360216fd36a2", name: "Lifeline Medicare Hospital", address: "1st Floor, Takur Complex, Above Saraswath Bank, Asha Nagar Road, Near Wellness Forver, Kandivali (E)" },
      { id: "e0746198-c2c3-43a9-a0ef-d0beaacaa2f4", name: "New Life Nursing Home", address: "Tirupati Tower, Thakur Complex, Op Mahindra and Mahindra, Western Express Highwary, Kandivali (E)" },
      { id: "e66f744a-9ec9-4b95-9610-2a81fb7dff5f", name: "Sanchaiti Hospital Private Limited", address: "Near Big bazar Akurli Road Kandivili(E)" },
    ],
  },
  {
    id: "4599d389-f82c-4af3-8282-618140a3c4b5",
    name: "Kandivali (W)",
    clinics: [
      { id: "9e98f98c-f64a-4353-8dc9-e0ff05c75f80", name: "Gem Superspecialty Hospital", address: "C wing, Gokul Heights, Mathuradas Road, Kamala Nagar, Bhagat Colony, Kandivali West, Mumba" },
      { id: "18c6d107-f66c-4f42-8a55-cb7a5e60f6f0", name: "Health Hi Tech Orthopedic And Surgical Hospital", address: "Sai Krupa Plot No.51, Datamandir Road, Dhanukarwadi, Mahavir nagar Kandivali West" },
      { id: "15a95bc9-a253-46cb-b673-22dc5f7fc85f", name: "Hi Tech Urology Center", address: "Sushubhan, Sarojini Naidu Road, Bhura-Bhai Hall, Kandivali (W)" },
      { id: "b7156505-a3d1-4a1e-a3a9-329ebab487a1", name: "Kirti Nursing Home", address: "Kedarnath, Plot No 7, Sector-7, Near Charkop Bus Depo, Kandivali (W)" },
      { id: "487975c1-2b8f-4027-b634-b3ada3feb28c", name: "Lotus Mutispeciality Hospital", address: "Ground floor, Vinayak Apartment, M.G.Road, Opp Vaishali Bhuvan, Kandivali (W), Mumbai" },
      { id: "33406a1a-0528-4de2-a7b8-efe38c562f09", name: "Nidhi Nursing Home & Iccu", address: "Neelyog Apartments, Ground Floor, M G Road, Opposite Patel Nagar, Kandivali (W), Mumbai" },
      { id: "b9713bf2-a0c1-40ae-ad4d-9bc5cc5c9e9d", name: "Parvatibai Chavan Charitable Trust", address: "Yashwant Hospital Bldg, Dattamandir Cross Road No.1, Dhanukarwadi, Kandivali (W)" },
      { id: "3206e97b-1c5f-4c80-825a-f39a75421f7e", name: "Shivam Hospital", address: "Shrenik,CHS Ltd Plot 106, Rsc 11  Sector - 2, Charkop, Kandivali (W)" },
      { id: "eed1a8ba-b7cd-41a7-9a72-353b32163340", name: "Trident Hospital", address: "B-6/7/8, 1st Floor, Pooja Enclave, Opp Ganesh Nagar, Kandivali (W)" },
      { id: "d29c01a6-b69a-4ee7-baef-c77c0209be3c", name: "United Multispeciality Hospital", address: "Shop No. 1,2,3A,Kesar Ashish CHS, , Kandivali West , Mumbai" },
      { id: "24fe1caa-842b-450b-8135-791f6424b9b5", name: "Unnati Hospital And Bombay Spine Centre", address: "13 Om Tower, S V Road, Kandivali (W), Mumbai" },
      { id: "f35a761f-88fe-4081-98f1-47c9ac8a727b", name: "Vardann Multispecialtiy Hospital", address: "Arch Gold , Next to Poisar Telephone exchange, S.V.Road, Kandivali West" },
    ],
  },
  {
    id: "5de6cd93-3eec-4e9e-9d34-ceaabdc39af1",
    name: "Kasalwadawali",
    clinics: [
      { id: "5673cae0-40ff-4773-90a6-3c748170ce68", name: "Jijai Womens Hospital", address: "303B-Wing Near Hypercity  Anand Nagar Kasalwadawali Ghodbunder Road Thane" },
    ],
  },
  {
    id: "70a472ea-aa71-4bd8-bda7-ad8d8b4b48de",
    name: "Kasar Road",
    clinics: [
      { id: "2b766c72-f47f-426a-ab93-12911e62bbcd", name: "Vedant Hospital", address: "Kasar vadavali Ghodbunder Road Thane" },
    ],
  },
  {
    id: "d6d2bdef-27d2-4f82-b180-eea61415ce83",
    name: "Kasarvadavali",
    clinics: [
      { id: "82ef743f-a746-4918-9b43-5c6b7354da26", name: "Fortune Plus Icu & Multispeciality Hospital", address: "1st Floor, Fenkin Belleza, Opp. Hyper City Mall, Kasarvadavali, G.B. Road, Thane" },
    ],
  },
  {
    id: "2a7f7018-5f2d-4ffa-ae27-1a313b4c3f9a",
    name: "Kausa Mumbra",
    clinics: [
      { id: "85c056b6-38e4-4b32-b6a5-b17121c1a200", name: "Bilal Hospital & Icu", address: "First floor, A Wing, Royal Garden, Shimla Park, Kausa Mumbra Thane" },
      { id: "752afa9a-5b40-46aa-a515-d0a51e75ff90", name: "Kalsekar Hospital", address: "Near Bharat Gear Company, Dawle Village, Near Old Mumbai bypass road, Kausa-Mumbra, Thane" },
      { id: "f86c36ff-9eb5-42a1-b04d-dc904417ea48", name: "Prime Criticare Hospital", address: "Hasnain Tower, Kausa Mumbra, Thane" },
    ],
  },
  {
    id: "d0a3d5d5-3aa1-435e-9819-9378d15425da",
    name: "Khar",
    clinics: [
      { id: "01a3b095-32b5-4d89-8d97-1bf80811c37d", name: "R G Stone Urological Research Institute", address: "21-A,Sita Bhuvan,14th A-Road,Ahimsa Marg,Khar West" },
    ],
  },
  {
    id: "a6018774-7f8b-4ec8-985b-4925cddd6a31",
    name: "Kharghar",
    clinics: [
      { id: "e39c06f0-f2f2-4aa2-8aae-d28e52556b5d", name: "Ashwini Hospital", address: "Arm, Arcade, Sector-7, Nerar Kendriya Vihar Kharghar Navi Mumbai , Kharghar , Panvel" },
      { id: "8eefa39c-3627-4fd0-beb2-dbc881eacb83", name: "Drashti Eye Hospital", address: "4-5 Keystone Elita, D Mart Road, Nr. Karnataka Bank Sector- 15, Plot No.- 49 Kharghar Navi Mumbai- 410210" },
      { id: "af372068-2a4e-46ae-9bec-56c33887146b", name: "Kharghar Multispeciality Hospital", address: "The Crown, First Flooor Plot No :15/16, Sec 15 Near ; D Mart Kharghar Navi Mumbai" },
      { id: "0d4c7ea2-391e-4fbc-9a8e-e6c9ac1a88d2", name: "Medicover Hospital (A Unit of Sahrudaya Healthcare Private Limited)", address: "Plot No 1, Sector 10, Opp. Elite Enclave CHS.Near Bank of India. Kharghar. Panvel, Navi Mumbai." },
      { id: "4c07a6fe-d467-45ba-a336-b087211f0c53", name: "Mitr Health Care Hospital", address: "Eden Garden CHS,Sector - 5, Ploto No. 37, Kharghar, 410210,Maharashtra" },
      { id: "5a0c388d-214e-4b88-8606-87f1a0ba3a13", name: "Motherhood Hospital Unit Of Reha Healthcare Pvt Ltd", address: "Fountain Square,Plot no.5,Sector-7,kharghar, Navi Mumbai-410 210" },
      { id: "a0abe3cc-0456-4742-9b14-6496bdb6937b", name: "Niramaya Holistic Health Services Pvt Ltd", address: "Plot No.-5 A,Sector 4 ,kharghar,Near bal Bharti School" },
      { id: "0814602a-c02e-4a39-9a18-3d47515e928c", name: "Om Navjeevan Hospital Pvt Ltd", address: "Plot no 2, Sec 21, Kharghar,Tata Hospital Road" },
      { id: "0ec2964b-3dd3-47ad-aee2-8330086b77e0", name: "Polaris Hospital (unit Of Emr Healthcare Services Pvt Ltd )", address: "2nd Flor, Plot no.19-C, Opposite Shah Kingdom, Sector- 20, Kharghar, Navi Mumbai" },
      { id: "f01e2fa6-c4c0-4e7f-bff9-3fd8b856c5da", name: "Samarth Netralaya", address: "Siddhivinayak Residency, Office No 15 & 16, Plot No 18, Sector 20, Kharghar" },
    ],
  },
  {
    id: "c656286f-5c58-4f87-9665-456b661e694c",
    name: "Khopat",
    clinics: [
      { id: "2c504aba-a604-469f-a8f1-f94ad764ed4e", name: "Dr Kelshikars Hospital", address: "4th floor, Beauty Arcade, Opposite Pratap Cinema, Khopat, Thane (W)" },
      { id: "297d87f8-e2a5-49d4-ade0-7fa216283342", name: "Life Line Hospital", address: "A/1 st floor, Shiv tower, Khopat, Thane W" },
      { id: "20fd8e62-d3ed-49df-b7b4-8bb9180c782c", name: "Orthocare Hospital", address: "1st Floor, Gautam Chambers, Near Punjani Industrial Estate Near TMC School No.13" },
      { id: "314dae16-7eb8-4de9-8b55-949ef8085230", name: "Senses Eye & Ent Hospital", address: "2 nd Floor, Beauty Arcade, Opp Pratap Talkies,Thane" },
    ],
  },
  {
    id: "1312abc6-229e-46cb-a00b-38d6d7599322",
    name: "Kongaon",
    clinics: [
      { id: "adea9e44-3faf-46b2-b17d-a84aaf0875a6", name: "Ved Hospital Superspeciality & Medical Research Pvt Ltd", address: "Vedant Chamber Kalyan Bhiwandi Road Kongaon Tal Bhiwandi" },
    ],
  },
  {
    id: "87924254-fa24-41b4-a269-19dade939d5e",
    name: "Kopar Khairane",
    clinics: [
      { id: "c0662c10-1634-4aef-9365-c90f82a5be0f", name: "Dr. Ajayan Multispeciality Hospital", address: "Plot no. 6 Sector 9, Kopar Khairane near Kopar Khairane, Navi Mumbai" },
      { id: "694d7825-f735-4c9f-a347-6f6ea87a408f", name: "Lions Service Centre Hospital", address: "Plot Number 101, Sector 7, Kopar Khairane, Navi Mumbai" },
      { id: "55a665b6-759f-440f-8a31-731c2bfea7d8", name: "New Life Maternity And Childrens Hospital", address: "Enkay Square Chs, Shop No. 06, Plot No. 21, Sector 06, Koparkhairane, Navi Mumbai." },
      { id: "6ad6be9b-a54c-4d58-b6d8-da6ade7bd80a", name: "Rajpal Hospital & Institute", address: "Plot No. 13, Sector 10, Near D-mart, Kopar Khairane, Navi Mumbai" },
      { id: "d81399cd-bbf5-4e40-9522-90a1edf30dbc", name: "Reliance Hospital", address: "Plot No. X8 & X-8/1,MIDC TTC Industrial Area , Millenium Business Park, Kopar Khairane, Navi Mumbai" },
      { id: "0bb4ed1a-daa1-4129-a4d6-651ac154ad20", name: "Sai Snehdeep Hospital", address: "Plot 12-13, Sector 20 Koparkhairne Next to Indian Oil Petrol Pump" },
      { id: "ef1ec2f7-3690-42b1-abcc-562909e08b56", name: "Saijyot Hospital", address: "1st floor, Siddheshwar CHS, Plot No 105, Opp Punjab Nation Bank, Near Varishtha Hotel, Sector 2, Kopar Khairane" },
      { id: "ae72d4c5-aa26-4cc0-8b2e-ce6c28e6dfd7", name: "Satyam Multispeciality Hospital & Trauma Centre", address: "Plot No.12, Sector-14, Opposit D-Mart, Kopar Khairane , Mumbai" },
      { id: "1e570305-7072-4505-b0f8-53328f48b417", name: "Tej Vedaant Healthcare Private Ltd", address: "Plot No. 84, Natasha Tower, Opp Gurudwara, Sector 17, Koparkhairne, Navi Mumbai" },
    ],
  },
  {
    id: "f9da711f-2df0-4d0c-980f-96f490297e29",
    name: "Kopari (E)",
    clinics: [
      { id: "8c5397d1-8be4-43b4-a4d0-1c022b5ee02d", name: "Aarogyam Multispeciality Hospital", address: "Renuka Apt Opp Mangala High School, Near Thane railway Station Kopari (E)" },
    ],
  },
  {
    id: "0a23fc0d-499d-4044-9820-85c67fa04948",
    name: "Kurla",
    clinics: [
      { id: "3c64c468-fcd2-441b-9893-74dd7eda3e8d", name: "Criticare Asia Hospital", address: "Kohinoor City, Kirol Road, off LBS Marg,Kurla (west)" },
      { id: "ea78f77d-44bc-4962-a593-5ef03823f49c", name: "Kohinoor Hospitals Private Limited", address: "Kohinoor City kirol road of LBS marg  ,Kurla(W)" },
    ],
  },
  {
    id: "fb57c2f7-12f6-4535-a3be-4f9e5a20d7f6",
    name: "Kurla (E)",
    clinics: [
      { id: "adffbdce-696d-418d-a73b-fc74fe96c448", name: "V Care Hospital & Icu", address: "App Bldg No 101 Nehru Nagar Kurla East" },
    ],
  },
  {
    id: "1b0d3713-565c-421e-b4b0-1492c7de12ff",
    name: "Kurla (W)",
    clinics: [
      { id: "5b88112b-5a0b-462d-9113-41688b2d8fae", name: "Fauziya Hospital", address: "209, Solanki Apts, L.B.S. Marg kurla (West)" },
    ],
  },
  {
    id: "a1e554a3-fbcd-4918-b063-cf61809c2f17",
    name: "Louiswadi Service road",
    clinics: [
      { id: "1f051779-d192-48da-a265-d880c81d3065", name: "Amruta Nursing Home", address: "206/ 207, Landmark Arcade, Louiswadi Service road, Thane (W)" },
    ],
  },
  {
    id: "e159d4ea-1500-4f6d-bc63-95da8e239bc7",
    name: "M G Road",
    clinics: [
      { id: "e1da3362-3fe1-4e1e-9286-5f8258379360", name: "Horizon Hospital", address: "Malti Mohan Bungalow Opp Naupada Telephone Exchange M G road" },
    ],
  },
  {
    id: "9a1181d0-386c-473b-b5b5-5a732a6b537a",
    name: "Mahim",
    clinics: [
      { id: "fad7b152-945f-442f-a097-23a2a2a16262", name: "S L Raheja Hospital", address: "Raheja Rugnalaya Marg, Mahim" },
    ],
  },
  {
    id: "51f04b5a-7835-4c5f-8b5f-df32f37dbe3c",
    name: "Majiwadi",
    clinics: [
      { id: "bdd53ef6-715a-46ba-8fcc-a3d8f9b054dd", name: "Wavikars Eye Institute", address: "4th & 5th Floor Level, Amber Arcade, Off Bhiwandi Bypass Road, Near Lodha Paradise, Majiwadi, Thane" },
    ],
  },
  {
    id: "1aa3091d-39ac-4272-af54-04a6a515470b",
    name: "Malad",
    clinics: [
      { id: "770843ec-3ef9-4d57-8354-c8094a7bfe73", name: "Aditi Hospital", address: "1st Floor, Param Ratan, Opp. Post Office, Jakeria" },
      { id: "dc2bd8d1-012b-47da-81d0-96c417d1b1c6", name: "Agrawal Eye Hospital", address: "1st floor, maharaja apt, Malad (W), S V Road, opp. malad telephone exchange" },
      { id: "9122ddff-d43f-4651-b65a-3861dacf2ecf", name: "Cloudnine (kids Clinic India Pvt Ltd)", address: "Siddhachal building, Link Road, Malad(W)" },
      { id: "6d939c5b-edb7-427d-931b-11665e965683", name: "Jay Polyclinic Maternity & Nursing Home", address: "Amarshi Road, Malad (W)" },
      { id: "6041795b-6a2a-4a27-bfa4-e96ed514049a", name: "Maa Nursing Home And Netrajyoti Eyecare Centre", address: "Himachal Bldg,Opp.Sunder Nagar,S.V.Road,malad(w)" },
      { id: "636c1e71-c564-4f50-aa3f-376d1197d78b", name: "Riddhi Vinayak Critical Care And Cardiac Centre", address: "Pushpachandra Apt., 559/1, Riddhi Vinayak Temple Lane, Nr N. L. High School, S. V. Road, Malad (W)" },
      { id: "d1cea90c-7e23-495f-a9f7-c543689b7fe2", name: "Sun Hospital", address: "Excel House, Opp SNDT College, Near Libetry Garden, Malad(W)" },
      { id: "b26f707f-3c10-4e03-b509-d781754177a7", name: "Zenith Hospital", address: "Path Business Plaza Mith Chowki Link Road Malad (W)" },
    ],
  },
  {
    id: "4bac28d4-2f2f-47b5-8af7-1d3d9f0b611e",
    name: "Malad (E)",
    clinics: [
      { id: "2ac98173-3d19-4f14-8a78-1f27c520dbb0", name: "Aastha Maternity And Nursing Home", address: "101, 1st Floor, Bhoomi Residency, Vaishat Pada-2, Kurar Village, Malad (E), Mumbai" },
      { id: "fa141d41-c336-471e-9305-f9f12d25da65", name: "Balajee Hospital", address: "Shah Arcade 3, Rani Sati Marg, Near Passport Office, Malad (E), Mumbai" },
      { id: "380da9a2-bf2f-4492-9233-41e4ce9af78c", name: "Lifewave Hospital", address: "A-5, Sukh Sagar Mahal Chs, Bachani Nagar, Near Childrens Academy, Malad (E), Mumbai" },
      { id: "0a020f70-f84e-4095-9ad5-057b669bc991", name: "Mahavir Maternity &general Hospital", address: "Rushabh Apartment, Near JainTemple, Kurar Village, Malad (E) Mumbai" },
      { id: "901a34c7-a9a7-49f6-ab5e-5ac31bb0ea7c", name: "Sai Kripa Hospital", address: "Ashish Co-op Hsg Soc, Rani Sati Marg Off. W E High, Malad (E), Mumbai" },
      { id: "7566cf01-3f71-4146-a576-69dce4681d34", name: "Sanjeevani Surgical & General Hospital", address: "Bhavani Chambers, Kedarmal Road, Rani Sati Marg, Malad (E)," },
      { id: "22c8f86e-241a-475f-92d9-5d4e005e1852", name: "St Marys Maternity & Surgical General Hospital", address: "Om Sai Darshan chs ltd, Above Malad Sahakari Bank, Kurar Village, Malad (E), Mumbai" },
    ],
  },
  {
    id: "00376364-8f4d-4cc4-afb6-110936bc208a",
    name: "Malad (W)",
    clinics: [
      { id: "1415a413-c548-4dcd-a741-4ae4681ff776", name: "Aarush Ivf And Endoscopy Centre", address: "Prathmesh Harmony, Gautam Buddha lane, Opp Orlem Church, Off Marve Road, Malad west, Mumbai" },
      { id: "f9d75a0d-c7c5-477f-84e6-d35040550366", name: "Care Hospital", address: "1st Floor, A Wing, Annur Chs Ltd, Mhada Malwani, Malad West, Mumbai" },
      { id: "f97dc4dd-69e7-4ce5-99cd-20a2df31a39d", name: "Hayyat Multispeciality Hospital", address: "Unit No 1 And 2,Savera Heights Building Madhav Apartments Gate No 5 Malvani Malad West.Mumbai" },
      { id: "c13f3105-cc94-4ece-9480-b4a2d42ccccd", name: "Life Line Hospital", address: "Vishal Complex, A Wing, S V Road, Malad (W)" },
      { id: "154648b8-4aed-4008-9693-a5135abf472c", name: "Life Line Multispeciality Hopsital", address: "CTS 618/1-3, Neal Malad Subway Malad (W)" },
      { id: "4f68eca1-78be-47fe-954f-eb1e4c8641be", name: "Prakash Eye Care Centre", address: "Unit No 203, Link Lotus Bldg, Mith Chowky Signal, Opp Zenith Hospital, Link Rd Marve Rd Junction, Malad (W)" },
      { id: "865ac364-a8be-42aa-a220-00a8801ecf2a", name: "Raghukamal Hospital Eye Care Centre", address: "Anthshil 66, 3rd Floor, Orlem Marve Road, Above Dena Bank, Opp. Garden Court Hotel, Malad (W)" },
      { id: "0564d482-1777-4f2f-b680-65c82866cf78", name: "Raksha Multispeciality Hospital Pvt Ltd", address: "1st Floor, D-11, Asmita Jyoti Bldg, Near Atharva College, Charkop Naka, Marve Road, Malad (West), Mumbai" },
      { id: "6fbd232a-f48a-4147-aca5-04592f41aab2", name: "Surana Hospital & Research Centre", address: "Tank Road, shankar lane, near Skywalk Tower,near orlem church Malad (W)" },
      { id: "9c6a1f0a-5b9d-498f-a341-b5ce2b5108cf", name: "The Children Hospital", address: "Khandelwal layout, Linking Road, Malad West" },
      { id: "4d86dad7-b2bb-4efe-b92f-0dd5a8243e25", name: "Thunga Healthcare Llp", address: "Goraswadi Road, Opp Nirman Diagnostic Center, Malad (W)" },
      { id: "09159edf-9834-4a3f-b02f-37e6c8ef9b14", name: "Vardann Hospital", address: "C-2,D-2, Ground Floor, Sonal Link Residency Chsl, Mith Chowky Junction, Link Road, Malad (W)" },
      { id: "83e45c05-cc69-4b65-9379-4bc15f927d75", name: "Vivanta Hospital", address: "JP Residency, Chincholi Bunder Road, Malad (W)" },
    ],
  },
  {
    id: "fc043b83-a2f9-47d0-b2ef-1a56bb127e39",
    name: "Manpada",
    clinics: [
      { id: "136b42fc-8e73-40dc-8e5a-060dbf5f672a", name: "Orthonova Hospital", address: "201-205 Soham Plaza Soham Gardens Opp Manpada PetrOL PUMP Manpada Junction, Ghodbunder Road," },
      { id: "dd80ac66-8c56-4d96-8875-2edfa279e32a", name: "Oscar Multispeciality Hospital", address: "Near Manpada Signal, Tikujiniwadi Road, Off Ghodbunder Road, Manpada" },
      { id: "b255cdc0-fe6d-4837-b38c-2ec0a798ffea", name: "Titan Hospital", address: "soham plaza(N-E),Manpada circle,ghodbandar" },
    ],
  },
  {
    id: "9fafcdde-f3c8-4dc2-95ea-c124cf61b6ad",
    name: "Manpada Bus Stop",
    clinics: [
      { id: "a3a23862-2931-46e5-8927-9d8bedd3f212", name: "Max Vision Advance Eye Care Centre", address: "216-A, 2nd Floor, Soham Plaza, Manpada Bus Stop, G B Road, Chitalsar" },
    ],
  },
  {
    id: "3ffcf58f-016a-492b-bbbe-c4b84b578e79",
    name: "Manpada Naka",
    clinics: [
      { id: "52dda9eb-9b63-41b9-a49b-b95922e0130d", name: "Metropol Multispeciality Hospital", address: "202, 2nd Floor, Soham Plaza, G B Road, Manpada Naka, Thane (west)" },
    ],
  },
  {
    id: "7e70ee17-1dca-41c1-9d21-f4331c0b51de",
    name: "Marathon Square",
    clinics: [
      { id: "e6135f89-9053-49e3-9cdd-20fe9313dc7f", name: "Highway Hospital", address: "Dev Ashish-Building, Eastern Express Highway, Marathon Square" },
    ],
  },
  {
    id: "e296d832-7191-4cef-b6ef-5a278cb735a2",
    name: "Marin Lines",
    clinics: [
      { id: "b357dead-134c-4591-88bf-69f5cdec8026", name: "Bombay Hospital & Medical Research Centre", address: "12 Marine Lines" },
    ],
  },
  {
    id: "2e69516a-187b-4438-a814-105581aec81d",
    name: "Matunga",
    clinics: [
      { id: "dc7a0fb3-b701-42c8-b31c-37dc45033d74", name: "R&R Eyecare Hospital", address: "01 Ground Floor 376 Sanjay Building 2, Telang Cross Rd Number 3" },
    ],
  },
  {
    id: "bf0d69aa-3969-4d92-a32e-42b94be97412",
    name: "Mira Bhayandar Road",
    clinics: [
      { id: "783cd941-b316-451d-bed5-a59436cd54b5", name: "Balaji Hospital", address: "Sonam Ekata tower 1st Floor, Golden Nest Phase VI, Mira-Bhayandar Rd" },
      { id: "dad79f78-a194-4092-ac30-1a10ba78533f", name: "Riddhi Siddhi Hospital Pvt Ltd", address: "1st Floor ,Sheetal Plaza opp. Shivar Garden , Mira Bhayandar Road Bhayandar East Mumbai Maharashtra 401107" },
    ],
  },
  {
    id: "fa18e0a0-78df-4bb7-8e45-1e52dbb124ce",
    name: "Mira Road (E)",
    clinics: [
      { id: "abf221b7-2f27-4118-a6ce-0d730490f921", name: "Aarav Eye Care And Retina Centre", address: "No 5 And 14 Bhairav Residency, Kanakia Road, Near Cinemax Theatre , Mira Road East, Thane" },
      { id: "9a614e9c-fa52-4ac5-b5af-0bea1b09fa26", name: "A-care Orthopedic & General Hospital", address: "G-1,Giriraj Tower,Sai Baba Nagar,Opp.Indian Oil Petrol Pump,Bhayander Mira Road Highway,Mira-road(E)." },
      { id: "84870258-3fb5-4515-9d4c-7d9f1bf11c13", name: "Apex Kidney Care", address: "101 Eden Rose Complex Beverly Park Opp Cinemax Prime Multiplex Mira Road (E)" },
      { id: "7b3902dd-c9fb-41fa-8de1-fd29628bcc0c", name: "Aryan Child Care And Nursing Home", address: "RNA Complex, Borad Way Avenue, Near Jagged Circle, Next to Jammu Kashmir Bank, Mira Road East." },
      { id: "8df80c1b-1d1c-4497-8bc3-e1b98658db87", name: "Bhakti Vedanta Hospital", address: "Shristi Complex, Bhakti Vedanta Swami Marg, Near Dalmia School & Royal College," },
      { id: "f0a0d953-148a-43ff-bacc-0ce72c0292eb", name: "Deepak Orthopedic & General Hospital", address: "Holy Complex, Near Sai Petrol Pump, Opposite White House Hotel, Mira-Bhayandar Road, Mira Road (E), Thane" },
      { id: "fbdfe753-27a2-4deb-b197-358f9776741e", name: "Dr Dragos Life Line Health Hospital", address: "P-4, 101/102, Siddharth Nagar, Building No 8, Opp Snehanjali Electronic Showroom, Mira Road (E), Thane" },
      { id: "19116cba-319c-4ade-88b6-cb2bebe061ae", name: "Family Care Hospitals", address: "Opp Seven Square Academy, Ideal Park Road, Mira Bhayander Road" },
      { id: "096643a4-f277-4377-836b-04f27b827ea7", name: "Galaxy Hospital", address: "Vasudev Acrade, Kanakia Road, Ahead of Cinemax, Off Mira Bhayandar Road, Mira Road , Thane" },
      { id: "bf855da1-c93d-4671-b962-49e87c4da424", name: "Gayatri Maternity & Ent Hospital", address: "101,102,103, A-4, Sector 4, Shanti Nagar, Mira Roa" },
      { id: "993a7a7a-3896-4916-9209-df3666164551", name: "Global Multispeciality Hospital", address: "Stanley Regency, Kanakia Beverly Park, Nr. Cinemax, Mira Road (E), Thane" },
      { id: "0ce26a56-d9a9-48fc-b00c-b32ae1401715", name: "Gurukrupa Hospital", address: "Poonam Arcade, 1st Floor, Sheetal Naka, Near SK Stone Police Chowky, Mira Road(E), Thane" },
      { id: "1634209a-8cea-4dff-b305-b783e6472473", name: "Hitankshi Hospital", address: "Block No 401/402/403/404 Raj Oaks Building Near Donbosco School Mtnl Road, Shanti Park Miraroad, Thane" },
      { id: "f2e6ab20-66ad-4719-8b9c-91e0210409ae", name: "Lotuss Hospital", address: "B-4-5, / C1-2, Dev Paradise, Beveraly Park, Above IDBI Bank, Mira Road (E)" },
      { id: "ccf69248-eb5f-470c-9d1a-1638cd658b7d", name: "Max Care Hospital", address: "1st & 2nd, Floor Near N.H.School Road, Opp. Asmita College, Mira Road (E), Thane" },
      { id: "5939199b-48d3-49e5-ae9e-5288f8b6ef94", name: "Meditech Hospital", address: "Classic Country, Behind New Shahi Hotel, Mira Bhayandar Rd, opp. Old Petrol Pum, Mira Road East, Mumbai, Maharashtra" },
      { id: "b6c898eb-4bea-43b5-8bf6-398a0a6ce135", name: "Mehta Hospital & Fertility Center", address: "Rushabh Plaza, B-wing, Pleasant Park, Near Brand Factory, Mira Road (E), Thane" },
      { id: "b379d9f2-2dbf-4338-b00e-c8a906fc1069", name: "Om Hospital", address: "B/9 , Poonam Nagar, Phase III, Opp. Sector 7, Shanti Park , Mira Road (E)" },
      { id: "a6d97b5d-c968-43e0-b9de-d5c2d1d0311c", name: "Orange Hospital", address: "Garden Plaza Near Ideal Park Seven Square School Lane" },
      { id: "65d264a0-f340-41f2-a0d6-b1bb4fdd66d8", name: "Orbit Superspeciality Hospital", address: "Opp Amar Palav Hotel, Western Express highway, Mira Road (E)" },
      { id: "c10b1f0c-46bb-4c35-b4e3-779601f12e45", name: "Orchid Multispeciality Hospital", address: "1st floor, Marvel Building, Sanghvi Complex, Opp. A.J. Diagnostice, Payyade Hotel Lane, Kanungo Estate Road, Mira Road (E), Thane" },
      { id: "bb0bedb5-c641-4e06-9d72-cfe5469c16c0", name: "R G Stone In Collaboration With Bhakti Vedanta Hospital", address: "Bhakti Vedanta Hospital, Shristi Complex, Bhakti Vedanta Swami Marg, Near Dalmia School & Royal College," },
      { id: "7b575d06-8a46-4d92-ab34-badcb21f6a35", name: "Sai Aashirwad Hospital", address: "Shivam, Sai Sadan, House No.1, Behind Rassaz Shopping Mall, Evershine Enclave, Mira Road (E), Thane" },
      { id: "ea9d4fec-b9a1-4dc8-8070-1c392d9f759b", name: "Samartha Hospital", address: "Shop No 103 Ashadeep CHS Silver Park Mira Road (E)" },
      { id: "fe82d7ee-4c2d-419c-a00f-e0fc8c584816", name: "Shahlife Line Hospital", address: "Geeta Nagar, Phase VII, Mira Bhayandar Road, Near flyover Bridge, Mira Road" },
      { id: "08770815-b13b-4e8b-bc64-a1061ab39077", name: "Shambharati Hospital", address: "1st Floor, Poonam Srushti, Above Pizza Hut, Opp S.K Stone, Mira-Bhyander Road,Mira Road (E)" },
      { id: "068f79af-197b-43f2-b4d8-8049f7555309", name: "Shiv Om Hospital", address: "Shiv om towers mira bhayandar road,Mumbai,Opp. Golden Nest Complex,Poddar School" },
      { id: "b32a55cc-b58a-450b-80b4-0c0140c2ad67", name: "Shree Multispeciality Hospital", address: "1st floor, Shree Avenue Building, Opp Muncipal Garden, Ramdev Park, Meera Road (E), Thane" },
      { id: "8f56cc87-4493-44f5-b761-3d3ff51d7bbf", name: "Sushrut Maternity And Surgical Nursing Home", address: "102, Bld No.5 Sidhartha Nagar, Mira Road (E)" },
      { id: "ede676ea-bf72-4ec3-a58c-ee07d731f36c", name: "Tanwar Hospital", address: "Tanwar Tower, P K Rd, Mira Road (E)" },
      { id: "1e6de18e-40c9-4740-9f8a-3366e4cef10f", name: "Thunga Hospital Pvt Ltd", address: "renuja dham,nearraymonds showroom,mira bhayander road,mira road east." },
      { id: "ba807e4c-151c-46ba-a83c-c23ec803be22", name: "Wockhardt Hospital Ltd", address: "Asmita Enclave Mira Road Thane" },
      { id: "5b2a11c3-094e-4b9d-a445-6d733d25cd71", name: "Yashoda Maternity & Nursing Home", address: "First floor, Sanghavi Sai Dharshan, Near Silver Park, Opp Saibaba temple, Mira -Bhayander road, Mira Road East." },
    ],
  },
  {
    id: "d9ef94f6-5248-4dd5-b9a9-74045b0c0a14",
    name: "Mulund",
    clinics: [
      { id: "8ac94a64-c4b5-46db-a942-7eb132ff5539", name: "Aastha Health Care", address: "Mulund Colony, Off LBS Rd, Opp Chheda Petrol Pump" },
      { id: "6e073fa4-d678-4970-af4b-756d6050ca7e", name: "Apex Kidney Care", address: "Gaurav Plaza Annex 1st Floor RRT Road Mulund (W)" },
      { id: "a6c0c29f-41d1-4ad4-911c-fef6ad23a8d2", name: "Ashirwad Critical Care Unit & Multispeciality Hospital", address: "1st floor Meghdoot apartment, Opposite Kaidas Auditorium, Junction of PK Road and Ambedkar Road Mulund West 400080" },
      { id: "9a87e4de-3222-45cf-9b66-5fca9dffae9f", name: "Ashirwad Critical Care Unit And Multispeciality Hospital", address: "Tilok Heights, 1st and 2nd floor, Above kotak Mahindra Bank, L. T. Road, Mulund (E), Mumbai" },
      { id: "03f15852-6b92-4d5c-8ecd-a861835b3254", name: "Ashwini Hospital & Iccu", address: "Lalan Building (Annexe), 1st Floor, P. K. Road, Mulund (W)" },
      { id: "105f2ed5-b680-4330-a42d-cab4ec3ba9f6", name: "Chandraganga Spandan Hospital", address: "Chandraganga Apartments, VB Phadke Marg, Near Subway, Mulund (E) , Mumbai" },
      { id: "a02fa838-222d-4221-93d4-6f231d4c2118", name: "Dhanwantary Hospital & Iccu", address: "545, Netaji Subhash Rd Mulund (W)" },
      { id: "d9fc4757-f00a-4bbd-b9f3-822ef2a17912", name: "Dr Shetty Ent Hosptial", address: "9, Lavkush, Above Hotel Kriti Mahal, M.G. Road, Panch Rasta, Mulund (W)" },
      { id: "ae51ec54-1961-442d-87df-59ab66319c59", name: "Eye heal Hospital", address: "NEAR JAIN MANDIR,SARVODAY NAGAR,MULUND WEST,MUMBAI-400080" },
      { id: "5a1db9d3-01e1-46d4-9370-f8d4306daf2e", name: "Fortis Hospitals Ltd Mulund", address: "Sector-44, Mulund Goregaon Link Rd," },
      { id: "df985c2d-2b7b-4fbb-8aeb-7406785cf8c5", name: "Platinum Hospital", address: "colours space shopping mall, G-103,D D upadhyay marg , mulund Check naka ,Mulund" },
      { id: "e6461a2b-f098-4abb-92bf-d17ac7a81091", name: "R G Stone Urology Centre (hira Mongi Navneet Hospital Mulund)", address: "Valji Ladha Road Mulund w" },
      { id: "5cbb11fa-61f9-46bf-966c-d824c98b8446", name: "Saarthi Hospital", address: "JAMUNA SADAN, 1ST FLOOR, M G ROAD, NR. PAANCH RASTA, MULUND WEST, MUMBAI - 400080" },
      { id: "bc13aa78-f5ba-4d98-a6da-e68ae9f51af5", name: "Surya Eye And Research Center Private Limited.", address: "104, Aroto House, P K Road, Saidham, Mulund (W)" },
    ],
  },
  {
    id: "aed63c97-815f-425c-9d79-faa45877c830",
    name: "Mulund (W)",
    clinics: [
      { id: "b9943926-8c20-4f0e-896f-832109bc8790", name: "Aditi Hospital", address: "185 - R, Alhad, P.K Road, Above Corporation Bank Mulund (W)" },
      { id: "eb886763-4739-4622-a081-94f11a4e6046", name: "Apex Hospitals Mulund", address: "Veena Nagar Phase -II, Near swapna nagari, Model town and tulsi pipe line, mumbai" },
      { id: "8ab5bad0-e118-4259-bc53-cdf55fa643d1", name: "Ashirwad Maternity & Nursing Home", address: "E-5, HIGHLAND PARK, GGS ROAD, MULUND COLONY, MULUND (w), MUMBAI-400082" },
      { id: "a5a671cb-0a39-47f1-8679-b1d4808354e0", name: "Contacare Eye Hospital", address: "Ground Floor, Behind Reliance Trendz, Neptune Uptown Building, Opp Mulund Post Office , Netaji subhashchandra Road, Mulund (W)" },
      { id: "dd5bf24a-f2be-4895-a1f6-b83d4fdfbc3b", name: "Cuddles N Cure Children Hospital", address: "1st Floor, Janam Ashish Bldg, DD Road, Opp Mukhi Raj Hospital- Mulund (W)" },
      { id: "bf4b6f61-ca4c-4ae9-988c-b0dd6d1685ee", name: "Dr Mukhis Raj Hospital", address: "Devidayal Road ,Opp Hdfc Bank, Mulund (W)" },
      { id: "75d84686-4a4c-4616-96e6-3a50e0a3bf0e", name: "Gokul Nursing Home & Iccu", address: "1st Floor Munshi Estate, M G Road Mulund (W)" },
      { id: "2b3a443a-d2ce-451b-9b82-489511a19f77", name: "Hira Mongi Navneet Hospital", address: "Valji Ladha Road Mulund (W)" },
      { id: "7689a956-5fae-4a9f-8e65-ac4029a030fb", name: "Manisha Universal Multispeciality Hospital", address: "2nd Floor, Manisha height, vaishali Nagar, Near HP Petrol Pump, LBS Road, Mulund (W)" },
      { id: "935b372d-8616-4ac2-b4cf-c295e70fd81e", name: "Meher Ambe Hospital", address: "Rajsneha Bldg S N Road, Opp Rationing Office, Mulund (W)" },
      { id: "e4046079-40e8-478c-a511-02b2880cb064", name: "National Hospital & ICCU", address: "Vikas Paradise, 1st Floor, Bhakti Marg, Off LBS Ro, Mulund (W)" },
    ],
  },
  {
    id: "3a1f34ab-95ac-415e-bb37-316d99567b3a",
    name: "Mumbai Central",
    clinics: [
      { id: "279770db-19d8-4b46-9aa8-ee2a469dbcce", name: "Srcc Children Hospital ( Unit Of Narayana Hrudalaya Ltd)", address: "1, Keshrao Kadam Marg, Haji Ali Govt Colony, Mahalaxmi, Opp Welligaton Club" },
      { id: "8882f8b6-18bf-454f-b084-c0faad706ba4", name: "Wockhardt Hospitals Ltd", address: "Dr Anandrao Nair Road, Mumbai Central, Mumbai" },
    ],
  },
  {
    id: "bc6a40a1-64ad-42af-9344-c949d89cc0d6",
    name: "Naigaon (E)",
    clinics: [
      { id: "554f1334-9331-4909-a7a0-a4c7b358120c", name: "Siddharth Hospital", address: "Rashmi Pink City, Near Don Bosco School, Naigaon (E), Palghar" },
    ],
  },
  {
    id: "9c6301ec-f310-47b0-917f-618e51558fe1",
    name: "Nalasopara",
    clinics: [
      { id: "90afee98-9dd8-4998-9bce-87a6a04de3ad", name: "Ashirwad Nursing Home", address: "C Wing, Seema Complex, Tulinj Road, Moregaon Talao" },
      { id: "5a3c1b7f-4338-460f-bc97-6f2b985ff0ec", name: "Manorama Nursing Home Unit-II", address: "SHREE OMKAR CHS LTD, PRINCE PARK, BLDG NO 05, VIRAR ROAD" },
      { id: "bb5bbd50-11b2-4430-9fa2-5eaf06a3562a", name: "Star Hospital", address: "STAR HOSPITAL, BESIDES KRISH GARDEN BLDG, OPPOSITE SHANI MANDIR, LAXMIBEN CHHEDA MARG, PATANKAR PARK, NALLASOPARA (WEST), PALGHAR 401203" },
    ],
  },
  {
    id: "5319d762-47c3-4c53-99c2-abfe4eb1c0b3",
    name: "Nalasopara (W)",
    clinics: [
      { id: "1a4d670c-c794-4398-9142-208226925b04", name: "Abhinav Maternity & Nursing Home", address: "A-01, Ground Floor, Chawre Arcade, Station Road, Nalasopara (W), Palghar" },
      { id: "0fdf89fe-7f81-4e21-b984-1c360344b7dc", name: "Badar Multispeciality Hospital", address: "339, Nesco House, Nawayat Nagar, Near Burhan Chowk, Nalasopara (W, Palghar" },
      { id: "23ceade5-0359-4a89-a58d-54db34220166", name: "Riddhivinayak Multispeciality Hospital", address: "Plot 302, Near Railway Carshed, Ahead of Fun Fiesta Mall, Virar Nalasopara Road, Nallsopara West" },
      { id: "8c3a6949-bd5d-455f-b75d-dfe41b04b0f7", name: "Seema Multispeciality Hospital", address: "Chawre Avenue, Nile more, near Fly over, Opp Snehanjali Electronices, Nalasopara-West" },
      { id: "e1dcdd2a-7f4e-4b5b-9b15-72532238dfff", name: "Sushrut Hospital", address: "Satyam Complex 1st Floor Station Road Opp Axis Bank Nallasopara (W)" },
      { id: "c0225696-0a3d-445a-9a77-6c903889098b", name: "United Multispeciality Hospital", address: "Paccha Plaza ,Samel Pada Nalasopara West.Dist - Palghar" },
    ],
  },
  {
    id: "033de79a-a30b-42f4-b321-eee2fcdaf8b3",
    name: "Nallasopara (E)",
    clinics: [
      { id: "3c61c2fd-083d-434c-bd82-7d1bb3795985", name: "Apollo Childrens Hospital", address: "Jay-Vijay Nagar, Opp Saraswat Bank, 100 ft link Road, Nalasopara (E)" },
      { id: "469c1082-8b9e-4027-b8f8-9cb468bed85c", name: "Dr More Hospital", address: "First Floor, Vimal Paradise Bldg, Opp Ramdev Xerox, Sainath Nagar Road, Nalasopara (E), Palghar" },
      { id: "6a89cfc6-c30b-4023-b025-c19bf890057d", name: "Garden View Nursing Home Pvt Ltd", address: "Garden View SOC, Tulinj Road, Nallasopara E" },
      { id: "f4ba7c05-233e-482a-92ac-47865c3fb1b2", name: "Jeevan Jyoti Trust Hospital", address: "Sitaram commercial Complex , Santosh Bhuvan Naka , Nallasopara (E) Palghar" },
      { id: "6c0a650a-8210-4af1-a4f5-390ca9d52dae", name: "Jivdani Hospital Pvt Ltd (alliance Hospital)", address: "Attmavallabh Society, Achole Road, Nalasopara (E)" },
      { id: "fdc0a4a4-dc6a-4abf-a285-8a59b956ccac", name: "Lifecare Charitable Hospital", address: "C Wing, Martin Commercial Complex, New Link Road, Opp Mother Mary English High School, Nallasopara(E)" },
      { id: "dbe60725-71b5-47ad-a628-b89d8aa11527", name: "Manorma Nursing Home", address: "Sai Sadan, Building No 3,  Ambawadi Opp, Divine School, Nalasopara (E)" },
      { id: "e01d4f6e-d399-41da-96a0-b36e87bbef1a", name: "Om Sairam Nursing Home", address: "Veer Spendor Building, No. 1, Nallasopara Station Rd, Yashvant Viva Twp, Nalasopara East" },
      { id: "fc173151-b4d9-4b98-9c08-d61d217cbbb2", name: "Risha Eye Hospital", address: "B-01/02, KRISHNA RETAIL SPACE, OPP. K.M.P.D. SCHOOL, TULINJ ROAD, NALLASOPARA EAST -401209" },
      { id: "64b1fc7c-07b3-450d-b1c7-b91880c83b10", name: "Vijayalaxmi Maternity, Surgical & General Hospital", address: "A/101-104,Savita Appartment,near new kanchan school,nallasopara." },
      { id: "1c654676-1401-478d-8fe2-9e6630b7f641", name: "Vinayaka Hospital", address: "Doctor House, Opp Anchor Park, Village Achole, Nallasopara (E), Vasai" },
    ],
  },
  {
    id: "7b52f236-5c84-4579-a94f-192534b89c73",
    name: "Naupada",
    clinics: [
      { id: "8cdb6ccd-eb49-4c64-b95c-ba88956d162d", name: "Aryan Eye Clinic & Day-care Surgery Centre", address: "202, Vinita Aptt, Nr Malhar Theatre, Nr Vodafone Office, Gokhale Road, Naupada, Thane" },
      { id: "bd7b4d64-4cad-481f-9345-2fb3fade0b18", name: "Contacare Eye Hospital", address: "Hariniwas Circle, Next to Giriraj Heights, LBS Road, Naupada, Thane" },
      { id: "e5978df4-d959-49c8-b4c1-76481a8396ee", name: "Dr Shahs Unique Smile & Visioncare Clinic", address: "1, Priyadarshni Apt, Near AK Joshi Bedekar English High school, Mahatma Phule Road," },
      { id: "27c7c065-b43e-404d-bccf-d687cd0d65d6", name: "Icon Multispeciality Hospital & Icu", address: "Gala No-5, Ground Floor, Jitendra Co-op Housing Society, Near Hariniwas Circle, Naupada, Thane(W)" },
      { id: "fc14f94c-8808-4164-818e-1f6bf0d79ea1", name: "Ortho Centre Hospital", address: "Ananya, First floor, Gantali Devi Road, Near Ghantali Devi mandir Road, Naupada, Thane W" },
    ],
  },
  {
    id: "796b175c-6959-4dd6-8350-635620dd6c4d",
    name: "Navpada",
    clinics: [
      { id: "54cee40a-0f05-4d5f-baef-5c1371a89456", name: "Dr Godboles Heart Care Centre Pvt Ltd", address: "M G Road Navpada Opp Sarasvati Marathi School" },
      { id: "9de3712b-fa4a-4a62-b4e0-1afe26c2e928", name: "Pooja Nursing Home", address: "1st Floor, Shridhar Smruti, Behind Deodhar Hospital, Gokhale Road" },
      { id: "40940fc4-b9a7-4ea0-a23d-c3d2ade16922", name: "Revival Bone And Joint Hospital", address: "Yojana Bld.,Off. Gokhale road near malhar cinema naupada thane west" },
    ],
  },
  {
    id: "a5919bde-97ab-4cba-896b-6d53f1255f42",
    name: "Near Makhmali Talao",
    clinics: [
      { id: "1ec6d45e-71d8-4379-bd0b-fe9560aa5332", name: "Shree Ramkrishna Netralaya", address: "A 101/102/103 Shree Balaji Co-op, Hsg Society,1st Floor near Makhmali Talao, opp Risk care hospital LBS marg," },
    ],
  },
  {
    id: "8ba7f581-bbff-4740-bb05-ba7db7287ff7",
    name: "Near dahisar",
    clinics: [
      { id: "a49b6d38-7f07-4646-a607-9853ed1a592e", name: "Shraddha Hospital", address: "A, A2,B2, Ranjan Ritika, Near dahisar Police stan," },
    ],
  },
  {
    id: "e246871a-4bf4-45cd-ad60-3fdfa1d044c4",
    name: "Nerul",
    clinics: [
      { id: "64465823-e032-41c2-b2c6-541cf8552ad0", name: "Apollo Hospital Enterprise Limited", address: "Plot no.13, Parshik Hill Road, Off uran Road, Sector 23, Opp Nerul Wonders Park" },
      { id: "4b4c34a2-0913-4df5-9950-fc94c8d10180", name: "Dr D Y Patil Hospital and Research Centre", address: "Sector 5, Dr D Y Patil Vidyanagar" },
      { id: "8cf16089-2077-4c79-8a59-e3646f661cee", name: "Eyemax Super Speciality Eye Centre", address: "104, Neelkant Plaza, Opp Dmart, Sector 40, Nerul Seawoods, Navi Mumbai" },
      { id: "140f651b-d00d-4290-9133-53145d14cf41", name: "Ojas Nursing Home", address: "Plot No 8-3, Sector 8, Nerul, Phase-II, Behind M G M School" },
      { id: "bbe09a50-fe21-43ab-ac90-a21a04b77f57", name: "Patoria Eye Clinic", address: "301, Mahavir Niwas, Sector - 21" },
      { id: "d42fe000-5ad7-41ec-9e6f-3a8eede3d49a", name: "Shushrusha Heart Care Centre & Speciality Hospital", address: "Plot no 22 A Phase III Plam Beach Road Sector 6 Nerul, Navi Mumbai" },
      { id: "36f5747a-cdcf-461c-854e-01327add9114", name: "Sunshine Hospital", address: "Plot No.3, Sector-16, Opp  Sea Breeze Society, Nerul(W)" },
    ],
  },
  {
    id: "7f62a071-988c-4532-b1ec-73ff3d5220d2",
    name: "New Panvel",
    clinics: [
      { id: "8ae1db30-cb6f-4873-968a-f9f0cdc2a7ba", name: "Ashtavinayak Hospital", address: "Plot - 10, Sector 6, Khanda colony, opp khandeshwar lake" },
      { id: "a07b2da1-91de-4f64-9270-c771ca28f03e", name: "Chirayu Children Hospital", address: "4th Floor, Neel Enclave Sector-9, Khanda Colony" },
      { id: "0cc79a80-2329-4043-82aa-cddd022ee773", name: "More Hospital & Icu", address: "A / 101,102, Shop No. 1,2,Shree Sai Shardhha Soc, Plot No12, Sec17, Khanda Colony New Panvel East, Panvel" },
      { id: "1d8e45c4-d833-455f-94fb-599882697a0d", name: "Padalkar Hospital & Sicu", address: "105 Neel Enclave, Sec 10, Khanda Colony, New Panvel, Navi Mumbai" },
      { id: "5918c328-0783-4ff1-9700-063c6916762d", name: "Panacea Hospital", address: "Plot no.105/106, Sector -8, New Panvel (E) Navi Mumbai" },
      { id: "5a01c055-36e7-41cf-bd61-b18436b29956", name: "Sai Child Care Clinic (dr Mohites Amrut Medical Foundation)", address: "Plot no 5-7, Vijay Marg, Opp fire Brigade, Sector 19, New Panvel (E)" },
      { id: "08a3fe4e-de88-4f99-a624-cc316cbb1378", name: "Shelar Hospital & Icu", address: "Tulsi Perana CHS, Sector-1, Plot No-9, Khanda Colony, New Panvel, Raigad" },
      { id: "d0918472-b5d7-4ada-8edf-fdbb63593fae", name: "Shri Ramkrishna Nursing Home", address: "Prajapati Cascade, 1st Floor, Sector-1, Road No.18, New Panvel, Raigad" },
      { id: "065c76d2-abca-46b4-b84b-e266bba1b9f2", name: "Veer Hospital & Icu", address: "Neel Exclave Bldg 2nd Floor Plot no 1 sector 9 Khanda Colony New Panvel" },
    ],
  },
  {
    id: "3c59078d-2b25-4cf8-9797-0b4b76c01ab1",
    name: "Nr Esis Hospital",
    clinics: [
      { id: "38f53fbb-3010-4f1a-be00-d01a59017457", name: "Pranjali Maternity Surgical & General Hospital", address: "Veer Savarkar Nagar, Opp R J Thakur College" },
    ],
  },
  {
    id: "3867035f-fbf1-43b4-998f-107dc2ba0d08",
    name: "Old Bombay Agra Road",
    clinics: [
      { id: "80a5ed72-19f5-41c9-a75a-7508796dfe2f", name: "Adityavardhan Hospital", address: "Sadichha Tower, 1st Floor, Old Bombay Agra Road, Next to Royal, Thane" },
    ],
  },
  {
    id: "8e2dafc6-ed26-4f2f-8b29-13d5be7bca69",
    name: "Old Panvel",
    clinics: [
      { id: "f07f2bf8-c4e2-4c92-80c4-997dcc318951", name: "Aadhar Multispeciality Hospital & Icu", address: "1st Floor, Gurusharnam Complex, Vishrali Naka, Market Yard Road, Old Panvel" },
      { id: "1e52e04c-0717-4d28-87f0-da180e6f56c1", name: "Gandhi Hospital", address: "142 MCCH Society, Near Kohinoor Tech Institute" },
      { id: "bfc7b3a2-9009-4daf-8ccf-2924194e88bb", name: "Nairs Eye Clinic", address: "plot no.68,mihir villa ,opp.juma masjid,sec.-4,panvel" },
      { id: "0da5d014-a66d-4d69-83a6-d65e5b3f947a", name: "Niramay Hospital", address: "Plot No.148, Vasudev Balwant Phadak Road, MCCH Society Panvel , Old Panvel, Raigad" },
      { id: "cd76a593-44a7-4de9-a9cd-63ff846df469", name: "Paramount Clinic & Medical Research Centre", address: "Paramount House, Near Rupali Theatre, Shivaji Road, Panvel" },
      { id: "d365655a-f5d4-4daf-b032-edd8e65aba39", name: "Prachin Healthcare Hospital", address: "Plot No 69/2 Behind Hotel Garden Panvel" },
      { id: "0ccfa155-22eb-4dbc-9114-8fd03b0f1abd", name: "Purohit Clinic", address: "Plot 78, MCCH Society Near BAMS High School,Panvel" },
    ],
  },
  {
    id: "5d325492-8182-4c1b-830c-af28200688b4",
    name: "Opp Nerul Railway Station",
    clinics: [
      { id: "4fd33309-14e2-4cca-ad48-0e57452aeb9c", name: "Terna Sahyadri Speciality Hospital & Research Center", address: "Plot No 12, Sector-22, Phase-2, Nerul (W), Opp Nerul Railway Station, Navi Mumbai" },
    ],
  },
  {
    id: "0f80324c-d552-4d3d-85b3-0be5e763a878",
    name: "Opp Orion Mall",
    clinics: [
      { id: "20f02173-dc12-4b31-b681-f5814bb0bf67", name: "Sparsh Superspeciality Hospital", address: "141, Sai Arcade, Mission Compound, Line Ali, Opp Orion Mall" },
    ],
  },
  {
    id: "f8d22894-400d-40a6-9c5e-19bc5b599f2f",
    name: "Panchpakhadi",
    clinics: [
      { id: "6d48c9af-a5c0-40d4-8ea9-28bbf222b3f3", name: "Aayush Multispecialty Hospital & Advanced Laparoscopy Centre", address: "1st Floor, Marigold Apt. Opp Nitin Co & Honda Showroom, Panchpakhadi, Thane (W)" },
      { id: "d30c6fe5-a782-4ece-97c9-20fc5fa01dd8", name: "Advanced Orthopaedic & Joint Replacement Centre", address: "Pasaydan,near TMC Building,Panch Pakhadi,Thane(W)" },
      { id: "6969389b-98e7-4c92-92e9-6461299b5882", name: "Kaushalya Medical Foundation Trust Hospital", address: "Ganeshwadi, Panchpakhadi, Behind Nitin Company" },
      { id: "036f966f-06f0-488f-8580-86ddb2e6f05e", name: "Pinnacle Orthocenter Llp", address: "First Floor, Blue Nile, Chandanwadi Signal, Panchpakdi, LBS Marg, Thane(W)" },
      { id: "015d63d7-7f63-449d-acec-95d14c516bd6", name: "Shivneri Hospital And Advanced Urology Center", address: "Near Vandana Cinema, Opp  S.T.Mahamandal Depot, Panchpakhadi, Thane" },
    ],
  },
  {
    id: "264e69db-42ba-4994-91d5-55e58ce08bf0",
    name: "Panvel",
    clinics: [
      { id: "aa3aaa59-8ef1-4e87-8e67-c3cfcc062a63", name: "Hande Hospital", address: "1st floor, Vasant Kunj CHS, Ambedkar Road, Panvel 410206" },
      { id: "23861aff-0111-4385-997f-30971ebd651d", name: "Life Line Hospital", address: "Sai Arcade, Shivaji Road, Amit Appts., Opp.ST Stand" },
      { id: "4037f050-1e24-4614-9627-0325e8c67046", name: "Shushrusha Superspeciality Hospital", address: "5th-6th Floor, Old Sutika Gruha Building, Near Old Post Office, Pathvardhan Road, Old Panvel, 410206" },
      { id: "221028ef-37af-408d-95f3-8b2b9f62fef3", name: "Sukham Hospital", address: "Ganesh Nagar , Behind Ganesh mandir, Karanjade, Panvel" },
      { id: "2806291c-4acc-4b5c-8d77-6064e4e34bed", name: "The R Jhunjhunwala Sankara Eye Hospital", address: "PLOT NUMBER 13,SECTOR 5A, NEW PANVEL MAHARASHTRA- 410206" },
    ],
  },
  {
    id: "4ca55755-37e4-439f-9fc2-5fc84cd6d53f",
    name: "Panvel City Police Station",
    clinics: [
      { id: "d338cef8-e620-4e1d-9021-082f495385a2", name: "Patel Clinic", address: "Kuber Apartment, Joshi Ali, Panvel City Police Station" },
    ],
  },
  {
    id: "1f12edca-3d45-4293-a37e-a89b3db80399",
    name: "Parel",
    clinics: [
      { id: "75ee00e0-17bf-4f1f-a484-56693d3d90ae", name: "Global Hospital Super Speciality & Transplant Centre ( A Unit Of Centre For Digestive & Kidny Diseases (india) Pvt Ltd)", address: "35 35 Dr E Borges Road Opp Shirodkar Higschool Parel" },
    ],
  },
  {
    id: "e126d7ea-6247-495c-873e-ddd8a5888dc8",
    name: "Parel (E)",
    clinics: [
      { id: "08f19d57-214e-4bda-b3c6-07e31128d1a0", name: "Sparsh Children Hospital", address: "Krish Royale, 1st, 2nd, 3rd floor, Acharya Donde Marg, next to Dutta mandir, Opp Wadia Children Hospital, Parel Naka, Parel (E), Mumbai" },
    ],
  },
  {
    id: "3fff85f3-ef09-423c-a22e-7a8041099d07",
    name: "Peddar Rd",
    clinics: [
      { id: "f2dbdd70-f142-4706-a907-e9feabfa65df", name: "Jaslok Hospital And Research Centre", address: "15 G Deshmukh Marg Peddar Road" },
    ],
  },
  {
    id: "52d61daa-e891-4db1-b321-0f245f12e36f",
    name: "Pokharan Road",
    clinics: [
      { id: "947174e1-04bd-49e3-af20-c6abda7d3c1e", name: "Wellam Hospital And Diagnostics", address: "1St Floor, Tiara Commercial Complex , Pokharan Road No-2,Opp Gandhi Nagar Water Tank, Thane-400606" },
    ],
  },
  {
    id: "3e5b90d2-788a-466f-a2f5-b01365bb706f",
    name: "Pokharan Road No 2",
    clinics: [
      { id: "e3abe66d-fab0-49e9-9ac0-75e5cf11960e", name: "Swayam Hospitals", address: "Tiara Commercial Complex, Ground Floor, Pokhran Road No. 2, Vasant Vihar, Thane W" },
    ],
  },
  {
    id: "e8b73398-fadf-4c39-ad20-d3040c62677a",
    name: "Pokhran Road",
    clinics: [
      { id: "0f007fe2-d5dd-48b6-998b-2aa16ecaa35f", name: "Bethany Hospital", address: "Lok Upvan Phase II, Smt. Gladys Alvares Marg opp MA Niketan" },
    ],
  },
  {
    id: "39d1172a-ef8f-4e2f-b229-aaf42e173244",
    name: "Powai",
    clinics: [
      { id: "8e682b58-2d57-43f2-ab31-f9e0f0252547", name: "Dr L H Hiranandani Hospital", address: "Hillside Avenue, Hiranandani Garden, Powai" },
      { id: "face4f96-a00d-4529-ac86-8d6871c1c2cb", name: "Powai Polyclinic And Hospital", address: "19/A, Opp I.I.T. Main Gate, Powai" },
    ],
  },
  {
    id: "1643955e-0238-42ac-b0b4-eb78c6ccde47",
    name: "Ram Maruti Road",
    clinics: [
      { id: "e2b44c9a-4794-4983-bfb4-52184db3d01b", name: "Dr More Eye Centre", address: "7, Yogesh Society, Ground Floor, Near ICICI Bank, Ram Maruti Road" },
    ],
  },
  {
    id: "618ef0b6-3e62-483d-97b0-16b7743a38d0",
    name: "Sanpada",
    clinics: [
      { id: "6ed7aad6-8c9e-4dd8-85b9-af9c98d82be9", name: "Advanced Eye Hospital & Institute", address: "30 the abbaires Sector 17 palm beach road sanpada" },
      { id: "2d724e48-3793-4500-98f0-3c941b3f7319", name: "Dr R N Patil Suraj Hospital", address: "Opp. Palm Beach Marg , Plot No 1 & 1 & 1A, Sun Palm View Building Sector No-15," },
      { id: "b7e6b091-a1ed-480b-b130-940830db57bb", name: "Mangal Prabhu Nursing Home", address: "Mangal Prabhu Polyclinic Plot No 27 Sector 24 Sanpada-Juinagar" },
      { id: "d3214c22-6cb0-44f2-a53e-1749d443d414", name: "Mpct Hospital", address: "Plot No 7, Sector 4, Near Swami Vivekanand college and School, Sanpada (E)" },
      { id: "7e1586d6-ff11-4006-9e1f-a498e4c86a5d", name: "New Milliennium Multispeciality Hospital", address: "Plot No 17 C, Sector 5, Sanpada" },
      { id: "b8c76658-661d-42ae-9f92-566c289acc66", name: "Neway Hospital", address: "Plot No.34, sector -6, Sanpada" },
      { id: "77edb753-df00-4fec-be6a-460c0d49a287", name: "Sai Drishti Eye Hospital", address: "11, Natraj CHS, Plot 15, Sector-4, Sanpada, Sanpada Railway Station" },
      { id: "f337e12c-ad4d-45a6-853e-cc79d457a064", name: "Siddh Pooja Hospital", address: "Plot No. 51,  Sec. 1, Pam Beach Sanpada 4 , Sanpada" },
    ],
  },
  {
    id: "9c101df7-b677-4ee0-88c8-bb3a0b11da31",
    name: "Santacruz",
    clinics: [
      { id: "f5a3b876-3a69-4c97-9147-4b98def44f15", name: "Dattatreya Nursing Home", address: "Opposite Bandhutva CHS, Datta Mandir Road, Near Patuck College, Vakola Bridge," },
      { id: "e5c7f8d0-9dbb-4846-a1b7-8b6bb43d19b7", name: "Dr Kamdars Nursing Home", address: "Rizvi Nagar Junction of S V Road, Milan Subway Santacruz W" },
      { id: "810856d0-7f36-4eaf-ad4e-c4fa95fc38f3", name: "Siddhi Nursing Home", address: "16/121, Anand Nagar, Near Vakola Bridge, Santacruz E,  MUMBAI" },
      { id: "41515b60-765c-4d0e-8b24-0e4a8bfe9752", name: "Surya Childrens Hospital", address: "101,102 Mangle Ashirwad Junction of SV Road TPS 2, Dattatray Road" },
    ],
  },
  {
    id: "5291eacb-a906-449f-a370-2acb28cf1fd1",
    name: "Santacruz (W)",
    clinics: [
      { id: "5c627da6-1f2c-41c0-9b0a-aeb4170b6fae", name: "Kashiben Mangaldas Trust Hospital", address: "Harihar Niwas, Besant Street, Santacruz ( West ), Mumbai" },
      { id: "aaa16eb5-1770-49c0-8b22-fb1267d94d77", name: "Sarla Hospital & Icu (sarla Nursing Home)", address: "5 D, Dattatraya Road, Santacruz (W)" },
    ],
  },
  {
    id: "36e4ca37-d149-430b-a73c-a8ecd4a155c6",
    name: "Savarkar Nagar",
    clinics: [
      { id: "71911386-f2d8-4660-8625-962c7c4fdea5", name: "Dr Veer Hospital", address: "First floor, Saikripa CHS, Near Yashodhan Nagar Bus Stop, Savarkar Nagar, Thane" },
      { id: "21755662-d1ad-4549-9355-a25efce2859f", name: "Saidham Hospital", address: "Shiv Sai Aprt, Patil Wadi, Near Minatai thakre Udyan, Savarkar Marg, Wagale Estate" },
    ],
  },
  {
    id: "06ef9bf7-2fba-4a39-9706-a2d79bb8654a",
    name: "Seawoods",
    clinics: [
      { id: "dcee41ab-a914-40bb-8af3-d3016de99613", name: "Shree Ramkrishna Netralaya", address: "The Residency, Shop No.1/2,Sector 46 A / Plot No.4,Opp More Super Market.Seawoods Navi Mumbai" },
      { id: "1df11c4a-97ff-4c67-add1-708957a5aedf", name: "Suyash Hospital", address: "51 Ugam complex Sector 40 Seawoods west Navi Mumbai" },
    ],
  },
  {
    id: "16d900f4-d55e-453c-8b9b-2063f6ed44c6",
    name: "Shahapur",
    clinics: [
      { id: "e14b51b6-acab-4137-a242-888b280db37b", name: "Crystal Care Hospitals", address: "Asangaon Shahapur Dist.Thane" },
    ],
  },
  {
    id: "a044e5c7-bfa6-43c6-bb0d-c8a1639a5c91",
    name: "Shivaji Chowk",
    clinics: [
      { id: "65b7ec35-9260-4bb7-8ac3-20631517d0e2", name: "Unnati Hospital & Icu", address: "J K Plaza 1st Floor Opp Durgamata Mandir Shivaji Chowk" },
    ],
  },
  {
    id: "ccb5e24a-c22c-4ab1-8313-251dc2baada9",
    name: "Shivaji Nagar",
    clinics: [
      { id: "854a90bf-6a5a-4d97-a696-ff919427e94d", name: "Sai Hospital & Icu", address: "Hira Moti Shopping Centre, 2nd Floor, Near Checkna,Shivaji Nagar" },
    ],
  },
  {
    id: "3a0889a3-4d86-46a3-bbae-0b77de386173",
    name: "Shivaji Road",
    clinics: [
      { id: "4d33ec0e-0618-4d80-9171-84fa9fdce2d8", name: "Mhatre Accident Hospital", address: "Shivaji Road Opp Oanvel ST Depot" },
    ],
  },
  {
    id: "b274d70e-deed-40ec-8c70-6cc105e60bf6",
    name: "Sion",
    clinics: [
      { id: "b5ec0a27-cd29-40f7-ba68-ed594dccc9f1", name: "Atharva Hospital", address: "1 Floor Saiprasad Bldg, Namdev Koli Marg" },
      { id: "b8331771-54ea-429a-9a06-83000c444410", name: "K J Somaiya Hospital & Research Center", address: "Somaiya Auyrvihar, Opp Eastern Express Highway , Sion E" },
      { id: "9f375e2b-9499-447d-a9cf-c94162686536", name: "Smt S R Mehta & Sir K P Cardiac Institute", address: "Plot No 96, Road No 31, Near Gandhi Market, King Circle" },
    ],
  },
  {
    id: "94ef93c3-4037-4d20-b674-25cd511890af",
    name: "Sion (W)",
    clinics: [
      { id: "3911ad6d-0ef2-4314-865a-3207f7de8d72", name: "Ashirwad Nursing Home", address: "Rajgir sadan ground Floor laxmi bag Opp Sion railway St. Sion W" },
    ],
  },
  {
    id: "40735560-e829-45e9-970e-6630fc208f83",
    name: "Taloja",
    clinics: [
      { id: "2d5a94aa-fee0-4616-b009-1385c6694ecb", name: "Apex Multispeciality Hospital", address: "1st Floor, Krishna Aracade, Plot No, 3, Sector 11, Taloja, Navi Mumbai" },
      { id: "21e9da21-5195-4908-be09-29a962b00351", name: "Venkatesh Multi Speciality Hospital", address: "A- 13, Silver Spring,Plot No. 6,Taloja Midc, Opp. Dena Bank Taloja, Navi Mumbai, Taloja , Panvel" },
    ],
  },
  {
    id: "fa54d769-53b6-4799-bf37-8a19505a0061",
    name: "Taloja MIDC",
    clinics: [
      { id: "bbb4f34c-fdb0-4790-a71d-d90994ed634b", name: "Jeevan Jyoti Multispeciality Hospital", address: "Near Axis ATM, Chindran Road, Devichapada Taloja MIDC, Panvel, Raigad" },
    ],
  },
  {
    id: "8ea97f39-6b23-40fa-8a90-01a076f22bc5",
    name: "Tardeo",
    clinics: [
      { id: "aa8e28a9-e156-48f4-a4ba-bb9482948d75", name: "Apollo Spectra Hospitals A Unit Of Apollo Specialty Hospitals Pvt Ltd", address: "156 Famous Lab, M M Malviya Road Behind Everest Bldg,Tardeo" },
    ],
  },
  {
    id: "6dcc5bbf-e068-4f51-a887-2900c3a9d758",
    name: "Thane",
    clinics: [
      { id: "b56ac1ec-68e0-441e-b80a-4cb36a2da217", name: "Dr Amar Karkhanis Superspeciality Hospital", address: "Soham Plaza, Tikuji Ni Wadi Rd, Manpada Flyover, Manpada, Thane West, Thane, Maharashtra 400607" },
      { id: "31a996a8-eff0-48d0-afe4-72161383f08a", name: "Dr Aphale Eye Hospital", address: "B Wing 2nd Floor Thakkar House Castle Mill" },
      { id: "4eb3b286-f895-4cde-938b-044b1c2ad05c", name: "Lakecity Hospital", address: "2&3 Jai Siddhi Vinayak Premises, Near Cadbury Junction, Khopat, Thane (West)" },
      { id: "df1cda95-603c-4153-a00e-297caa4821a2", name: "MOC - Cellcure Cancer Centre", address: "1st Floor, Blue Nile Building, Charai Chandanwadi Signal, junction of Almeida Raod and LBS Road, Thane west 400601" },
      { id: "89d17dae-7b13-46b2-961c-5f0279b76732", name: "Nimai's Borneo Mother & Child Care Hospital", address: "1st and 2nd floor,Larkins 315 ,Namdeo Wadi Marg,Panch Pakhadi ,Thane" },
      { id: "454757c9-4b96-4975-b87f-447714fb2dae", name: "Oscar Hospital", address: "Nr Kasarvadavali Signal, Opp Jain Mandir G. B Rd, Thane" },
      { id: "a5faeac3-5f23-4be9-90a0-bf03f88fa8a4", name: "Trupti Hospital Maternity Surgical & General", address: "COSMOS PARADISE,DEVDAYA NAGAR, THANE (W)" },
    ],
  },
  {
    id: "5724fa88-3c16-4bd4-8871-962da0fe18b2",
    name: "Thane (W)",
    clinics: [
      { id: "1f1d0d89-3bc5-491a-b3ce-9735656f40e9", name: "Currae Speciality Hospital ( Unit Of Patni Healthcare)", address: "Near Big Bazar, Kapurbhudi Junction Thane (W)" },
      { id: "643a58f2-0fde-48aa-a4a3-77a9a63404cd", name: "Dr Bhanushali Hospital", address: "Kaushalya Shivaji Path" },
      { id: "c276ca0e-a2d1-4ad9-85f3-2a8ab9b5a151", name: "Dr Gadgil Eye Hospital", address: "Ground Floor, Shreyas Apts, Ramchandra Nagar No 1" },
      { id: "86d8f2f0-01b8-4fd1-ab45-85495a63175b", name: "Horizon Prime Hospital", address: "Vibgyor, B- Wing, Patlipada, Ghodbunder Rd, Near Hiranandani Estate, Behind Ritu Nissan Showroom, Thane West, Maharashtra 400607" },
      { id: "689d450d-68e0-452a-9c61-0715616aec80", name: "Infinity Medisurge Centre", address: "Shop No 1, Below Wavikar Eye Hospital, Ambar Aracade, Majiwada, Thane (W)" },
      { id: "46494bdc-364d-44da-af98-28970fa7ed3e", name: "Kaizen Super Speciality Hospital", address: "Ranka Chambers ,Ramchandra Nagar Near Nitin Company Thane West 400604" },
      { id: "2a1f691b-bdd3-4ed3-8e8a-167acaabc8bb", name: "Kevalya Hospital", address: "Sidhi apartment, near vijay garden,opp. Suraj water park,G.B.Road, Thane (W)" },
      { id: "9b450f1c-a328-4800-91c7-24f3724a7538", name: "Laxmi Jyot Eye Hospital", address: "A-101, Dharamveer Building, Opposite Municipal School No 7" },
      { id: "9c678c2d-81d3-40c6-841a-bd1f489d3338", name: "Mauli Hospital", address: "Shop No.2, Mauli Medical, Mauli Builuding Balkum Pada 2, Thane (W)" },
      { id: "c6377d01-61ff-4a37-8223-44a0a522f1b1", name: "Omkar Hospital & Icu", address: "first floor, Om Sai Apartment, Balkum Pada No 2, Balkum, Thane(W)" },
      { id: "6a587f09-7507-4a5a-ac0a-729893cf7eff", name: "Ranade Superspeciality Eye Centre", address: "103, Soham CHS, Above Karekar Jewellers, Opp. ShivSagar Hotel, Ram Maruti Road, Thane (w)" },
      { id: "881452d1-09de-4ef1-955c-78e1458db946", name: "Sahil Hospital", address: "1st Floor, Tawde Niwas, Khopat, Thane (W)" },
      { id: "4ea3aacb-d1cf-4551-b7a7-ad57455a1db3", name: "Varad Hospital & Icu", address: "Vaity Villa, Janardhan Vaity Marg, Utalsar Naka, Thane (W)" },
    ],
  },
  {
    id: "8ac44acd-e807-4b3e-8e28-5061d0672229",
    name: "Titwala (E)",
    clinics: [
      { id: "becd4dd0-3424-4228-aca5-a8c88f752791", name: "Mahaganpati Hospital", address: "Plot No. 75/75, Radhanagar, Near Saibaba Temple, Titwala E" },
    ],
  },
  {
    id: "0d3ea32a-b8cb-4926-be01-4798fd28903c",
    name: "Ulhas Nagar",
    clinics: [
      { id: "774077a2-8777-42ed-8ae2-b905c3901b3f", name: "Shraddha General Hospital", address: "1st floor, Vishal Marriage Hall Bldg, Hospital road,Near Nehru Chowk" },
      { id: "1bbf1722-6f01-4bda-bfe1-1615ec737c6f", name: "Surekha Criticare Hospital", address: "Ground & 1st Floor Doctor House Near Ashok Anil Multiplex, Ulhas Nagar, Thane" },
    ],
  },
  {
    id: "ab6a8054-f0a9-4428-89be-9503f9c7fe78",
    name: "Ulhasnagar",
    clinics: [
      { id: "28e472f9-7953-439c-917a-e05fa60eda14", name: "Dhanvantari Hospital", address: "Lal Chakki Chowk, Station Road, Ulhasnagar" },
      { id: "628a8475-68ab-4d1e-a883-36903583d614", name: "Gungeet Hospital & Polyclinic", address: "A/823 R No.1645, G R D Complex, Gandhi Road" },
      { id: "0d4e093a-c885-43a1-8193-e71445b339a8", name: "Life Care Hospital", address: "M.S. Manzil, A-block road, Near Gurudwara , Shahad Station road(E), Ulhasnagar-01 (E) Thane" },
      { id: "108ae8cc-4eaf-4124-b8b5-1f1d0665d659", name: "Phoenix Hospital Pvt Ltd", address: "Block No 895/1789, Near Guru Nanak High School, Kurla camp Road, Ulhasnagar(E)" },
      { id: "1d8f1229-e1cb-4ffa-aa7e-69934909ccb2", name: "Sai Criticare Hospital", address: "Block C-1, Room No 2, Opposite Roshan Apartment, Ulhasnagar" },
      { id: "9344b28f-5d38-465b-ad1e-db1c643cd1e2", name: "Sanjeevani Eye Hospital & Leser Vision Centre", address: "2ND Floor Alsinghani Chember, Near SBI bank, Kalyan Ambernath Road, Ulhasnagar" },
      { id: "36b7f95b-8850-40bd-83d6-7723bb27f98f", name: "Satya Sai Platinum Hospital", address: "Gala no. G. -1, Floor, Seva Niktan Bldg, Near Aman Talkies, Ulhasnagar, Thane" },
      { id: "8ed567e0-9353-47f4-873b-321cb0a13c88", name: "Shree Maternity And General Hospital", address: "C-586, sector-25, Manera Road, Ulhasnagar, Near Welfare School, Ulhasnagar 421 004" },
      { id: "debe390d-e0a4-46cb-b2fb-10f36c11afe0", name: "Swami Sarvanand Hospital", address: "Near Old Bus Terminus, Ulhasnagar Thane" },
      { id: "9a94ea7e-7d06-46e8-99fb-ecd5e327c0af", name: "Tomar Nursing Home", address: "Prabhu Apartment, Near Union Bank of India" },
    ],
  },
  {
    id: "6a1a7d26-37fd-4346-82a9-64fbb668d448",
    name: "Ulwe",
    clinics: [
      { id: "dda5301d-f6dc-4e74-8a3f-1ef99b54d2d7", name: "Balaji Hospital", address: "Ground floor, Shop No 1, Plot No 84, Sector 5, Near Canara bank, Ulwe, Raigad" },
    ],
  },
  {
    id: "c79dcef4-a7fb-4604-98e2-5b8ba5ef3551",
    name: "Uran",
    clinics: [
      { id: "ccca7e78-2f95-428f-a125-eb17f6f2f800", name: "Care Point Hospital", address: "Plot No 45 Sector-29 Dronagiri Node, Uran, Navi Mumbai" },
      { id: "183b4b95-2d0a-4863-8208-4bfc60823f40", name: "Shree Childrens Hospital", address: "1st Floor, Harikrupa Apartment, Balai Road , Uran, Mumbai" },
    ],
  },
  {
    id: "1e797368-e6c3-4cd8-995c-e97f8f547739",
    name: "Uran Naka",
    clinics: [
      { id: "7b03afc4-d799-4fa1-ab14-ab9e08d03641", name: "Panvel Hospital", address: "101/102, Plot No 260 A, Riddhi Siddhi Plaza, Uran Naka, Old Panvel" },
    ],
  },
  {
    id: "650d4618-4cfc-4182-bd73-e8bdaf4c5e3e",
    name: "Uran Road",
    clinics: [
      { id: "eeb9a2c5-ae47-4639-9045-83f2ac4a19da", name: "Laxmi Eye Institute", address: "Near State Bank of India, Panvel, Hamid Mulla Road, Uran Road, raigad" },
    ],
  },
  {
    id: "72348da3-70dc-4ec8-872b-63a746319288",
    name: "Vartak Nagar",
    clinics: [
      { id: "a86b0d62-db4c-4ea4-85da-da486e17cf60", name: "Life Care Hospital", address: "S-1, 1st Floor, Vedant Complex, Above ICICI Bank, Vartak Nagar, Thane West" },
      { id: "67253727-d017-44ad-a9f9-10caa28d4438", name: "Siddhivinayak Multispeciality Hospital & Icu", address: "236 -263 , first and Second Floor, Vedant Complex, vartak nagar, Thane West" },
      { id: "65bc4445-cddc-4a32-b344-076d26c9fdea", name: "Tulsi Memorial Hospital", address: "12/13/60/61, 1st floor,S-2, Vedant Commercial Complex, Vartak Nagar, Thane" },
      { id: "37984f63-a888-4da8-b991-c2dd0dfe7dc6", name: "Vedant Multispeciality Hospital & Research Centre", address: "S 3 2nd Floor Vedant  Commercial Complex Vartak Nagar" },
    ],
  },
  {
    id: "b55ef3c7-bfd5-4afa-bfdc-fb2cb0b1b848",
    name: "Vasai (E)",
    clinics: [
      { id: "a3d21179-13b2-4904-a7a1-acb87b845b8e", name: "Arth Hospital", address: "Rashmi Villa No.1, Near Agarwal Circle, Vasai-Nallasopara Link Road, Vasai (E)" },
      { id: "7c3c12a8-11a4-49a4-8e3b-a59b4c089e24", name: "Dr Goyal Children & General Hospital", address: "B-1, B-2, B-3, EC-36, Sai vatika co op hsg soc Aangan, Evershine City," },
      { id: "6c6ad5f1-71c7-401e-ba4a-990621816273", name: "Iasis Hospital", address: "Evershine City, Near Hormony Bludg, Vasai (E)" },
      { id: "e4bde83b-f17d-4646-9864-b17e0dfda056", name: "Ozone Multispecilaity Hospital", address: "Ground Floor, Gagan Supreme Bldg, Next to fire Brigde Office , Vasai -Virar New Link Road- Vasai (E)" },
      { id: "52050054-4c7b-4901-a07d-82e4e86a97a6", name: "Shree Siddhivinyak Multispeciality Hospital", address: "A wing, 1st floor, Madhuvan Heights, Bldg 1, Mandhuvan Twonship, Nr. Evershine Gate, Gokhivare, Vasai (E)" },
    ],
  },
  {
    id: "b2c7ceaa-c623-4484-a42e-7daea397f86e",
    name: "Vasai (W)",
    clinics: [
      { id: "5df8b09c-28b3-45db-8b42-9366fe91d0bb", name: "Cardinal Gracias Memorial Hospital Trust (dir Mailer)", address: "Bangali Naka  Chandur P O Vasai West  Dist Thane" },
      { id: "871e0621-0630-4213-9973-584cfcd20bb5", name: "Dsouza Hospital", address: "Opp. Ramedi Church School. Ramedi, Vasai (W)" },
      { id: "acd0e13c-19d6-4bd4-9d0a-52d71acdc94d", name: "Golden Park Hospital", address: "Behind Parvati Cinema Vasai Road (W), Vasai" },
      { id: "e1f4ce92-3c3f-4142-8ea0-8dc4be8701f0", name: "Indu Diabetes Specilaity Diabetic Footcare Hospital", address: "953-1, J.C.House ,Plot No.20, Near K.T. Wadi Hall, Diwanman, Vasai West, Bassein Road" },
      { id: "3553a456-af7e-4ccf-bb53-51e3e14eabd5", name: "Ishaan Urology Centre", address: "Gr. Floor Surya-Sagar Bldg, Behind Gurudwara, Near Railway Station Vasai (W) Thane" },
      { id: "29f28c2d-6be2-4820-8ce1-35192d8dcf1e", name: "Janseva Healthcare Llp", address: "1st Floor, Dattani Prism - 1, Behind Dattani Square Mall, Papdy, Vasai (W), Palghar" },
      { id: "7c48c119-1e54-443d-b3c0-88bf5f618a30", name: "Kalpana Lifeline Hospital", address: "Plot No 16, Opp Akshaya Hotel, Ambadi Road, Vasai (W)" },
      { id: "02fe17e9-4e75-4811-8860-4b3d7015b926", name: "Krishna Hospital", address: "Prabhu Niwas, Meena Nagar, Ambadi Road, Vasai (W)" },
      { id: "cb383d98-9b97-471a-9920-63932cf62c09", name: "Om Hospital", address: "Shreepant Nagari, Opp Shani Mandir, Azad Road, Paraki Remedi Vasai west" },
      { id: "0ee48530-d0fb-47d6-96df-3a7db6652d49", name: "Platinum Hospital Pvt Ltd", address: "Shree Sanklap siddhi complex Opp Range Office Vasai" },
      { id: "c39bb966-b9c9-49eb-a2a1-b9880412e94d", name: "Shree Sai Multispeciality Hospital And Icu", address: "Grnd And 1 St Floor , Shantajyot Shopping Center, C.H.S Ltd, Manickpur Station Rd ,Vasai{ W} , Palghar" },
      { id: "f0f66f64-89a3-49e9-a98f-81acf7a17e82", name: "Shreyas Hospital", address: "Dream House, Sainagar, Ambadi Road, Vasai (W)" },
      { id: "15604bcf-e44f-435b-8bd5-b0ec16730592", name: "Vatsal Eye Care & Laser Centre", address: "B/2 Panchal Nagar, Station Road, Vasai West" },
    ],
  },
  {
    id: "bfa9bed2-cef5-447c-98c4-46649f8bb2c1",
    name: "Vashi",
    clinics: [
      { id: "d537357c-aa45-4931-a6f5-3095539e3440", name: "All For Eyes Eye Hospital", address: "B2/18/1, Sector 16, Vashi, Navi Mumbai" },
      { id: "b26ac701-3b9d-45e0-b510-8d046744471f", name: "Cloudnine Hospitals (kids Clinic India Pvt Ltd)", address: "Plot no 17, Sector -19D, Palm Beach Galleria Mall, Vashi, Navi Mumbai" },
      { id: "eab84176-1446-4ae5-b430-ad8cca663f07", name: "Contacare Eye Hospital", address: "Mahavir Ratan Building, Plot no 13, Sec 12, Vashi, Navi Mumbai" },
      { id: "0bb91bfd-72cb-4b70-964f-548c23aa21da", name: "Dr Choudhary Stone & Multispeciality Hospital", address: "Rainbow Society, F7, B2+C1 , Sector, 10, vashi Navi Mumbai" },
      { id: "0bcead40-9b84-4d80-b84b-061ea75ba827", name: "Dr Yewale Multispeciality Hospital For Children", address: "Plot No 6B Sector 9, Vashi, Navi Mumbai" },
      { id: "d65026d4-3d0f-4360-b939-7d6d9fced253", name: "Fortis Hiranandani Hospital", address: "Mini Sea Shore Road, Sector 10 A, Vashi" },
      { id: "9d8d0abb-a3a6-4095-9bb1-77f5c393dead", name: "Lotus Multispeciality Hospital & Icu", address: "Balagi Sadan, Plot 20-D, Sec-15, Near Modern College, Vashi" },
      { id: "1c0e0f88-7a27-42c8-b324-7632a4245473", name: "MGM Hospital", address: "PLOT NO.35,SECTOR NO.3,VASHI,NAVI MUMBAI-400703" },
      { id: "57ce2708-12a0-41c5-a840-e41cd2bc820f", name: "Mgm New Bombay Hospital", address: "Plot No.35, Sector 3, Near Vashi Police Station" },
      { id: "0c0d432c-463c-410a-bf8e-c5c14539d670", name: "Navjeevan Hospital & Iccu", address: "Archana jyoti 1st floor plot no-18, sector 17,Near Central Park, DBC vashi Navi Mumbai" },
      { id: "6b80b6d1-cf6d-4d52-b8ff-4f2cd9027d80", name: "Pkc Hospital", address: "Plot No 57, Sector -15 A, Vashi, Navi Mumbai" },
      { id: "6d988270-23cd-4fa9-8fd9-14fc73b1266f", name: "Sunshine Eye Care Hospital", address: "F-4, B-2, Above Warna Dairy, Sector -9, Vashi, Navi Mumbai" },
      { id: "9f077b0c-adb9-44ce-bf10-752fb6eaff97", name: "Swaraashi Netralaya", address: "Plot No. 16, Zone 5/199, Unit No. 2, Sector -28, Vashi, Navi Mumbai" },
    ],
  },
  {
    id: "36cb8ffb-df3a-46ed-9258-557270552943",
    name: "Vichume Village",
    clinics: [
      { id: "7fce5420-96be-4cf1-a729-97135e8d4d2f", name: "Lifecare Multispeciality Hospital And Nursing Home", address: "Shop No, 1,2,18, Om Ajaili Apartment, Near policy Chowky, Vichume Village" },
    ],
  },
  {
    id: "56838bb0-c521-4eae-b4c7-5bb95c6df88f",
    name: "Vikhroli",
    clinics: [
      { id: "c1548bcb-ed5a-4545-a18a-0b3652def9e7", name: "Godrej Memorial Hospital", address: "Pirojshanagar, Vikhroli (W), Mumbai" },
      { id: "9fbd90e8-2eb4-40c8-a2cd-da184305d07a", name: "Modi General Hospital & Icu", address: "237/3258, Opposite municipal market, Tagore nagar, Vikhroli (E)" },
      { id: "fc8c7f32-049c-4f09-9d8f-52e4bc994647", name: "Ruby Medical Centre", address: "283/3633, Tagora Near Group No. 2, Near taxi Stand" },
      { id: "3fb26660-ed34-48e0-8914-9bac1cfe6818", name: "Yashwant Hospital", address: "Tagore Nagar, Group No 8-B, Opp Tagore Nagar Post, Vikhroli(E)" },
    ],
  },
  {
    id: "608c3162-bb83-49c6-8238-18c49fda57b6",
    name: "Vikhroli (E)",
    clinics: [
      { id: "3750cb42-b583-4958-b99e-ea03c6be5d8a", name: "Laxmi Health Care Centre & Iccu", address: "210/3042, Near Sangali Sahakari Bank, Tagor Nagar No 1, Vikhroli (E)" },
      { id: "118b9842-5441-47d8-ba2b-1b4b42a78f79", name: "Romeen Medico Surgical Hospital", address: "Group No.1, Near BMC School, tagore Nagar -1, Vikhroli (E)" },
      { id: "35de9f45-b4c3-4bb4-b689-9602cba6a7c9", name: "Shushrusha Suman Ramesh Tulsiani Hospital", address: "Plot No.356/A/2, Lt.Atamram Surve Marg, Vikhroili (E), Mumbai" },
      { id: "c1467cf6-e726-4bf1-b6ae-a829ed018327", name: "Vin- R Eye Care & Laser Centre", address: "B/F-001, Sai Shraddha CHS. LTD,B/H Bus Depot, Hariyali Village, Vikhroli(E), Mumbai" },
    ],
  },
  {
    id: "24a9c121-8e80-4fed-baac-b2706ad47921",
    name: "Vile Parle",
    clinics: [
      { id: "baee0136-475c-4cf2-aed1-dbf92d7961f2", name: "Anideep Eye Hospital And Institite Pvt Ltd", address: "Plot no. 414, Next to Golden Tobacco Compound," },
      { id: "b79f99b1-049c-4bdd-9d8a-56fef2af3de2", name: "Cellcure Cancer Centre Pvt Ltd/ Mumbai Oncocare Centre Vile Parle", address: "A-4-5-6, Majatha Apartments, 2nd Floor, Gods Gifts Premises, S.V. Road" },
      { id: "a9d12b95-f4ba-4c60-826b-cc1b4e93f8f4", name: "Dr Balabhai Nanavati Hospital", address: "S V Road Ville Parle (W)" },
      { id: "bdc48753-2f25-4348-b8ba-66857b110298", name: "Khandwalas Eye Hospital & Hem Polyclinic", address: "D-31, Navmangal CHS Ltd, 1st Floor, Above Venilal Saree Shop, Next to Golden Tabacoo Factor, S V Road" },
    ],
  },
  {
    id: "af31980a-7b29-4dbe-b6ca-89a08dcca5c7",
    name: "Vileeparle (E)",
    clinics: [
      { id: "cdfe2772-00a2-46e7-8b37-6e44779d36c6", name: "Four Care Hospital", address: "Vishnukrupa Building Mahant Road Near Utkarsh Mandal Vile Parle East Mumbai 400057" },
    ],
  },
  {
    id: "3daa2c64-0e86-43b4-a0a6-5d1eda66c33f",
    name: "Ville Parle",
    clinics: [
      { id: "765d3da6-516c-4485-94fc-740976894f5a", name: "Cellcure Cancer Centre Pvt Ltd", address: "S S House, 1st floor, Nehru Road, Vile Parle East. Mumbai 400057" },
    ],
  },
  {
    id: "bebbcb05-a086-4e67-9264-2d0087cbfe6d",
    name: "Virar",
    clinics: [
      { id: "5fdf5a69-ad5f-4185-98e9-4ba517bbeee3", name: "Sahayog Hospital & Research Centre", address: "Yashwant Vihar Complex,Bolinj Virar (W)" },
    ],
  },
  {
    id: "9409741c-d130-4ddc-9e5c-87e53b90cc7d",
    name: "Virar (E)",
    clinics: [
      { id: "8ad1fbe2-fe50-4e54-8dbf-4e3a58f0080c", name: "Asian Eye Institite And Laser Center", address: "Puspa Plaza, First floor, Above Snehanjali electronics, Opp Raliways Station , Virar East" },
      { id: "9a2f03f6-f980-4f7c-a31f-17f3bbf3cdf7", name: "Priyadarshani Nursing Home", address: "1st,2nd & 3rd floor M-Baria Estate Kargil Nagar Road Opp- Manvel Pada Talao Virar East,Palghar-401305" },
      { id: "5a2d3d3e-6a05-4537-b1e6-ecf9e5a78507", name: "Shubham Lifeline Multispeciality Hospital", address: "Makwana Complex, Veer Savarkar Marg, Near Ganpati mandir, Virar (E)" },
      { id: "ee16a085-9879-4d8e-997d-9a3a2a9b2c0e", name: "Yashoda Childrens & General Hospital", address: "B/10,Madhu Maitry Apartment.Above PMC Bank.Near Manvel Pada Talav,Virar -East, 401303" },
    ],
  },
  {
    id: "fc0b1276-2c76-4768-afe6-fcf9a59e7da3",
    name: "Virar (W)",
    clinics: [
      { id: "bbe57715-7dbd-4b81-b237-344b668d1c78", name: "Abhyuday Maternity Home", address: "Prerna Building No.1, Opposite Octroi Naka, Virat Nagar, Virar (W), Palghar" },
      { id: "96ce60a5-ec11-44a6-9283-dcb524290b8c", name: "Anand Netralaya", address: "Office No. 2, Charbhuja Apartment, Opposite disha hotel, Kharodi Naka, Bolinj, Virar (W), Palghar" },
      { id: "3bde4eb6-83a2-4f45-b0b3-b3dcfd044b34", name: "Ankur Paediatric Hospital & Nicu", address: "#204, Thakur Tower, Raja CS Marg, Virar (W), Thane" },
      { id: "8b8278e8-f7a1-48db-a579-79184e1a8469", name: "Global Hospital", address: "Ground Floor, Yashwant Siddhi, Y K Nagar, Star Planet Hotel, Virar (W)" },
      { id: "91e8e8fb-2348-4005-b4ba-578221b89e2b", name: "Infigo Eye Care Hospital", address: "Shop No-10, 12-20, Building No-9, Twin Tower, Tirupati Nagar, Phase 2, Virar (W)" },
      { id: "ccb9b7d0-1f0b-427b-b7fa-e9c0e7e9bce8", name: "Mahavir Hospital", address: "ARIHANT Bunglow, MB Estate, Ram Mandir Road, Virar, Thane" },
      { id: "c0ab9a15-45fd-4e48-bace-8eb9a96ed11a", name: "Omkar Orthopaedic Hospital", address: "B 102/103, Prathmesh Vihar Co Operative Housing Society, Virar Agashi Road, Virar (W) , Thane" },
      { id: "2c34fb84-becd-4fd2-aee1-b3776a88ec2d", name: "Vijay Vallabh Hospital And Research Center", address: "Tirupati Lifecare LLP Unit, Tirupati nagar, Phase 1, Bolinj, Virar (W)" },
    ],
  },
  {
    id: "47986f9a-9af2-4e3e-8863-f0fa08265c06",
    name: "Wagle Estate",
    clinics: [
      { id: "84b914d7-35a8-4f75-925b-c880bc623d8f", name: "Aarogyadhan Hospital", address: "Rajdhani Apartment, Kishan Nagar Road 2, Wagle Estate, Thane (W)" },
      { id: "78073f71-bc5d-40b2-ac27-64c33db5408b", name: "Dr Thakurs Shree Hospital", address: "Sukh Laxmi Buld,Opp Tata fision,shreenagar ,wagale estate" },
      { id: "875aec1b-2e88-4b91-a1ae-f764fee795bc", name: "Modi Hospital", address: "Shreenagar, Wagle Estate, Thane (W)" },
    ],
  },
];

async function main() {
  console.log('Seeding Mumbai areas and clinics...');

  // Verify tenant exists
  const tenant = await prisma.tenant.findUnique({ where: { id: TENANT_ID } });
  if (!tenant) {
    throw new Error(`Tenant ${TENANT_ID} not found. Create the tenant first.`);
  }

  let areaCount = 0;
  let clinicCount = 0;
  let areaSkipped = 0;
  let clinicSkipped = 0;

  for (const area of areas) {
    const existing = await prisma.area.findFirst({
      where: { tenantId: TENANT_ID, name: area.name, deletedAt: null },
    });
    if (existing) {
      areaSkipped++;
      // Still process clinics under the existing area
      for (const clinic of area.clinics) {
        const ec = await prisma.clinic.findFirst({
          where: { areaId: existing.id, name: clinic.name, deletedAt: null },
        });
        if (!ec) {
          await prisma.clinic.create({
            data: { id: clinic.id, tenantId: TENANT_ID, areaId: existing.id, name: clinic.name, address: clinic.address },
          });
          clinicCount++;
        } else { clinicSkipped++; }
      }
      continue;
    }

    await prisma.area.create({
      data: { id: area.id, tenantId: TENANT_ID, name: area.name },
    });
    areaCount++;

    for (const clinic of area.clinics) {
      await prisma.clinic.create({
        data: { id: clinic.id, tenantId: TENANT_ID, areaId: area.id, name: clinic.name, address: clinic.address },
      });
      clinicCount++;
    }
  }

  console.log(`Areas created: ${areaCount} | skipped: ${areaSkipped}`);
  console.log(`Clinics created: ${clinicCount} | skipped: ${clinicSkipped}`);
  console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());