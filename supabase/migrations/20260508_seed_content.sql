insert into public.videos (title, slug, module, description, bunny_video_id, duration_sec, order_index, is_bonus) values
('La medecine prophetique', 'la-medecine-prophetique', 'principal', 'Video de formation Bsaha', 'bunny-1', 300, 1, false),
('La maladie de Crohn - introduction', 'la-maladie-de-crohn-introduction', 'principal', 'Video de formation Bsaha', 'bunny-2', 300, 2, false),
('Les causes - resume', 'les-causes-resume', 'principal', 'Video de formation Bsaha', 'bunny-3', 300, 3, false),
('La genetique', 'la-genetique', 'principal', 'Video de formation Bsaha', 'bunny-4', 300, 4, false),
('L''epigenetique', 'l-epigenetique', 'principal', 'Video de formation Bsaha', 'bunny-5', 300, 5, false),
('L''inflammation - c''est quoi ?', 'l-inflammation-c-est-quoi', 'principal', 'Video de formation Bsaha', 'bunny-6', 300, 6, false),
('Les facteurs environnementaux', 'les-facteurs-environnementaux', 'principal', 'Video de formation Bsaha', 'bunny-7', 300, 7, false),
('L''alimentation moderne', 'l-alimentation-moderne', 'principal', 'Video de formation Bsaha', 'bunny-8', 300, 8, false),
('L''alimentation anti-inflammatoire', 'l-alimentation-anti-inflammatoire', 'principal', 'Video de formation Bsaha', 'bunny-9', 300, 9, false),
('Le systeme digestif', 'le-systeme-digestif', 'principal', 'Video de formation Bsaha', 'bunny-10', 300, 10, false),
('La digestion des glucides', 'la-digestion-des-glucides', 'principal', 'Video de formation Bsaha', 'bunny-11', 300, 11, false),
('La digestion des proteines', 'la-digestion-des-proteines', 'principal', 'Video de formation Bsaha', 'bunny-12', 300, 12, false),
('La digestion des lipides', 'la-digestion-des-lipides', 'principal', 'Video de formation Bsaha', 'bunny-13', 300, 13, false),
('Le systeme nerveux', 'le-systeme-nerveux', 'principal', 'Video de formation Bsaha', 'bunny-14', 300, 14, false),
('Le systeme hormonal', 'le-systeme-hormonal', 'principal', 'Video de formation Bsaha', 'bunny-15', 300, 15, false),
('Le cycle hormonal feminin', 'le-cycle-hormonal-feminin', 'principal', 'Video de formation Bsaha', 'bunny-16', 300, 16, false),
('La nutrition fonctionnelle du cycle feminin', 'la-nutrition-fonctionnelle-du-cycle-feminin', 'principal', 'Video de formation Bsaha', 'bunny-17', 300, 17, false),
('La contraception', 'la-contraception', 'principal', 'Video de formation Bsaha', 'bunny-18', 300, 18, false),
('Le microbiote intestinal', 'le-microbiote-intestinal', 'principal', 'Video de formation Bsaha', 'bunny-19', 300, 19, false),
('La detox', 'la-detox', 'principal', 'Video de formation Bsaha', 'bunny-20', 300, 20, false),
('L''automassage', 'l-automassage', 'bonus', 'Video bonus Bsaha', 'bunny-21', 300, 21, true),
('La phytotherapie', 'la-phytotherapie', 'bonus', 'Video bonus Bsaha', 'bunny-22', 300, 22, true),
('L''eau', 'l-eau', 'bonus', 'Video bonus Bsaha', 'bunny-23', 300, 23, true),
('Le sport', 'le-sport', 'bonus', 'Video bonus Bsaha', 'bunny-24', 300, 24, true),
('En finir avec les carences', 'en-finir-avec-les-carences', 'bonus', 'Video bonus Bsaha', 'bunny-25', 300, 25, true),
('L''automassage - pratique', 'l-automassage-pratique', 'bonus', 'Video bonus Bsaha', 'bunny-26', 300, 26, true)
on conflict (slug) do update
set
  title = excluded.title,
  module = excluded.module,
  description = excluded.description,
  bunny_video_id = excluded.bunny_video_id,
  duration_sec = excluded.duration_sec,
  order_index = excluded.order_index,
  is_bonus = excluded.is_bonus;

insert into public.ebooks (title, description, storage_path, is_free, order_index) values
('Stopper la crise de Crohn', 'Lead magnet gratuit', 'ebooks/stopper-crise-crohn.pdf', true, 1),
('Les adhkars du matin et du soir', 'Dimension spirituelle', 'ebooks/adhkars-matin-soir.pdf', false, 2),
('Livre de recettes anti-inflammatoires', 'Recettes membres', 'ebooks/recettes-anti-inflammatoires.pdf', false, 3),
('Recettes de jus a l''extracteur', 'Jus et digestion', 'ebooks/recettes-jus-extracteur.pdf', false, 4),
('Comprendre ses analyses medicales', 'Guide analyses', 'ebooks/comprendre-analyses.pdf', false, 5),
('Guide des complements alimentaires', 'Micronutrition', 'ebooks/guide-complements.pdf', false, 6)
on conflict do nothing;
