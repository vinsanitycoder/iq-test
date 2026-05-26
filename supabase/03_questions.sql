-- ============================================================
-- Applicant Logical Test — Question Bank (production export)
-- Run AFTER 01_schema.sql and 02_rls.sql
-- Replaces old SVG-based questions with symbol-based versions
-- Safe to re-run: uses ON CONFLICT (id) DO UPDATE
-- ============================================================

-- Remove old questions that no longer exist in production
DELETE FROM questions WHERE id NOT IN (
  '0025bdcc-31d3-4fc3-9244-fabd4d5d384e',
  '006ed051-137b-474b-8c6d-f1b5868a49fe',
  '02afd508-214f-456e-abc4-1337d0db85cb',
  '030f71e9-0752-4552-83d6-df174599f8c2',
  '042d99ab-6edb-4796-b362-8c37bcfe0358',
  '04737a68-24cc-4bfd-b662-88e3ef329264',
  '05f92684-831f-4952-a60f-5319007a5ea8',
  '0731829d-f0be-48e6-80b4-d75ae85526d9',
  '0807f21e-cb45-43d2-9667-0e91619dd993',
  '089eda8d-cd20-4135-945d-dda7fa49f156',
  '08e6745b-b598-4b79-af05-b1916b0cc407',
  '09d22f2a-af97-4a23-a65d-74bb270de1da',
  '0a0e6e7c-4bce-4da7-85ae-7c10445a49fb',
  '0bd1b81d-bd0c-43c7-b722-8abf78000df9',
  '0c4fa4f8-3597-47f2-9ff4-d6651478dbc0',
  '0e50fa62-1bf7-48af-b54c-638a7eba20ee',
  '0f7c5e8e-fe05-4d8c-aa1a-a4601fe9de77',
  '10e8b883-2b34-4382-9dd3-2200336344b4',
  '10eed578-cefd-4750-8cd5-c77958702b63',
  '10ef54d9-7f1f-42a5-b351-8a3be8706ca7',
  '10f90885-3c7b-4a8d-95b1-f78f52eeeb95',
  '11a70ad4-7ec7-4aa7-9be3-faafbaa3c1c0',
  '1225bd61-d7f8-4950-91df-827e917cd338',
  '124aa793-e4ad-4271-a39e-c0de25619812',
  '128b1e41-e536-4a73-bb77-22927e21334e',
  '129ee3e0-a327-494a-9077-5b6b3c43d1e8',
  '1577da8a-1046-48a7-836b-c66f9dbd1941',
  '16b8b882-3082-4ae9-882f-641864d97f95',
  '19e589cd-a949-4cc1-a6c6-058446d240ec',
  '1a6e2cfa-0a11-454d-98fa-942c5743309b',
  '1a80e9e1-371d-41e0-a89b-d97a97a94b58',
  '1c21da75-08ac-42a6-a8f2-d4ef02939b9b',
  '1d499741-f0a1-4723-b85b-0e3f7e148bb5',
  '1d703800-5e3c-46a1-9e3c-3c1645719b7c',
  '1dc124b3-7b77-45a9-b39a-5f989d48b468',
  '1e8e3277-103d-447b-bd1b-1abd0adccacc',
  '1e972096-d100-4418-8362-4edbe4871e96',
  '1f32ecc3-b9fe-4902-a311-c1016686eb4d',
  '20b30946-22f6-43bf-95b0-f828df35bd0b',
  '223aec72-8298-4e02-88f4-b9ad9b5fe2af',
  '22fe1784-a570-4ba4-a477-38b41890ec1b',
  '257ee1e9-b1ce-4c54-855a-8c977ab15777',
  '25b7f8fc-8ebe-4aef-b901-b0efab146fb4',
  '26461d9a-aa25-4919-971b-ce8e09bfc796',
  '264f543b-2b07-4ba6-8e5a-5f635cded560',
  '274d1785-4ca8-47b2-9136-edd8c92a11c8',
  '2ba644a9-9161-4f62-9813-8ecde30baff6',
  '2d0e6388-b553-4856-a1df-777f762957c3',
  '30988c16-c80a-4759-88ac-83b6041d2a7c',
  '30b845d8-c141-4660-b81a-f6a427152154',
  '31b2265f-64ba-405e-b24b-172426261941',
  '31cda4f7-5f16-4082-9e3f-6e715cf66227',
  '322787cc-ccdc-4475-a940-b3099bb4a27d',
  '327e7f6b-3ecc-499d-91f5-e6607af98ddc',
  '32fd5133-f7e2-49a5-b6f9-9b0b63f17b90',
  '35e05168-c6c6-4e43-bfdd-5ae83cfb83e7',
  '3751468d-e426-4503-9c3e-c495d5e1d82e',
  '37c8dc46-f949-4f06-bab7-7a0540af7f62',
  '3a569dfc-ea75-4061-b57a-110b4fcef6e4',
  '3a67cc4e-adaa-47c2-bc1a-f885343d8972',
  '3a782ba1-3aa7-47a8-8386-0abc6d82ec65',
  '3af5d029-d3eb-4de9-9feb-76ff8d633388',
  '3c79e786-738f-4da2-af0f-b74d89b26585',
  '3de430ee-a07d-4958-9984-f7235ddd043c',
  '3eba4673-611e-41f3-b576-a76651bcfca1',
  '403141a1-c261-4aa3-87a5-9909cdbd0a70',
  '405e51fa-9a8c-430a-b1d1-835efbb4e455',
  '41742d92-0f6e-46e7-a9e5-b2b3d0235ce3',
  '44b4cfc8-bbd5-42e5-972b-ccb59741bcac',
  '44b90510-e283-413b-82f2-1f0654117739',
  '47362ca9-e5b7-48e4-ab18-49d501bf6fed',
  '480c734c-10a1-4e2e-9b55-86526fa60b1f',
  '4955acff-fb4c-4b36-9544-3f50f4a60ff2',
  '49b87d6c-9cfd-471c-9345-f77468d2ac9d',
  '4a013af6-4a4d-471f-8ebe-ccdd02a9ede4',
  '4bc95f92-946d-4f30-81ea-dcde7d1d79cf',
  '4c391627-69a7-4afc-9fd0-b1ff39a6a9fe',
  '4f11b059-2498-413e-90d2-d5bc02d0ae6d',
  '50e67a89-a712-4b1d-9e15-12b87a5bdcd9',
  '518b618c-b99d-4b7d-8de8-1c52d430fe5d',
  '519e29a2-6210-414b-b003-22553d65bfaf',
  '532dc015-832a-4679-b9dd-d1c31db62e92',
  '55954172-4eae-46b4-b0ee-5c32a7aa139f',
  '589a7fd9-5dc3-48d8-b858-2e57af84edc1',
  '58d07c34-5f8e-43f1-bef6-b8ce77bf30af',
  '58e003ca-9c90-4066-9cc1-46803a06a353',
  '5aecfabc-c753-4622-ac7a-99562f7ea10f',
  '5b1250ed-ab43-43aa-b5f9-d9545776adb7',
  '5bd3951e-dcef-4b11-b74b-6fa090fcbd4d',
  '5c136a73-a34c-4447-a4b9-d54c189e981d',
  '5dabac21-e488-46c6-969d-b5ac0a41caf8',
  '5ed066b0-01e8-4c5b-8609-15b150ff3593',
  '5f03de6e-85ed-42a5-8bca-ebb2e7c95723',
  '600a083c-f865-4fc3-a4c0-7ef7e8fcb9e0',
  '62c13b27-8969-4b27-96ca-691921fb3df6',
  '65b14224-cec6-43c6-b576-7681f52e0548',
  '660fa4d0-40cb-4fed-9f88-fef062506444',
  '667641d3-e931-4fa1-b973-49a29fab9a70',
  '6983611d-cc74-402e-ba4c-fe5831fa4ba5',
  '69e8e490-89f0-4203-a930-9924d375e8f4',
  '6aca515a-ea26-4933-ab30-087602881a8e',
  '6b188460-10c0-41f5-b14e-e7fd51c9417d',
  '6b4a76a9-6f10-4464-afcb-2754020b05aa',
  '6e0329b0-8796-4ad4-adcc-5c02b4fcfced',
  '6f2785f2-9724-4532-84b6-d351c26a2f6e',
  '6f3e2810-2be9-491a-90c0-6e042349d9be',
  '6fef5774-b87b-4a1c-b266-1d8c38266168',
  '70b56c0c-1c3e-45ba-953a-b91634e32647',
  '713ef6a7-606c-420d-9186-078e511ae3ce',
  '7242e164-289e-4963-93e8-891d51f243b7',
  '74a80491-b5f6-4b12-833e-798b5d05261a',
  '754832ae-2329-442e-ba6c-57c9784c59c2',
  '754d09bb-38c1-42eb-b615-9de64f695ad5',
  '756dfd50-56ed-4b6a-b71b-8ca01c767527',
  '76188661-6181-4945-87da-a49fe1eb7ef6',
  '77ba3090-f377-4452-bac3-4d4fb9bf6848',
  '782a878f-8e0a-4be6-b524-62847a2bdffc',
  '790e13eb-f768-4cff-816a-89a7aaefea12',
  '7993e75b-4d8f-438b-a871-7f97218d6716',
  '7c1a42c1-afa2-4245-9483-d800c02225bf',
  '8357caff-03c3-43c4-b900-e753cfa90c32',
  '83c0750e-b8c2-4605-ab7a-f737ec5cad69',
  '84ade023-5312-4b08-9365-0cd50c5a19b6',
  '873991fd-628a-4f05-854d-adcadfb5260d',
  '879a5d6b-1316-41d8-9e0a-5bad4a68ff4e',
  '8a42c4cb-23cf-456b-b177-f34038a597b5',
  '8c581819-462d-49a8-ae52-6153e1b73dd1',
  '8dae1a0c-2316-406e-a23e-51d80d026e3b',
  '8f5de65c-aabe-4b8a-9452-bfcb6c51aa86',
  '92f22e10-e20b-4ba1-a365-5e552a774aea',
  '93d09ef6-aad8-4d03-b89f-7eb16ed11a90',
  '9466a2f5-ba8b-4852-b005-2a929dcac9b9',
  '95b43e24-1bc8-4e91-9e1a-52e6ea3376f0',
  '988b7c51-5da9-40de-be8a-637c502c78d8',
  '98b03721-ad4f-41d5-8028-52cb3e0cc5bb',
  '99b5f20d-436f-44fc-859c-8c87c99859e0',
  '99c993da-1df8-4706-833f-aaf384fa4247',
  '9af34f0b-7743-4303-b211-352b34b937f7',
  '9bb1252d-9d39-48de-ba5f-7151e033f819',
  '9bb6d72d-df1e-4d12-995f-3d7eb26af1ea',
  '9bccf586-8f68-4057-b8fd-8f1e5c9cd068',
  '9c1822f4-7563-4123-9f2b-f33c38e9b84b',
  '9d16c765-3d94-4b31-8151-8ae06daef294',
  '9de49465-20b7-466f-a603-8fda60b14a79',
  '9e18d44e-40cd-4750-9491-2692fab19f5d',
  '9eae06dd-abda-4412-a7c7-a4ab5d407f21',
  '9f9ae994-d866-4132-af2c-73752bb12e1f',
  '9faddc38-1abd-437b-b3ea-aed280064353',
  'a047679c-8a42-4321-8d49-b9c0988509da',
  'a0c1e9d3-470c-45ec-8b25-8a54a378f125',
  'a11ccb05-0d7b-4418-962f-c1c534e92383',
  'a1e673ca-8e69-4f6e-a830-ac8f44f2046f',
  'a25ce7f9-a916-4dbd-a040-a6e9aadea3a0',
  'a46667ed-45c5-4801-b89b-5ece3672cac4',
  'a4f025ad-5599-4922-a659-75b75d8d4413',
  'a4f503d3-37d9-4f3d-812f-7e554d079010',
  'a654811a-c9ae-45cf-a2e8-d757f33fccee',
  'a6ced7b8-6aa0-45df-800e-4b94a5e39130',
  'a79b6461-4cf6-473f-974b-7732f7bfb01a',
  'a7bf2e2f-f420-4d39-a6bf-88a33ef1bd79',
  'a8435fcd-2b0a-4bd6-a307-3ea36c75938a',
  'a8f723c5-5add-4a3c-a4af-a339ffc1d7d0',
  'a9f63591-2466-466e-b3f9-51c47b74e908',
  'aa696e00-86ff-4e26-b3d1-97f676a38451',
  'aa7f6f61-8f5c-4522-aeb3-64bcc439b9f0',
  'ac07da90-6276-4416-8674-4603e051b3f3',
  'ac70aec9-bf49-4235-a912-8f63c88cab6b',
  'aef8b277-50a3-4f9d-97c7-1dcebea36985',
  'affc26a1-609b-45e1-bb91-617dd4bf4bf7',
  'b10c81b5-e284-43d6-bec7-9ebeae80256c',
  'b17e88d9-a750-4cfd-be57-6d215c29a532',
  'b2f7ca10-381d-4fa0-ae2d-2086b1bba4d0',
  'b34f7247-5c60-4ab4-b222-f4790659121d',
  'b3d1142b-f0b9-4f22-b984-1be238cb0481',
  'b408b59d-1c7a-4bf1-82d8-1ba70ef5323d',
  'b4293774-1c49-4540-86d8-7d44ae6a191c',
  'b47cc779-7854-49dc-9453-499030bb2271',
  'b65b77d3-bb30-4500-837c-8a42e69fc17e',
  'b72a9e3e-0042-480e-8ce3-6cb4fbd64c4b',
  'bbf82d76-5162-4a18-b95c-38ab603ba182',
  'bc23849f-6e25-42f7-8f96-11826a7e8346',
  'bd195039-2686-4f72-a9de-461fa9725827',
  'bd9f772d-914f-4774-bd2e-cbfd15e24082',
  'c132dd5e-0539-4190-ac13-1ce64c4cadce',
  'c237e707-e9b9-43d6-a2e8-3126076d21e6',
  'c4b36ba9-4836-49ab-b5aa-be25c60ab556',
  'c649c2ee-76b0-4d8a-b21c-a6b98c6fcac1',
  'c690c4da-6be9-4e7b-9dfa-efd5f2453a20',
  'c913d161-f953-4242-9e77-d0f9c207098a',
  'c917fe59-53dc-4279-98fa-917b4179c1a8',
  'c9e6d889-ee41-472a-bb62-53e82828abe2',
  'ca9fe974-41d2-43a0-807e-7aac778f950b',
  'cb555f43-148e-4b89-b79b-faa80a008be0',
  'cb899ede-0db0-41c6-9fdb-f45ea628e378',
  'cc563d80-3db1-4703-b0eb-329c57c4b329',
  'cc70a1fa-45ea-4110-8393-ccac4aa88c02',
  'ccc2345a-6256-4a28-8225-5263a4f1a026',
  'ccd3e111-d655-42bb-b734-2faa1135ca54',
  'ce127ed7-cae3-448f-8f0b-d18e50df65ed',
  'd0c0bc24-5159-4634-9366-dc327c9e70ca',
  'd31a1e78-6b1c-4fdc-b80c-461d810e72da',
  'd391ba6e-e33f-4fb9-b150-19deabe989b5',
  'd41e8f12-9635-4489-81ff-266e5556333c',
  'd83e6895-e07d-4efc-aace-6736501cf760',
  'da29ff20-cbe6-4aa1-a929-ddf57acd66c0',
  'db1b2c50-69ac-48ac-b677-319e367e3d05',
  'de2288c1-1724-4f1b-88bc-2a4994e655dc',
  'de69974c-09a9-418f-87f0-6eb660a9742c',
  'df0bf39a-fca2-4d68-be3e-3ea1f1af2063',
  'df1fc60a-0b92-42d4-bdca-9e1995459adf',
  'e00e8ada-2977-461b-9a7b-e93a1050f9b4',
  'e1c3b8fc-1f5c-42a4-b34c-371148895b3c',
  'e1e89c0b-850e-4021-a22d-95a93c9858ba',
  'e1fa6bbb-8f4f-4f67-9582-0221f4d1f5c6',
  'e2b719db-da1f-4028-9b05-95bb0f1ad694',
  'e2f1f7df-aee2-4b3a-8d0b-bdfd55ecb4dc',
  'e5e91778-703e-439c-a9cf-9b4f77d8ee15',
  'e5f430be-94e5-4c60-8cf7-a81d0b6b6301',
  'e7c10f70-7ea7-441d-8a45-120c765cb833',
  'e81e0864-3f78-4342-8f36-485dacfe2890',
  'e8ad02b9-b384-4305-a6d7-0517c85c12da',
  'e910a3b8-5f6e-4955-b9ad-8887de59e699',
  'e95f7687-499c-48be-94b3-1007df46a151',
  'ec282cbe-4768-4cc3-9007-9fdd4d598e36',
  'ecb737f4-d6ab-49ee-84d5-95e80573a3be',
  'edb079da-0d31-46a5-badc-d5f62383b2ec',
  'edb157f1-7985-4b80-80bf-11f8eaefecc5',
  'ede9c601-d193-4b9d-ad36-e8fe4d735f5f',
  'ef9e5d78-ce7b-45d2-94f2-ad355431ed89',
  'f1a28dee-d1fe-4e08-ba81-c3765224a8a5',
  'f319988c-82e8-48d8-bece-32a2b8ed62ef',
  'f34bae3d-d867-45a2-a545-10eb903c3abe',
  'f4d4c2b6-2384-41fd-aa78-e76284a4335e',
  'f4fd83e2-5489-4971-9373-ffe830ef6b16',
  'f5427d8d-1ccd-42a3-9620-cbb65197aee5',
  'f5ec3594-e611-43ae-b9ad-e43e17b12a5c',
  'f6b9e700-46cc-4f06-a2d0-b7229f412571',
  'f6dc3841-006d-46f1-8514-90d2f2594f91',
  'f958c9f7-68a8-4bb6-9083-fb89843eab12',
  'f9730e2e-ae4a-4edf-b818-f9cae87f8d18',
  'fa881852-ce48-4893-a730-cd12299dbf70',
  'fbfc066e-b5fa-43d5-a4cf-2d1860bfa149',
  'fc4764d5-f86f-4560-a448-da6951d3f886',
  'fcf65ac8-f4b2-47dd-8363-5b3fe0006761',
  'fdce0a01-b316-4a0a-95ec-22db7fabaad1'
);

-- Insert / update all questions
INSERT INTO questions (id, type, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, svg_content, is_practice, is_active) VALUES
  ('0025bdcc-31d3-4fc3-9244-fabd4d5d384e', 'pattern_recognition', 'medium', 'What comes next?

●●    ○●●○    ○○●●○○    ?', '○○○●●○○○', '○○●●○○', '●●○○', '○●●○', 'a', NULL, false, true),
  ('006ed051-137b-474b-8c6d-f1b5868a49fe', 'verbal_analogy', 'easy', 'LION : PRIDE :: WOLF : ?', 'Den', 'Hunt', 'Wild', 'Pack', 'd', NULL, false, true),
  ('02afd508-214f-456e-abc4-1337d0db85cb', 'pattern_recognition', 'easy', 'What comes next in the sequence?

▲  ▲  ■    ▲  ▲  ■    ▲  ?', '■', '▲', '○', '□', 'b', NULL, false, true),
  ('030f71e9-0752-4552-83d6-df174599f8c2', 'logical_sequence', 'easy', '10, 20, 30, 40, ?', '45', '50', '55', '60', 'b', NULL, false, true),
  ('042d99ab-6edb-4796-b362-8c37bcfe0358', 'verbal_analogy', 'medium', 'THIRST : WATER :: HUNGER : ?', 'Meal', 'Food', 'Restaurant', 'Appetite', 'b', NULL, false, true),
  ('04737a68-24cc-4bfd-b662-88e3ef329264', 'logical_sequence', 'hard', '1, 2, 6, 15, 31, ?', '56', '60', '63', '64', 'b', NULL, false, true),
  ('05f92684-831f-4952-a60f-5319007a5ea8', 'pattern_recognition', 'medium', 'What comes next?

■■○○    ■○○■    ○○■■    ○■■○    ?', '○○■■', '■○■○', '■■○○', '○■○■', 'c', NULL, false, true),
  ('0731829d-f0be-48e6-80b4-d75ae85526d9', 'pattern_recognition', 'medium', 'What comes next?

○●○    ○●●○    ○●●●○    ?', '○●●●●○', '○●●○', '●●●●', '○●○', 'a', NULL, false, true),
  ('0807f21e-cb45-43d2-9667-0e91619dd993', 'logical_sequence', 'easy', '1, 2, 3, 4, 5, ?', '5', '6', '7', '8', 'b', NULL, true, true),
  ('089eda8d-cd20-4135-945d-dda7fa49f156', 'numerical', 'medium', 'If 60% of students passed, and 180 passed, how many students total?', '250', '280', '300', '350', 'c', NULL, false, true),
  ('08e6745b-b598-4b79-af05-b1916b0cc407', 'pattern_recognition', 'easy', 'How many dots come next?

●    ●●    ●●●    ●●●●    ?', '3', '4', '5', '6', 'c', NULL, false, true),
  ('09d22f2a-af97-4a23-a65d-74bb270de1da', 'deductive', 'medium', 'All certified engineers are permitted to sign off on safety reports. Only employees who have passed the certification exam are certified. Priya failed the exam 3 months ago and has not retaken it.

Which conclusion definitely follows?', 'Priya is not permitted to sign off on safety reports', 'Priya will pass next time', 'Priya should not be working as an engineer', 'The certification exam is too difficult', 'a', NULL, false, true),
  ('0a0e6e7c-4bce-4da7-85ae-7c10445a49fb', 'numerical', 'easy', 'A jacket costs £60. With 20% off, what is the new price?', '£40', '£45', '£48', '£52', 'c', NULL, false, true),
  ('0bd1b81d-bd0c-43c7-b722-8abf78000df9', 'numerical', 'medium', 'A tank is 3/4 full with 600 liters. What is its total capacity?', '700 liters', '750 liters', '800 liters', '900 liters', 'c', NULL, false, true),
  ('0c4fa4f8-3597-47f2-9ff4-d6651478dbc0', 'deductive', 'hard', 'Every change to a live production system must be logged in the change register. All logged changes are reviewed weekly by the operations team. Any change not logged is flagged as an incident. A database update was applied to the production system but not logged.

Which conclusion definitely follows?', 'The database update will be reviewed by the operations team', 'The database update has been flagged as an incident', 'The operations team knows about the update', 'The database update should be reversed', 'b', NULL, false, true),
  ('0e50fa62-1bf7-48af-b54c-638a7eba20ee', 'numerical', 'medium', 'A garden is 24m × 16m. What is its area?', '300 m²', '320 m²', '360 m²', '384 m²', 'd', NULL, false, true),
  ('0f7c5e8e-fe05-4d8c-aa1a-a4601fe9de77', 'numerical', 'medium', 'A phone costs 3 times more than a tablet. The tablet is £200. Total cost for both?', '£600', '£700', '£800', '£900', 'c', NULL, false, true),
  ('10e8b883-2b34-4382-9dd3-2200336344b4', 'numerical', 'medium', 'A company has 240 employees. 35% work in sales. How many work in sales?', '72', '84', '96', '108', 'b', NULL, false, true),
  ('10eed578-cefd-4750-8cd5-c77958702b63', 'pattern_recognition', 'medium', 'What comes next?

○■    ■○    ○■    ■○    ?', '○○', '■■', '■○', '○■', 'd', NULL, false, true),
  ('10ef54d9-7f1f-42a5-b351-8a3be8706ca7', 'deductive', 'easy', 'All managers have access to the payroll system. Kate does not have access to the payroll system.

Which conclusion definitely follows?', 'Kate is not a manager', 'Kate will get access soon', 'Kate wants to be a manager', 'Payroll access is restricted', 'a', NULL, false, true),
  ('10f90885-3c7b-4a8d-95b1-f78f52eeeb95', 'pattern_recognition', 'hard', 'What comes next?

○  ■  ○○  ■■  ○○○  ■■■  ○○○○  ?', '■■■■', '○○○○○', '■■■', '○○○', 'a', NULL, false, true),
  ('11a70ad4-7ec7-4aa7-9be3-faafbaa3c1c0', 'logical_sequence', 'easy', '1, 4, 7, 10, ?', '12', '13', '14', '15', 'b', NULL, false, true),
  ('1225bd61-d7f8-4950-91df-827e917cd338', 'verbal_analogy', 'medium', 'EVAPORATION : WATER :: COMBUSTION : ?', 'Fire', 'Heat', 'Fuel', 'Oxygen', 'c', NULL, false, true),
  ('124aa793-e4ad-4271-a39e-c0de25619812', 'logical_sequence', 'hard', '1, 3, 7, 15, 31, ?', '62', '63', '64', '65', 'b', NULL, false, true),
  ('128b1e41-e536-4a73-bb77-22927e21334e', 'numerical', 'medium', 'A product is discounted by 30%, then by an additional 10%. If it was £100, what is the final price?', '58', '60', '63', '70', 'c', NULL, false, true),
  ('129ee3e0-a327-494a-9077-5b6b3c43d1e8', 'pattern_recognition', 'easy', 'What comes next?

△  ▲  △  ▲  △  ?', '▲', '△', '■', '○', 'a', NULL, false, true),
  ('1577da8a-1046-48a7-836b-c66f9dbd1941', 'logical_sequence', 'medium', '1, 2, 6, 24, 120, ?', '600', '620', '640', '720', 'd', NULL, false, true),
  ('16b8b882-3082-4ae9-882f-641864d97f95', 'verbal_analogy', 'easy', 'CHAPTER : BOOK :: EPISODE : ?', 'Show', 'TV', 'Series', 'Plot', 'c', NULL, false, true),
  ('19e589cd-a949-4cc1-a6c6-058446d240ec', 'numerical', 'medium', 'If A earns £15/hour and B earns 20% more, what does B earn per hour?', '£16', '£17', '£18', '£19', 'c', NULL, false, true),
  ('1a6e2cfa-0a11-454d-98fa-942c5743309b', 'verbal_analogy', 'hard', 'PALLIATIVE : PAIN :: AMNESTY : ?', 'Crime', 'Punishment', 'Pardon', 'Law', 'b', NULL, false, true),
  ('1a80e9e1-371d-41e0-a89b-d97a97a94b58', 'pattern_recognition', 'hard', 'What fills the blank?

Each row and each column contains ○, ●, ■ exactly once.

Row 1:  ○  ●  ■
Row 2:  ■  ○  ●
Row 3:  ●  ■  ?', '○', '●', '■', '□', 'a', NULL, false, true),
  ('1c21da75-08ac-42a6-a8f2-d4ef02939b9b', 'logical_sequence', 'hard', '2, 5, 13, 35, 97, ?', '200', '203', '244', '275', 'c', NULL, false, true),
  ('1d499741-f0a1-4723-b85b-0e3f7e148bb5', 'deductive', 'medium', 'All data marked as sensitive must be encrypted. Only the IT security team can change the classification of data. The finance team''s salary data is classified as sensitive.

Which conclusion definitely follows?', 'The finance team can declassify the salary data', 'The salary data must be encrypted', 'The IT security team handles all salary data', 'All salary data is inherently sensitive', 'b', NULL, false, true),
  ('1d703800-5e3c-46a1-9e3c-3c1645719b7c', 'pattern_recognition', 'easy', 'What comes next?

□  □  ■    □  □  ■    □  □  ?', '□', '■', '○', '▲', 'b', NULL, false, true),
  ('1dc124b3-7b77-45a9-b39a-5f989d48b468', 'logical_sequence', 'hard', '1, 2, 4, 8, 16, 32, ?', '48', '56', '64', '72', 'c', NULL, false, true),
  ('1e8e3277-103d-447b-bd1b-1abd0adccacc', 'numerical', 'easy', 'If you earn £8 per hour and work 5 hours, how much do you earn?', '£35', '£40', '£45', '£50', 'b', NULL, false, true),
  ('1e972096-d100-4418-8362-4edbe4871e96', 'numerical', 'easy', 'If a book costs £12 and you get a 25% discount, what do you pay?', '£7', '£9', '£11', '£15', 'b', NULL, false, true),
  ('1f32ecc3-b9fe-4902-a311-c1016686eb4d', 'logical_sequence', 'medium', '5, 7, 11, 13, 17, ?', '18', '19', '20', '21', 'b', NULL, false, true),
  ('20b30946-22f6-43bf-95b0-f828df35bd0b', 'numerical', 'hard', 'If A is 60% of C and B is 75% of C, what is the ratio A:B?', '3:4', '4:5', '5:6', '6:5', 'b', NULL, false, true),
  ('223aec72-8298-4e02-88f4-b9ad9b5fe2af', 'numerical', 'medium', 'If A is 40% of B, and B is 50, what is A?', '15', '18', '20', '25', 'c', NULL, false, true),
  ('22fe1784-a570-4ba4-a477-38b41890ec1b', 'deductive', 'hard', 'No employee who has been on a performance improvement plan (PIP) in the last 12 months is eligible for promotion. All employees promoted this cycle were eligible. Raj was placed on a PIP 8 months ago.

Which conclusion definitely follows?', 'Raj was not promoted this cycle', 'Raj may have been promoted this cycle', 'Raj is no longer on a PIP so he is now eligible', 'Raj''s performance has since improved', 'a', NULL, false, true),
  ('257ee1e9-b1ce-4c54-855a-8c977ab15777', 'pattern_recognition', 'medium', 'What fills the blank?

The ● moves one step right each row, wrapping to column 1 after column 3.

Row 1:  ●  ○  ○
Row 2:  ○  ●  ○
Row 3:  ○  ○  ●
Row 4:  ●  ○  ?', '●', '○', '■', '▲', 'b', NULL, false, true),
  ('25b7f8fc-8ebe-4aef-b901-b0efab146fb4', 'deductive', 'hard', 'All staff with access to personal data must complete annual data protection training by 31 March. Staff who do not complete training by 31 March lose their data access. Staff who lose data access cannot process customer records. Nadia has not completed the training by 31 March.

Which conclusion definitely follows?', 'Nadia will lose her data access and cannot process customer records', 'Nadia may be given an extension', 'Nadia will lose data access only', 'Nadia cannot process customer records yet', 'a', NULL, false, true),
  ('26461d9a-aa25-4919-971b-ce8e09bfc796', 'deductive', 'medium', 'Only candidates shortlisted by HR proceed to the panel interview. Only candidates who pass the technical test are shortlisted by HR. Marcus has not passed the technical test.

Which conclusion definitely follows?', 'Marcus will not be shortlisted by HR', 'Marcus will not proceed to the panel interview', 'Both: Marcus will not be shortlisted and will not proceed to interview', 'Marcus may still proceed if he appeals the result', 'c', NULL, false, true),
  ('264f543b-2b07-4ba6-8e5a-5f635cded560', 'pattern_recognition', 'hard', 'What comes next?

■  ○■  ○○■  ○○○■  ○○○○■  ?', '○○○○○■', '■○○○○○', '○○○○■■', '○○○○○', 'a', NULL, false, true),
  ('274d1785-4ca8-47b2-9136-edd8c92a11c8', 'deductive', 'easy', 'If a supplier misses two consecutive deliveries, the contract is suspended. Supplier X has missed only one delivery.

Which conclusion definitely follows?', 'Supplier X''s contract will be suspended', 'Supplier X''s contract is not yet suspended', 'Supplier X will miss the next delivery', 'The supplier should be replaced', 'b', NULL, false, true),
  ('2ba644a9-9161-4f62-9813-8ecde30baff6', 'verbal_analogy', 'medium', 'LIBRARY : BOOKS :: GALLERY : ?', 'Art', 'Paintings', 'Museum', 'Culture', 'b', NULL, false, true),
  ('2d0e6388-b553-4856-a1df-777f762957c3', 'verbal_analogy', 'easy', 'PENCIL : WRITE :: KNIFE : ?', 'Sharp', 'Cook', 'Cut', 'Metal', 'c', NULL, false, true),
  ('30988c16-c80a-4759-88ac-83b6041d2a7c', 'deductive', 'medium', 'No temporary staff member is eligible for the company pension scheme. Some pension scheme members receive an employer contribution. Jordan is a temporary staff member.

Which conclusion definitely follows?', 'Jordan receives no employer pension contribution', 'Jordan is not eligible for the company pension scheme', 'Jordan may be eligible if the contract length permits', 'Jordan should become a permanent employee', 'b', NULL, false, true),
  ('30b845d8-c141-4660-b81a-f6a427152154', 'numerical', 'easy', 'A person walks 2km, then 3km, then 1km. Total distance?', '5km', '6km', '7km', '8km', 'b', NULL, false, true),
  ('31b2265f-64ba-405e-b24b-172426261941', 'verbal_analogy', 'medium', 'DRIZZLE : DOWNPOUR :: WHISPER : ?', 'Noise', 'Shout', 'Talk', 'Sound', 'b', NULL, false, true),
  ('31cda4f7-5f16-4082-9e3f-6e715cf66227', 'numerical', 'hard', 'If 5 out of 8 items are defective, what percentage is non-defective?', '37.5%', '40%', '62.5%', '65%', 'c', NULL, false, true),
  ('322787cc-ccdc-4475-a940-b3099bb4a27d', 'logical_sequence', 'hard', '10, 12, 15, 19, 24, ?', '28', '29', '30', '31', 'b', NULL, false, true),
  ('327e7f6b-3ecc-499d-91f5-e6607af98ddc', 'logical_sequence', 'hard', '5, 11, 23, 47, 95, ?', '180', '190', '191', '200', 'c', NULL, false, true),
  ('32fd5133-f7e2-49a5-b6f9-9b0b63f17b90', 'pattern_recognition', 'easy', 'What comes next in the sequence?

○  ■  ○  ■  ○  ?', '○', '▲', '■', '□', 'c', NULL, true, true),
  ('35e05168-c6c6-4e43-bfdd-5ae83cfb83e7', 'verbal_analogy', 'hard', 'FILIBUSTER : LEGISLATION :: EMBARGO : ?', 'Commerce', 'Goods', 'Trade', 'Import', 'c', NULL, false, true),
  ('3751468d-e426-4503-9c3e-c495d5e1d82e', 'verbal_analogy', 'medium', 'ASTRONOMER : CELESTIAL :: BOTANIST : ?', 'Nature', 'Plant', 'Garden', 'Biology', 'b', NULL, false, true),
  ('37c8dc46-f949-4f06-bab7-7a0540af7f62', 'logical_sequence', 'medium', '3, 6, 12, 24, 48, ?', '96', '90', '84', '72', 'a', NULL, false, true),
  ('3a569dfc-ea75-4061-b57a-110b4fcef6e4', 'pattern_recognition', 'easy', 'What comes next?

■  ■  □    ■  ■  □    ■  ?', '□', '■', '○', '▲', 'b', NULL, false, true),
  ('3a67cc4e-adaa-47c2-bc1a-f885343d8972', 'pattern_recognition', 'hard', 'What fills the blank?

Row 1:  ■  ○  ○
Row 2:  ○  ■  ○
Row 3:  ○  ○  ■
Row 4:  ■  ○  ○
Row 5:  ○  ■  ○
Row 6:  ○  ○  ?', '○', '■', '▲', '□', 'b', NULL, false, true),
  ('3a782ba1-3aa7-47a8-8386-0abc6d82ec65', 'verbal_analogy', 'easy', 'PUPPY : DOG :: KITTEN : ?', 'Feline', 'Cat', 'Pet', 'Fur', 'b', NULL, false, true),
  ('3af5d029-d3eb-4de9-9feb-76ff8d633388', 'pattern_recognition', 'medium', 'What fills the blank?

Row 1:  ○  ○  ●
Row 2:  ○  ●  ○
Row 3:  ●  ○  ?', '●', '○', '■', '▲', 'b', NULL, false, true),
  ('3c79e786-738f-4da2-af0f-b74d89b26585', 'verbal_analogy', 'hard', 'MENDACIOUS : TRUTHFUL :: PERFIDIOUS : ?', 'Cunning', 'Reliable', 'Loyal', 'Honest', 'c', NULL, false, true),
  ('3de430ee-a07d-4958-9984-f7235ddd043c', 'logical_sequence', 'hard', '2, 3, 5, 8, 13, 21, ?', '34', '35', '36', '38', 'a', NULL, false, true),
  ('3eba4673-611e-41f3-b576-a76651bcfca1', 'pattern_recognition', 'hard', 'What is at position 13 in the 5-step cycle?

○  ●  ■  □  ▲  ○  ●  ■  □  ▲  ○  ●  ?', '○', '●', '■', '□', 'c', NULL, false, true),
  ('403141a1-c261-4aa3-87a5-9909cdbd0a70', 'pattern_recognition', 'hard', 'What comes next?

○■▲    ■▲○    ▲○■    ○■▲    ■▲○    ?', '○■▲', '▲○■', '■▲○', '▲■○', 'b', NULL, false, true),
  ('405e51fa-9a8c-430a-b1d1-835efbb4e455', 'verbal_analogy', 'medium', 'MANUSCRIPT : AUTHOR :: BLUEPRINT : ?', 'Builder', 'Architect', 'Engineer', 'Designer', 'b', NULL, false, true),
  ('41742d92-0f6e-46e7-a9e5-b2b3d0235ce3', 'verbal_analogy', 'medium', 'EXPEDITION : EXPLORER :: PILGRIMAGE : ?', 'Journey', 'Pilgrim', 'Religion', 'Temple', 'b', NULL, false, true),
  ('44b4cfc8-bbd5-42e5-972b-ccb59741bcac', 'deductive', 'easy', 'No invoices submitted after the deadline are processed in the same month. This invoice was submitted after the deadline.

Which conclusion definitely follows?', 'The invoice will never be processed', 'The invoice was submitted incorrectly', 'This invoice will not be processed this month', 'The deadline should be extended', 'c', NULL, false, true),
  ('44b90510-e283-413b-82f2-1f0654117739', 'logical_sequence', 'easy', '2, 3, 5, 8, ?', '12', '13', '14', '15', 'b', NULL, false, true),
  ('47362ca9-e5b7-48e4-ab18-49d501bf6fed', 'deductive', 'easy', 'All full-time employees are entitled to 28 days of annual leave. Maria works part-time.

Which conclusion definitely follows?', 'Maria is entitled to 28 days of annual leave', 'Maria is not entitled to any annual leave', 'Maria may not be entitled to the full 28 days of annual leave', 'Maria should become full-time', 'c', NULL, false, true),
  ('480c734c-10a1-4e2e-9b55-86526fa60b1f', 'pattern_recognition', 'easy', 'What comes next in the sequence?

□  ■  □  ■  □  ?', '□', '▲', '○', '■', 'd', NULL, false, true),
  ('4955acff-fb4c-4b36-9544-3f50f4a60ff2', 'numerical', 'hard', 'If the cost per unit decreases as quantities increase (bulk discount), and you buy 200 units at £5 each but get 18% discount, what is the total cost?', '£800', '£810', '£820', '£840', 'c', NULL, false, true),
  ('49b87d6c-9cfd-471c-9345-f77468d2ac9d', 'pattern_recognition', 'hard', 'What fills the blank?

Row 1:  ○  ●  ○  ●
Row 2:  ●  ○  ●  ○
Row 3:  ○  ●  ○  ●
Row 4:  ●  ○  ●  ?', '●', '○', '■', '□', 'b', NULL, false, true),
  ('4a013af6-4a4d-471f-8ebe-ccdd02a9ede4', 'pattern_recognition', 'medium', 'How many dots come next?

●●●●    ●●●    ●●    ●    ●●    ●●●    ?', '2', '3', '4', '5', 'c', NULL, false, true),
  ('4bc95f92-946d-4f30-81ea-dcde7d1d79cf', 'deductive', 'hard', 'Every software release requires sign-off from the security team. No security team sign-off is granted without a completed vulnerability scan. A vulnerability scan can only be initiated by a certified security analyst. No certified security analyst is currently available.

Which conclusion definitely follows?', 'The release can proceed with management approval', 'A vulnerability scan cannot currently be initiated', 'The software release cannot currently proceed', 'Both B and C', 'd', NULL, false, true),
  ('4c391627-69a7-4afc-9fd0-b1ff39a6a9fe', 'verbal_analogy', 'easy', 'DOCTOR : PATIENT :: TEACHER : ?', 'School', 'Student', 'Lesson', 'Class', 'b', NULL, false, true),
  ('4f11b059-2498-413e-90d2-d5bc02d0ae6d', 'deductive', 'hard', 'All compliance reports must be filed by the 15th of each month. Any department that misses the deadline receives an automatic audit. The marketing department missed the deadline last month for the first time.

Which conclusion definitely follows?', 'Marketing will receive an automatic audit', 'Marketing will lose budget discretion', 'Marketing should have filed on time', 'The compliance team will contact marketing', 'a', NULL, false, true),
  ('50e67a89-a712-4b1d-9e15-12b87a5bdcd9', 'pattern_recognition', 'easy', 'How many dots come next?

●    ●●    ●●●    ●●●●    ?', '5', '4', '6', '3', 'a', NULL, false, true),
  ('518b618c-b99d-4b7d-8de8-1c52d430fe5d', 'deductive', 'medium', 'Every team that misses its quarterly target must submit a recovery plan. No recovery plan is required if the team restructures before the quarter ends. Team Delta missed its quarterly target and did not restructure.

Which conclusion definitely follows?', 'Team Delta may need to submit a recovery plan', 'Team Delta must submit a recovery plan', 'Team Delta will miss its next target too', 'Team Delta should have restructured', 'b', NULL, false, true),
  ('519e29a2-6210-414b-b003-22553d65bfaf', 'logical_sequence', 'hard', '1, 4, 13, 40, 121, ?', '360', '361', '362', '363', 'b', NULL, false, true),
  ('532dc015-832a-4679-b9dd-d1c31db62e92', 'numerical', 'easy', 'What is 15% of 200?', '20', '30', '35', '40', 'b', NULL, false, true),
  ('55954172-4eae-46b4-b0ee-5c32a7aa139f', 'verbal_analogy', 'medium', 'ARCHITECT : BUILDING :: COMPOSER : ?', 'Piano', 'Orchestra', 'Symphony', 'Concert', 'c', NULL, false, true),
  ('589a7fd9-5dc3-48d8-b858-2e57af84edc1', 'verbal_analogy', 'easy', 'CHEF : KITCHEN :: DOCTOR : ?', 'Medicine', 'Stethoscope', 'Surgery', 'Hospital', 'd', NULL, false, true),
  ('58d07c34-5f8e-43f1-bef6-b8ce77bf30af', 'numerical', 'easy', 'What is 40% of 150?', '50', '60', '70', '80', 'b', NULL, false, true),
  ('58e003ca-9c90-4066-9cc1-46803a06a353', 'pattern_recognition', 'easy', 'What comes next in the sequence?

■  ■  ○    ■  ■  ○    ■  ■  ?', '■', '▲', '○', '□', 'c', NULL, false, true),
  ('5aecfabc-c753-4622-ac7a-99562f7ea10f', 'logical_sequence', 'hard', '1, 8, 27, 64, 125, ?', '180', '196', '216', '240', 'c', NULL, false, true),
  ('5b1250ed-ab43-43aa-b5f9-d9545776adb7', 'pattern_recognition', 'medium', 'What fills the blank?

Row 1:  ■  ○  ▲
Row 2:  ▲  ■  ○
Row 3:  ○  ▲  ?', '○', '▲', '■', '□', 'c', NULL, false, true),
  ('5bd3951e-dcef-4b11-b74b-6fa090fcbd4d', 'pattern_recognition', 'easy', 'What comes next?

○  ●    ○○  ●●    ○○○  ●●●    ?', '○○○○', '●●●●', '○○', '●●', 'a', NULL, false, true),
  ('5c136a73-a34c-4447-a4b9-d54c189e981d', 'verbal_analogy', 'medium', 'CATERPILLAR : BUTTERFLY :: TADPOLE : ?', 'Frog', 'Pond', 'Fish', 'Amphibian', 'a', NULL, false, true),
  ('5dabac21-e488-46c6-969d-b5ac0a41caf8', 'verbal_analogy', 'hard', 'CATALYST : REACTION :: CATALYST : ?', 'Element', 'Change', 'Speed', 'Impetus', 'd', NULL, false, true),
  ('5ed066b0-01e8-4c5b-8609-15b150ff3593', 'verbal_analogy', 'easy', 'FOOT : SHOE :: HAND : ?', 'Ring', 'Glove', 'Finger', 'Palm', 'b', NULL, false, true),
  ('5f03de6e-85ed-42a5-8bca-ebb2e7c95723', 'deductive', 'medium', 'Every sales target achieved above 120% earns a bonus. No bonus is paid without manager sign-off. Lisa achieved 125% of her sales target.

Which conclusion definitely follows?', 'Lisa has already received her bonus', 'Lisa has earned a bonus, subject to manager sign-off', 'Lisa will definitely receive a bonus this month', 'Lisa''s manager has approved the bonus', 'b', NULL, false, true),
  ('600a083c-f865-4fc3-a4c0-7ef7e8fcb9e0', 'verbal_analogy', 'easy', 'AUTHOR : BOOK :: SCULPTOR : ?', 'Clay', 'Museum', 'Chisel', 'Statue', 'd', NULL, false, true),
  ('62c13b27-8969-4b27-96ca-691921fb3df6', 'logical_sequence', 'easy', '11, 22, 33, 44, ?', '50', '55', '56', '60', 'b', NULL, false, true),
  ('65b14224-cec6-43c6-b576-7681f52e0548', 'deductive', 'easy', 'All dogs are animals. Rex is a dog.

Which conclusion definitely follows?', 'Rex is an animal', 'All animals are dogs', 'Rex may or may not be an animal', 'Some animals are not dogs', 'a', NULL, true, true),
  ('660fa4d0-40cb-4fed-9f88-fef062506444', 'verbal_analogy', 'medium', 'ADVOCATE : DEFENDANT :: GUARDIAN : ?', 'Child', 'Ward', 'Protect', 'Custody', 'b', NULL, false, true),
  ('667641d3-e931-4fa1-b973-49a29fab9a70', 'numerical', 'easy', 'A recipe requires 2 cups of flour. How much is needed for 3 recipes?', '4', '5', '6', '7', 'c', NULL, false, true),
  ('6983611d-cc74-402e-ba4c-fe5831fa4ba5', 'logical_sequence', 'medium', '2, 5, 10, 17, 26, ?', '35', '36', '37', '38', 'd', NULL, false, true),
  ('69e8e490-89f0-4203-a930-9924d375e8f4', 'pattern_recognition', 'hard', 'What fills the blank?

Each row shifts one step left (cycling).

Row 1:  ○  ■  □  ▲
Row 2:  ■  □  ▲  ○
Row 3:  □  ▲  ○  ■
Row 4:  ▲  ○  ■  ?', '▲', '○', '■', '□', 'd', NULL, false, true),
  ('6aca515a-ea26-4933-ab30-087602881a8e', 'numerical', 'hard', 'A reduced price is 72% of original. The reduction is?', '22%', '28%', '32%', '38%', 'b', NULL, false, true),
  ('6b188460-10c0-41f5-b14e-e7fd51c9417d', 'logical_sequence', 'easy', '5, 10, 15, 20, ?', '24', '25', '26', '30', 'b', NULL, false, true),
  ('6b4a76a9-6f10-4464-afcb-2754020b05aa', 'numerical', 'easy', 'A bottle holds 500ml. How many bottles are needed for 2 liters?', '2', '3', '4', '5', 'c', NULL, false, true),
  ('6e0329b0-8796-4ad4-adcc-5c02b4fcfced', 'logical_sequence', 'medium', '3, 9, 27, 81, ?', '243', '240', '216', '200', 'a', NULL, false, true),
  ('6f2785f2-9724-4532-84b6-d351c26a2f6e', 'deductive', 'hard', 'No supplier contract over £1m can be extended without a full tender process. Any contract requiring a tender must be advertised publicly for at least 28 days. The Orion contract is worth £1.2m and is due for renewal.

Which conclusion definitely follows?', 'The Orion contract will be extended', 'The Orion contract must be advertised publicly for at least 28 days before renewal', 'A new supplier will win the Orion contract', 'Orion may request a direct extension', 'b', NULL, false, true),
  ('6f3e2810-2be9-491a-90c0-6e042349d9be', 'numerical', 'hard', 'A fund grows at 8% compound interest per year. Starting with £5000, what is it worth after 2 years?', '£5,800', '£5,832', '£5,900', '£6,000', 'b', NULL, false, true),
  ('6fef5774-b87b-4a1c-b266-1d8c38266168', 'pattern_recognition', 'easy', 'What comes next in the sequence?

○  ○  ▲    ○  ○  ▲    ○  ?', '○', '▲', '■', '□', 'a', NULL, false, true),
  ('70b56c0c-1c3e-45ba-953a-b91634e32647', 'pattern_recognition', 'easy', 'What comes next?

○  ○  ●    ○  ○  ●    ○  ?', '●', '○', '■', '▲', 'b', NULL, false, true),
  ('713ef6a7-606c-420d-9186-078e511ae3ce', 'pattern_recognition', 'hard', 'How many dots come next?

●    ●●    ●●●●    ●●●●●●●    ?

(Differences: +1, +2, +3, ...)', '9', '10', '11', '12', 'c', NULL, false, true),
  ('7242e164-289e-4963-93e8-891d51f243b7', 'deductive', 'easy', 'If a candidate scores above 80%, they advance to the next round. James scored 75%.

Which conclusion definitely follows?', 'James may still advance to the next round', 'James will not advance to the next round', 'James needs to resit the test', 'The next round is very competitive', 'b', NULL, false, true),
  ('74a80491-b5f6-4b12-833e-798b5d05261a', 'verbal_analogy', 'medium', 'SYMPTOM : DISEASE :: CLUE : ?', 'Detective', 'Crime', 'Police', 'Evidence', 'b', NULL, false, true),
  ('754832ae-2329-442e-ba6c-57c9784c59c2', 'deductive', 'easy', 'All members of the leadership team attended the annual conference. Ben did not attend the annual conference.

Which conclusion definitely follows?', 'Ben is definitely not on the leadership team', 'Ben missed an important event', 'Ben was sick on that day', 'The leadership team will speak to Ben', 'a', NULL, false, true),
  ('754d09bb-38c1-42eb-b615-9de64f695ad5', 'numerical', 'easy', 'If a train travels 60 km in 2 hours, what is its speed?', '20 km/h', '25 km/h', '30 km/h', '40 km/h', 'c', NULL, false, true),
  ('756dfd50-56ed-4b6a-b71b-8ca01c767527', 'pattern_recognition', 'medium', 'What comes next?

●  ○●  ○○●  ○○○●  ?', '○○○○●', '○○●', '●○○○○', '○○○●', 'a', NULL, false, true),
  ('76188661-6181-4945-87da-a49fe1eb7ef6', 'logical_sequence', 'medium', '2, 6, 12, 20, 30, ?', '40', '42', '44', '48', 'b', NULL, false, true),
  ('77ba3090-f377-4452-bac3-4d4fb9bf6848', 'verbal_analogy', 'easy', 'COLD : HOT :: DARK : ?', 'Night', 'Shade', 'Light', 'Shadow', 'c', NULL, false, true),
  ('782a878f-8e0a-4be6-b524-62847a2bdffc', 'verbal_analogy', 'hard', 'HUBRIS : NEMESIS :: COMPLACENCY : ?', 'Failure', 'Confidence', 'Success', 'Satisfaction', 'a', NULL, false, true),
  ('790e13eb-f768-4cff-816a-89a7aaefea12', 'verbal_analogy', 'hard', 'DIFFIDENCE : AUDACITY :: LETHARGY : ?', 'Strength', 'Energy', 'Vigour', 'Drive', 'c', NULL, false, true),
  ('7993e75b-4d8f-438b-a871-7f97218d6716', 'logical_sequence', 'medium', '2, 5, 11, 23, 47, ?', '89', '90', '95', '96', 'd', NULL, false, true),
  ('7c1a42c1-afa2-4245-9483-d800c02225bf', 'verbal_analogy', 'easy', 'FARMER : CROP :: FISHERMAN : ?', 'Boat', 'Ocean', 'Net', 'Fish', 'd', NULL, false, true),
  ('8357caff-03c3-43c4-b900-e753cfa90c32', 'logical_sequence', 'easy', '20, 17, 14, 11, ?', '8', '9', '10', '12', 'a', NULL, false, true),
  ('83c0750e-b8c2-4605-ab7a-f737ec5cad69', 'numerical', 'hard', 'If profit margin is 25% and cost is £400, what is selling price?', '£450', '£475', '£500', '£525', 'c', NULL, false, true),
  ('84ade023-5312-4b08-9365-0cd50c5a19b6', 'deductive', 'easy', 'All employees who complete training receive a certificate. Sarah has received a certificate.

Which conclusion definitely follows?', 'Sarah completed the training', 'Sarah is a new employee', 'Sarah may or may not have completed the training', 'All employees receive certificates', 'c', NULL, false, true),
  ('873991fd-628a-4f05-854d-adcadfb5260d', 'verbal_analogy', 'hard', 'SOPHISTRY : LOGIC :: PROPAGANDA : ?', 'Facts', 'Truth', 'News', 'Media', 'b', NULL, false, true),
  ('879a5d6b-1316-41d8-9e0a-5bad4a68ff4e', 'pattern_recognition', 'medium', 'What comes next?

○  ■  ○  ■■  ○  ■■■  ○  ?', '■', '■■■■', '○', '■■', 'b', NULL, false, true),
  ('8a42c4cb-23cf-456b-b177-f34038a597b5', 'logical_sequence', 'medium', '1, 1, 2, 3, 5, 8, ?', '12', '13', '14', '15', 'b', NULL, false, true),
  ('8c581819-462d-49a8-ae52-6153e1b73dd1', 'logical_sequence', 'easy', '7, 14, 21, 28, ?', '30', '32', '35', '40', 'c', NULL, false, true),
  ('8dae1a0c-2316-406e-a23e-51d80d026e3b', 'deductive', 'hard', 'All board members are shareholders. All shareholders attend the annual general meeting. Only people who have attended the AGM can vote on resolutions. Elena is a board member.

Which conclusion definitely follows?', 'Elena can vote on resolutions', 'Elena attended the AGM', 'Elena is a shareholder who attends the AGM and can vote on resolutions', 'Elena is only a shareholder', 'c', NULL, false, true),
  ('8f5de65c-aabe-4b8a-9452-bfcb6c51aa86', 'logical_sequence', 'hard', '2, 3, 5, 7, 11, 13, ?', '15', '17', '19', '21', 'c', NULL, false, true),
  ('92f22e10-e20b-4ba1-a365-5e552a774aea', 'pattern_recognition', 'hard', 'How many dots come next?

●    ●●    ●●●    ●●●●●    ●●●●●●●●    ?', '13', '10', '12', '16', 'a', NULL, false, true),
  ('93d09ef6-aad8-4d03-b89f-7eb16ed11a90', 'numerical', 'medium', 'If 2/3 of a number is 48, what is the number?', '60', '66', '72', '80', 'c', NULL, false, true),
  ('9466a2f5-ba8b-4852-b005-2a929dcac9b9', 'numerical', 'hard', 'If 3 machines produce 450 units in 5 hours, how many units do 5 machines produce in 8 hours?', '1050', '1100', '1200', '1500', 'c', NULL, false, true),
  ('95b43e24-1bc8-4e91-9e1a-52e6ea3376f0', 'pattern_recognition', 'hard', 'If  ○○ = ●  and  ●● = ■,  what does  ○○○○  equal?', '●●', '○○', '■', '●', 'c', NULL, false, true),
  ('988b7c51-5da9-40de-be8a-637c502c78d8', 'deductive', 'easy', 'All project managers attend the weekly meeting. Tom attends the weekly meeting.

Which conclusion definitely follows?', 'Tom is definitely a project manager', 'Tom may or may not be a project manager', 'Tom is not a project manager', 'Tom manages at least one project', 'b', NULL, false, true),
  ('98b03721-ad4f-41d5-8028-52cb3e0cc5bb', 'numerical', 'easy', 'If there are 24 students and 3 leave, how many remain?', '20', '21', '25', '27', 'b', NULL, false, true),
  ('99b5f20d-436f-44fc-859c-8c87c99859e0', 'verbal_analogy', 'hard', 'ATROPHY : MUSCLE :: EROSION : ?', 'Land', 'River', 'Rock', 'Cliff', 'c', NULL, false, true),
  ('99c993da-1df8-4706-833f-aaf384fa4247', 'numerical', 'medium', 'If the ratio of boys to girls is 3:4 and there are 12 boys, how many girls are there?', '14', '16', '18', '20', 'b', NULL, false, true),
  ('9af34f0b-7743-4303-b211-352b34b937f7', 'numerical', 'easy', 'What is 25% of 80?', '15', '20', '25', '30', 'b', NULL, false, true),
  ('9bb1252d-9d39-48de-ba5f-7151e033f819', 'verbal_analogy', 'medium', 'RECKLESS : CAUTIOUS :: ARROGANT : ?', 'Proud', 'Modest', 'Humble', 'Shy', 'c', NULL, false, true),
  ('9bb6d72d-df1e-4d12-995f-3d7eb26af1ea', 'logical_sequence', 'medium', '64, 32, 16, 8, ?', '2', '3', '4', '5', 'c', NULL, false, true),
  ('9bccf586-8f68-4057-b8fd-8f1e5c9cd068', 'logical_sequence', 'medium', '1, 2, 4, 7, 11, ?', '16', '15', '14', '13', 'a', NULL, false, true),
  ('9c1822f4-7563-4123-9f2b-f33c38e9b84b', 'logical_sequence', 'easy', '2, 4, 6, 8, ?', '9', '10', '12', '14', 'b', NULL, false, true),
  ('9d16c765-3d94-4b31-8151-8ae06daef294', 'verbal_analogy', 'hard', 'SOLILOQUY : PLAYWRIGHT :: MONOLOGUE : ?', 'Script', 'Speaker', 'Actor', 'Stage', 'c', NULL, false, true),
  ('9de49465-20b7-466f-a603-8fda60b14a79', 'verbal_analogy', 'easy', 'FAST : SLOW :: LOUD : ?', 'Noise', 'Sound', 'Quiet', 'Silent', 'c', NULL, false, true),
  ('9e18d44e-40cd-4750-9491-2692fab19f5d', 'pattern_recognition', 'easy', 'What comes next?

●  ○  ●  ○  ●  ?', '●', '▲', '■', '○', 'd', NULL, false, true),
  ('9eae06dd-abda-4412-a7c7-a4ab5d407f21', 'deductive', 'hard', 'No project sponsor can approve their own team''s expense claims. All expense claims over £2,000 require project sponsor approval. The finance project''s expense claim of £3,500 has been submitted. The finance director is also the project sponsor for the finance project.

Which conclusion definitely follows?', 'The claim cannot be approved', 'The finance director can approve the claim as a director', 'The finance director cannot approve this claim in their role as sponsor', 'A different director must handle this claim', 'c', NULL, false, true),
  ('9f9ae994-d866-4132-af2c-73752bb12e1f', 'logical_sequence', 'easy', '3, 6, 9, 12, ?', '15', '16', '18', '20', 'a', NULL, false, true),
  ('9faddc38-1abd-437b-b3ea-aed280064353', 'logical_sequence', 'easy', '12, 10, 8, 6, ?', '3', '4', '5', '6', 'c', NULL, false, true),
  ('a047679c-8a42-4321-8d49-b9c0988509da', 'deductive', 'easy', 'No approved document contains errors. This document contains errors.

Which conclusion definitely follows?', 'This document will be corrected soon', 'All documents contain errors', 'This document has not been approved', 'The approval process has failed', 'c', NULL, false, true),
  ('a0c1e9d3-470c-45ec-8b25-8a54a378f125', 'numerical', 'hard', 'A population increases 4% yearly. Starting at 50,000, approximate population after 2 years?', '54,000', '54,080', '54,320', '55,000', 'c', NULL, false, true),
  ('a11ccb05-0d7b-4418-962f-c1c534e92383', 'deductive', 'easy', 'Every team leader attends the Monday briefing. Alex attends the Monday briefing.

Which conclusion definitely follows?', 'Alex is a team leader', 'Alex may or may not be a team leader', 'Alex leads multiple teams', 'The Monday briefing is mandatory for all staff', 'b', NULL, false, true),
  ('a1e673ca-8e69-4f6e-a830-ac8f44f2046f', 'numerical', 'hard', 'If efficiency increases by 20% and output was 1000 units, new output is?', '1100', '1150', '1200', '1250', 'c', NULL, false, true),
  ('a25ce7f9-a916-4dbd-a040-a6e9aadea3a0', 'pattern_recognition', 'medium', 'What fills the blank?

Row 1:  ○  ■  ▲
Row 2:  ■  ▲  ○
Row 3:  ▲  ○  ?', '■', '▲', '○', '□', 'a', NULL, false, true),
  ('a46667ed-45c5-4801-b89b-5ece3672cac4', 'verbal_analogy', 'easy', 'CLOCK : TIME :: RULER : ?', 'Draw', 'Straight', 'Measure', 'Length', 'd', NULL, false, true),
  ('a4f025ad-5599-4922-a659-75b75d8d4413', 'verbal_analogy', 'medium', 'CONCISE : VERBOSE :: TRANSPARENT : ?', 'Clear', 'Hidden', 'Opaque', 'Dark', 'c', NULL, false, true),
  ('a4f503d3-37d9-4f3d-812f-7e554d079010', 'verbal_analogy', 'medium', 'GLOVE : HAND :: HELMET : ?', 'Armour', 'Protection', 'Safety', 'Head', 'd', NULL, false, true),
  ('a654811a-c9ae-45cf-a2e8-d757f33fccee', 'numerical', 'easy', 'If you have 10 apples and add 5 more, how many do you have?', '12', '14', '15', '16', 'c', NULL, true, true),
  ('a6ced7b8-6aa0-45df-800e-4b94a5e39130', 'deductive', 'hard', 'Any client account inactive for more than 90 days is moved to archived status. No archived account can place new orders without reactivation. Reactivation requires approval from a senior account manager. The Morrison account has been inactive for 95 days.

Which conclusion definitely follows?', 'The Morrison account is archived', 'The Morrison account cannot place new orders without a senior account manager''s approval', 'The Morrison account has been archived and cannot place new orders without reactivation approved by a senior account manager', 'The Morrison account will be closed permanently', 'c', NULL, false, true),
  ('a79b6461-4cf6-473f-974b-7732f7bfb01a', 'verbal_analogy', 'easy', 'BIRD : FLY :: FISH : ?', 'Float', 'Breathe', 'Swim', 'Dive', 'c', NULL, false, true),
  ('a7bf2e2f-f420-4d39-a6bf-88a33ef1bd79', 'numerical', 'easy', 'A class has 28 students. 1/4 are absent. How many are present?', '18', '19', '20', '21', 'd', NULL, false, true),
  ('a8435fcd-2b0a-4bd6-a307-3ea36c75938a', 'numerical', 'medium', 'If you invest £1000 at 5% annual interest, how much after 1 year?', '£1,045', '£1,050', '£1,055', '£1,100', 'b', NULL, false, true),
  ('a8f723c5-5add-4a3c-a4af-a339ffc1d7d0', 'numerical', 'easy', 'If 3 apples cost £1.50, what does 1 apple cost?', '£0.30', '£0.40', '£0.50', '£0.60', 'c', NULL, false, true),
  ('a9f63591-2466-466e-b3f9-51c47b74e908', 'logical_sequence', 'medium', '1, 3, 4, 7, 11, ?', '18', '19', '20', '21', 'a', NULL, false, true),
  ('aa696e00-86ff-4e26-b3d1-97f676a38451', 'numerical', 'hard', 'Two containers hold water in ratio 5:3. The larger has 750 liters. Combined volume?', '1100', '1200', '1250', '1300', 'c', NULL, false, true),
  ('aa7f6f61-8f5c-4522-aeb3-64bcc439b9f0', 'numerical', 'hard', 'A discount of 15% followed by a 10% surcharge on £80. Final price?', '£72', '£75.60', '£76', '£77.20', 'b', NULL, false, true),
  ('ac07da90-6276-4416-8674-4603e051b3f3', 'logical_sequence', 'medium', '100, 99, 97, 94, 90, ?', '84', '85', '86', '88', 'b', NULL, false, true),
  ('ac70aec9-bf49-4235-a912-8f63c88cab6b', 'pattern_recognition', 'easy', 'What comes next?

▲  ▲  ▲  △    ▲  ▲  ▲  ?', '▲', '△', '■', '○', 'b', NULL, false, true),
  ('aef8b277-50a3-4f9d-97c7-1dcebea36985', 'logical_sequence', 'hard', '2, 6, 12, 20, 30, 42, ?', '54', '56', '58', '60', 'b', NULL, false, true),
  ('affc26a1-609b-45e1-bb91-617dd4bf4bf7', 'pattern_recognition', 'hard', 'What comes next?

■  ○    ■  ○○    ■  ○○○    ■  ?', '○○○○', '○○○', '■■', '○', 'a', NULL, false, true),
  ('b10c81b5-e284-43d6-bec7-9ebeae80256c', 'logical_sequence', 'hard', '6, 11, 21, 36, 56, ?', '80', '81', '82', '84', 'c', NULL, false, true),
  ('b17e88d9-a750-4cfd-be57-6d215c29a532', 'pattern_recognition', 'medium', 'What fills the blank?

Row 1:  ■  ○  ○
Row 2:  ○  ■  ○
Row 3:  ○  ○  ?', '○', '■', '▲', '□', 'b', NULL, false, true),
  ('b2f7ca10-381d-4fa0-ae2d-2086b1bba4d0', 'logical_sequence', 'hard', '3, 5, 9, 17, 33, ?', '64', '65', '66', '67', 'b', NULL, false, true),
  ('b34f7247-5c60-4ab4-b222-f4790659121d', 'deductive', 'medium', 'All employees in Band C or above can approve expenses. Only managers are in Band C or above. Tom is not a manager.

Which conclusion definitely follows?', 'Tom cannot approve any expenses', 'Tom can approve small expenses', 'Tom will be promoted to Band C', 'Tom should ask his manager to approve expenses', 'a', NULL, false, true),
  ('b3d1142b-f0b9-4f22-b984-1be238cb0481', 'deductive', 'easy', 'All expired products must be removed from the shelf immediately. This product has not expired.

Which conclusion definitely follows?', 'This product does not need to be removed immediately', 'This product is safe to eat', 'Expired products are dangerous', 'This product will expire soon', 'a', NULL, false, true),
  ('b408b59d-1c7a-4bf1-82d8-1ba70ef5323d', 'pattern_recognition', 'easy', 'What comes next in the sequence?

○  ●  ○  ●  ○  ?', '○', '●', '■', '▲', 'b', NULL, false, true),
  ('b4293774-1c49-4540-86d8-7d44ae6a191c', 'deductive', 'easy', 'No project classified as confidential can be shared with external partners. Project Nexus is classified as confidential.

Which conclusion definitely follows?', 'Project Nexus should be cancelled', 'Project Nexus cannot be shared with external partners', 'External partners are untrustworthy', 'Project Nexus may be shared if approved', 'b', NULL, false, true),
  ('b47cc779-7854-49dc-9453-499030bb2271', 'pattern_recognition', 'medium', 'What comes next?

○  ○  ○  ■    ○  ○  ○  ■    ○  ○  ○  ?', '○', '■', '▲', '□', 'b', NULL, false, true),
  ('b65b77d3-bb30-4500-837c-8a42e69fc17e', 'deductive', 'medium', 'Every new starter must complete induction training within 30 days of joining. No employee can access the client database without completing induction training. Ahmed joined 20 days ago and has not completed induction.

Which conclusion definitely follows?', 'Ahmed has violated company policy', 'Ahmed can still complete induction on time', 'Ahmed cannot currently access the client database', 'Ahmed will be dismissed for non-compliance', 'c', NULL, false, true),
  ('b72a9e3e-0042-480e-8ce3-6cb4fbd64c4b', 'deductive', 'easy', 'Some employees work from home on Fridays. Sam works from home on Fridays.

Which conclusion definitely follows?', 'Sam is among the employees who work from home on Fridays', 'All employees work from home on Fridays', 'Sam works from home every day', 'Sam is a senior employee', 'a', NULL, false, true),
  ('bbf82d76-5162-4a18-b95c-38ab603ba182', 'numerical', 'hard', 'Three items: A costs twice as much as B, C costs 1.5× B. If total is £240, B costs?', '£48', '£54', '£60', '£70', 'c', NULL, false, true),
  ('bc23849f-6e25-42f7-8f96-11826a7e8346', 'logical_sequence', 'hard', '3, 7, 16, 35, 74, ?', '150', '151', '152', '153', 'b', NULL, false, true),
  ('bd195039-2686-4f72-a9de-461fa9725827', 'verbal_analogy', 'hard', 'ENERVATE : INVIGORATE :: RETICENT : ?', 'Reserved', 'Quiet', 'Garrulous', 'Cautious', 'c', NULL, false, true),
  ('bd9f772d-914f-4774-bd2e-cbfd15e24082', 'numerical', 'medium', 'A recipe serves 4. To serve 10 people, by what factor should you multiply ingredients?', '1.5', '2', '2.5', '3', 'c', NULL, false, true),
  ('c132dd5e-0539-4190-ac13-1ce64c4cadce', 'logical_sequence', 'easy', '5, 5, 10, 15, 25, ?', '40', '45', '50', '55', 'a', NULL, false, true),
  ('c237e707-e9b9-43d6-a2e8-3126076d21e6', 'numerical', 'easy', 'What is 10% of 250?', '20', '25', '30', '35', 'b', NULL, false, true),
  ('c4b36ba9-4836-49ab-b5aa-be25c60ab556', 'pattern_recognition', 'medium', 'What comes next?

■○○    ■■○○    ■■■○○    ?', '■■■■○○○', '■■■■○○', '■■○○○', '■■■○○○', 'b', NULL, false, true),
  ('c649c2ee-76b0-4d8a-b21c-a6b98c6fcac1', 'verbal_analogy', 'easy', 'CAR : GARAGE :: PLANE : ?', 'Airport', 'Hangar', 'Runway', 'Terminal', 'b', NULL, false, true),
  ('c690c4da-6be9-4e7b-9dfa-efd5f2453a20', 'pattern_recognition', 'medium', 'What comes next?

■○    ■■○○    ■■■○○○    ?', '■■■■○○○○', '■■○○', '○○○○', '■■■■', 'a', NULL, false, true),
  ('c913d161-f953-4242-9e77-d0f9c207098a', 'logical_sequence', 'easy', '100, 50, 25, ?', '12', '12.5', '13', '15', 'b', NULL, false, true),
  ('c917fe59-53dc-4279-98fa-917b4179c1a8', 'deductive', 'medium', 'If a meeting has more than 8 attendees, a formal agenda must be circulated 24 hours in advance. If no formal agenda is circulated, the meeting must be rescheduled. The Monday call has 10 confirmed attendees and no agenda has been circulated.

Which conclusion definitely follows?', 'The Monday call will be cancelled permanently', 'The Monday call must be rescheduled', 'The Monday call may proceed informally', 'Someone should write the agenda immediately', 'b', NULL, false, true),
  ('c9e6d889-ee41-472a-bb62-53e82828abe2', 'pattern_recognition', 'easy', 'What comes next?

●  ●  ●  ○    ●  ●  ●  ○    ●  ●  ●  ?', '●', '△', '■', '○', 'd', NULL, false, true),
  ('ca9fe974-41d2-43a0-807e-7aac778f950b', 'numerical', 'medium', 'If 5 items cost £45, what do 8 items cost?', '£65', '£70', '£72', '£75', 'c', NULL, false, true),
  ('cb555f43-148e-4b89-b79b-faa80a008be0', 'numerical', 'easy', 'If a shirt costs £25 and you buy 2, what is the total?', '£40', '£45', '£50', '£55', 'c', NULL, false, true),
  ('cb899ede-0db0-41c6-9fdb-f45ea628e378', 'verbal_analogy', 'hard', 'EPHEMERAL : ENDURING :: CAPRICIOUS : ?', 'Whimsical', 'Steady', 'Impulsive', 'Fleeting', 'b', NULL, false, true),
  ('cc563d80-3db1-4703-b0eb-329c57c4b329', 'deductive', 'medium', 'Every complaint that mentions discrimination is escalated to the HR director. All escalated complaints are acknowledged within 48 hours. A complaint received today mentions discrimination.

Which conclusion definitely follows?', 'The complaint will be resolved today', 'The complaint will be acknowledged within 48 hours', 'The HR director will investigate immediately', 'The complaint may be escalated at the HR director''s discretion', 'b', NULL, false, true),
  ('cc70a1fa-45ea-4110-8393-ccac4aa88c02', 'numerical', 'medium', 'A car costs £20,000. Its value decreases by 15% per year. What is it worth after 1 year?', '£15,000', '£16,500', '£17,000', '£18,000', 'b', NULL, false, true),
  ('ccc2345a-6256-4a28-8225-5263a4f1a026', 'verbal_analogy', 'easy', 'SUGAR : SWEET :: LEMON : ?', 'Yellow', 'Fruit', 'Sour', 'Bitter', 'c', NULL, false, true),
  ('ccd3e111-d655-42bb-b734-2faa1135ca54', 'logical_sequence', 'medium', '1, 3, 6, 10, 15, ?', '20', '21', '22', '23', 'b', NULL, false, true),
  ('ce127ed7-cae3-448f-8f0b-d18e50df65ed', 'numerical', 'easy', 'What is half of 84?', '38', '40', '42', '44', 'c', NULL, false, true),
  ('d0c0bc24-5159-4634-9366-dc327c9e70ca', 'deductive', 'easy', 'Every applicant who passed the written test was invited for an interview. David was not invited for an interview.

Which conclusion definitely follows?', 'David did not submit an application', 'David did not pass the written test', 'David will reapply next year', 'The written test was too difficult', 'b', NULL, false, true),
  ('d31a1e78-6b1c-4fdc-b80c-461d810e72da', 'verbal_analogy', 'medium', 'ANARCHY : ORDER :: DISCORD : ?', 'Peace', 'Harmony', 'Quiet', 'Agreement', 'b', NULL, false, true),
  ('d391ba6e-e33f-4fb9-b150-19deabe989b5', 'deductive', 'hard', 'Every client account with more than 3 escalations in a quarter is flagged for review. All flagged accounts are assigned a senior manager. Accounts assigned a senior manager receive priority support. The Halford account had 4 escalations last quarter.

Which conclusion definitely follows?', 'The Halford account may be flagged for review', 'The Halford account receives priority support', 'The Halford account''s senior manager requested the review', 'The Halford account had poor service last quarter', 'b', NULL, false, true),
  ('d41e8f12-9635-4489-81ff-266e5556333c', 'pattern_recognition', 'easy', 'What comes next?

▲  ○  ▲  ○  ▲  ○  ▲  ?', '▲', '■', '○', '□', 'c', NULL, false, true),
  ('d83e6895-e07d-4efc-aace-6736501cf760', 'verbal_analogy', 'easy', 'KNIFE : CUT :: BRUSH : ?', 'Clean', 'Hair', 'Paint', 'Stroke', 'c', NULL, true, true),
  ('da29ff20-cbe6-4aa1-a929-ddf57acd66c0', 'deductive', 'medium', 'No vendor on the restricted list is awarded a new contract. Any vendor with two quality failures in 12 months is placed on the restricted list. Vendor Apex had three quality failures last year.

Which conclusion definitely follows?', 'Vendor Apex may be placed on the restricted list', 'Vendor Apex will not be awarded a new contract', 'Vendor Apex has lost its previous contracts', 'Vendor Apex must improve its quality standards', 'b', NULL, false, true),
  ('db1b2c50-69ac-48ac-b677-319e367e3d05', 'numerical', 'medium', 'If 8 workers can complete a job in 15 days, how many days for 12 workers at the same rate?', '8', '10', '12', '15', 'b', NULL, false, true),
  ('de2288c1-1724-4f1b-88bc-2a4994e655dc', 'logical_sequence', 'medium', '4, 8, 12, 20, 32, ?', '48', '50', '52', '54', 'c', NULL, false, true),
  ('de69974c-09a9-418f-87f0-6eb660a9742c', 'logical_sequence', 'easy', '1, 2, 3, 4, 5, ?', '6', '7', '8', '9', 'a', NULL, false, true),
  ('df0bf39a-fca2-4d68-be3e-3ea1f1af2063', 'logical_sequence', 'easy', '50, 45, 40, 35, ?', '30', '32', '34', '36', 'a', NULL, false, true),
  ('df1fc60a-0b92-42d4-bdca-9e1995459adf', 'numerical', 'hard', 'A loan of £10,000 at 6% interest per year, simple interest for 3 years, total to repay?', '£11,600', '£11,700', '£11,800', '£12,000', 'c', NULL, false, true),
  ('e00e8ada-2977-461b-9a7b-e93a1050f9b4', 'pattern_recognition', 'hard', 'What fills the blank?

Row 1:  ○  ■  ▲  □
Row 2:  ■  ▲  □  ○
Row 3:  ▲  □  ○  ■
Row 4:  □  ○  ■  ?', '□', '○', '■', '▲', 'd', NULL, false, true),
  ('e1c3b8fc-1f5c-42a4-b34c-371148895b3c', 'verbal_analogy', 'hard', 'OBSEQUIOUS : SERVILE :: LACONIC : ?', 'Brief', 'Terse', 'Quiet', 'Verbose', 'b', NULL, false, true),
  ('e1e89c0b-850e-4021-a22d-95a93c9858ba', 'pattern_recognition', 'medium', 'How many dots come next?

●●●●●    ●●●●    ●●●    ●●    ●    ●●    ?', '1', '2', '3', '4', 'c', NULL, false, true),
  ('e1fa6bbb-8f4f-4f67-9582-0221f4d1f5c6', 'deductive', 'medium', 'All directors have budget approval authority. No budget approval authority is granted to anyone below manager level. Helen has budget approval authority.

Which conclusion definitely follows?', 'Helen is a director', 'Helen is a manager', 'Helen is above manager level', 'Helen is not below manager level', 'd', NULL, false, true),
  ('e2b719db-da1f-4028-9b05-95bb0f1ad694', 'verbal_analogy', 'medium', 'TELESCOPE : STARS :: MICROSCOPE : ?', 'Lab', 'Science', 'Cells', 'Lens', 'c', NULL, false, true),
  ('e2f1f7df-aee2-4b3a-8d0b-bdfd55ecb4dc', 'deductive', 'medium', 'All proposals submitted by the deadline were reviewed. Some proposals that were reviewed were accepted. Proposal A was submitted by the deadline.

Which conclusion definitely follows?', 'Proposal A was accepted', 'Proposal A was reviewed', 'Proposal A may have been reviewed', 'Proposal A will be accepted if strong enough', 'b', NULL, false, true),
  ('e5e91778-703e-439c-a9cf-9b4f77d8ee15', 'deductive', 'medium', 'Every product recall requires written confirmation from the quality director. If no written confirmation is received, the recall process cannot proceed. The quality director is on leave until Monday.

Which conclusion definitely follows?', 'The recall will proceed without confirmation', 'The recall process cannot proceed until Monday at the earliest', 'The recall process may not proceed until written confirmation is received', 'A senior manager can authorise the recall instead', 'c', NULL, false, true),
  ('e5f430be-94e5-4c60-8cf7-a81d0b6b6301', 'verbal_analogy', 'hard', 'VINDICATE : CONDEMN :: EXONERATE : ?', 'Accuse', 'Charge', 'Convict', 'Punish', 'c', NULL, false, true),
  ('e7c10f70-7ea7-441d-8a45-120c765cb833', 'logical_sequence', 'hard', '1, 4, 9, 16, 25, 36, ?', '45', '48', '49', '56', 'c', NULL, false, true),
  ('e81e0864-3f78-4342-8f36-485dacfe2890', 'deductive', 'hard', 'All strategic initiatives require board sign-off. Any project over £500k is classified as a strategic initiative. All projects requiring board sign-off must include a risk assessment. Project Orion is valued at £650k.

Which conclusion definitely follows?', 'Project Orion requires a risk assessment', 'Project Orion may require board sign-off', 'Project Orion is too expensive to proceed', 'Project Orion needs a risk assessment only after board approval', 'a', NULL, false, true),
  ('e8ad02b9-b384-4305-a6d7-0517c85c12da', 'logical_sequence', 'medium', '10, 11, 13, 16, 20, ?', '24', '25', '26', '28', 'b', NULL, false, true),
  ('e910a3b8-5f6e-4955-b9ad-8887de59e699', 'numerical', 'medium', 'A mixture has water and salt in ratio 7:2. If there are 18 kg total, how much salt?', '3kg', '4kg', '5kg', '6kg', 'b', NULL, false, true),
  ('e95f7687-499c-48be-94b3-1007df46a151', 'pattern_recognition', 'easy', 'What comes next?

○  ■  ▲    ○  ■  ?', '○', '■', '▲', '□', 'c', NULL, false, true),
  ('ec282cbe-4768-4cc3-9007-9fdd4d598e36', 'pattern_recognition', 'medium', 'What fills the blank?

Row 1:  ▲  ○  ■
Row 2:  ○  ■  ▲
Row 3:  ■  ▲  ?', '▲', '■', '○', '□', 'c', NULL, false, true),
  ('ecb737f4-d6ab-49ee-84d5-95e80573a3be', 'deductive', 'medium', 'If a system alert is classified as Priority 1, the on-call engineer is notified immediately. If the on-call engineer is notified, a response must be logged within 10 minutes. A Priority 1 alert was raised at 3pm.

Which conclusion definitely follows?', 'The alert was resolved by 3:10pm', 'A response was logged within 10 minutes of the alert', 'The on-call engineer was notified at 3pm', 'The on-call engineer was notified and a response must be logged within 10 minutes', 'd', NULL, false, true),
  ('edb079da-0d31-46a5-badc-d5f62383b2ec', 'numerical', 'hard', 'If X is 150% of Y and Y is 200, what is X?', '250', '300', '350', '400', 'b', NULL, false, true),
  ('edb157f1-7985-4b80-80bf-11f8eaefecc5', 'numerical', 'hard', 'A journey takes 45 hours at 60 km/h. At 75 km/h, how long?', '30 hours', '33 hours', '36 hours', '40 hours', 'c', NULL, false, true),
  ('ede9c601-d193-4b9d-ad36-e8fe4d735f5f', 'numerical', 'medium', 'Prices increased by 12% year-on-year. If original was £500, what is it now?', '£540', '£550', '£560', '£570', 'c', NULL, false, true),
  ('ef9e5d78-ce7b-45d2-94f2-ad355431ed89', 'verbal_analogy', 'medium', 'APPRENTICE : MASTER :: NOVICE : ?', 'Guru', 'Expert', 'Senior', 'Professional', 'b', NULL, false, true),
  ('f1a28dee-d1fe-4e08-ba81-c3765224a8a5', 'pattern_recognition', 'medium', 'What comes next?

▲△    ▲▲△△    ▲▲▲△△△    ?', '▲▲▲▲△△△△', '▲△', '▲▲△△', '▲▲▲△△△', 'a', NULL, false, true),
  ('f319988c-82e8-48d8-bece-32a2b8ed62ef', 'numerical', 'easy', 'If you have £100 and spend £35, how much remains?', '£55', '£65', '£75', '£85', 'b', NULL, false, true),
  ('f34bae3d-d867-45a2-a545-10eb903c3abe', 'logical_sequence', 'medium', '2, 3, 5, 8, 13, ?', '20', '21', '22', '23', 'b', NULL, false, true),
  ('f4d4c2b6-2384-41fd-aa78-e76284a4335e', 'verbal_analogy', 'medium', 'PRUNE : TREE :: EDIT : ?', 'Document', 'Writer', 'Text', 'Book', 'c', NULL, false, true),
  ('f4fd83e2-5489-4971-9373-ffe830ef6b16', 'verbal_analogy', 'easy', 'SONG : SINGER :: PAINTING : ?', 'Artist', 'Canvas', 'Painter', 'Museum', 'c', NULL, false, true),
  ('f5427d8d-1ccd-42a3-9620-cbb65197aee5', 'logical_sequence', 'medium', '1, 4, 9, 16, 25, ?', '30', '35', '36', '40', 'c', NULL, false, true),
  ('f5ec3594-e611-43ae-b9ad-e43e17b12a5c', 'pattern_recognition', 'medium', 'What comes next?

○○  ●    ○○○  ●●    ○○○○  ●●●    ?', '○○○○○  ●●●●', '○○○  ●●●', '●●●●', '○○○○○', 'a', NULL, false, true),
  ('f6b9e700-46cc-4f06-a2d0-b7229f412571', 'logical_sequence', 'easy', '1, 1, 2, 3, 5, ?', '8', '7', '6', '5', 'a', NULL, false, true),
  ('f6dc3841-006d-46f1-8514-90d2f2594f91', 'pattern_recognition', 'easy', 'What comes next in the sequence?

▲  ■  ○    ▲  ■  ○    ▲  ?', '○', '▲', '■', '□', 'c', NULL, false, true),
  ('f958c9f7-68a8-4bb6-9083-fb89843eab12', 'verbal_analogy', 'medium', 'SORROW : ELATION :: SCARCITY : ?', 'Resources', 'Poverty', 'Wealth', 'Abundance', 'd', NULL, false, true),
  ('f9730e2e-ae4a-4edf-b818-f9cae87f8d18', 'logical_sequence', 'easy', '1, 2, 4, 8, ?', '12', '14', '16', '20', 'c', NULL, false, true),
  ('fa881852-ce48-4893-a730-cd12299dbf70', 'verbal_analogy', 'easy', 'EAR : HEAR :: NOSE : ?', 'Face', 'Breathe', 'Sniff', 'Smell', 'd', NULL, false, true),
  ('fbfc066e-b5fa-43d5-a4cf-2d1860bfa149', 'logical_sequence', 'easy', '2, 6, 18, 54, ?', '108', '126', '162', '216', 'c', NULL, false, true),
  ('fc4764d5-f86f-4560-a448-da6951d3f886', 'logical_sequence', 'hard', '2, 4, 8, 14, 22, 32, ?', '42', '43', '44', '45', 'b', NULL, false, true),
  ('fcf65ac8-f4b2-47dd-8363-5b3fe0006761', 'numerical', 'hard', 'Three workers share a payment in ratio 2:3:5. If total is £1000, the largest share is?', '£400', '£450', '£500', '£550', 'c', NULL, false, true),
  ('fdce0a01-b316-4a0a-95ec-22db7fabaad1', 'verbal_analogy', 'easy', 'RAIN : WET :: FIRE : ?', 'Burn', 'Warm', 'Hot', 'Bright', 'c', NULL, false, true)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  difficulty = EXCLUDED.difficulty,
  question_text = EXCLUDED.question_text,
  option_a = EXCLUDED.option_a,
  option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c,
  option_d = EXCLUDED.option_d,
  correct_answer = EXCLUDED.correct_answer,
  svg_content = EXCLUDED.svg_content,
  is_practice = EXCLUDED.is_practice,
  is_active = EXCLUDED.is_active;
