const addressData = {
            "Capital Area": {
                "Seoul": ["Gangnam-gu", "Gangdong-gu", "Gangbuk-gu", "Gangseo-gu", "Gwanak-gu", "Gwangjin-gu", "Guro-gu", "Geumcheon-gu", "Nowon-gu", "Dobong-gu", "Dongdaemun-gu", "Dongjak-gu", "Mapo-gu", "Seodaemun-gu", "Seocho-gu", "Seongdong-gu", "Seongbuk-gu", "Songpa-gu", "Yangcheon-gu", "Yeongdeungpo-gu", "Yongsan-gu", "Eunpyeong-gu", "Jongno-gu", "Jung-gu", "Jungnang-gu"],
                "Gyeonggi-do": ["Suwon-si Jangan-gu", "Suwon-si Gwonseon-gu", "Suwon-si Paldal-gu", "Suwon-si Yeongtong-gu", "Seongnam-si Sujeong-gu", "Seongnam-si Jungwon-gu", "Seongnam-si Bundang-gu", "Uijeongbu-si", "Anyang-si Manan-gu", "Anyang-si Dongan-gu", "Bucheon-si", "Gwangmyeong-si", "Pyeongtaek-si", "Dongducheon-si", "Ansan-si Sangnok-gu", "Ansan-si Danwon-gu", "Goyang-si Deogyang-gu", "Goyang-si Ilsandong-gu", "Goyang-si Ilsanseo-gu", "Gwacheon-si", "Guri-si", "Namyangju-si", "Osan-si", "Siheung-si", "Gunpo-si", "Uiwang-si", "Hanam-si", "Yongin-si Cheoin-gu", "Yongin-si Giheung-gu", "Yongin-si Suji-gu", "Paju-si", "Icheon-si", "Anseong-si", "Gimpo-si", "Hwaseong-si", "Gwangju-si", "Yangju-si", "Pocheon-si", "Yeoju-si", "Yeoncheon-gun", "Gapyeong-gun", "Yangpyeong-gun"],
                "Incheon": ["Gyeyang-gu", "Michuhol-gu", "Namdong-gu", "Dong-gu", "Bupyeong-gu", "Seo-gu", "Yeonsu-gu", "Jung-gu", "Ganghwa-gun", "Ongjin-gun"]
            },
            "Gangwon Area": {
                "Gangwon-do": ["Chuncheon-si", "Wonju-si", "Gangneung-si", "Donghae-si", "Taebaek-si", "Sokcho-si", "Samcheok-si", "Hongcheon-gun", "Hoengseong-gun", "Yeongwol-gun", "Pyeongchang-gun", "Jeongseon-gun", "Cheorwon-gun", "Hwacheon-gun", "Yanggu-gun", "Inje-gun", "Goseong-gun", "Yangyang-gun"]
            },
            "Chungcheong Area": {
                "Chungcheongbuk-do": ["Cheongju-si Sangdang-gu", "Cheongju-si Seowon-gu", "Cheongju-si Heungdeok-gu", "Cheongju-si Cheongwon-gu", "Chungju-si", "Jecheon-si", "Boeun-gun", "Okcheon-gun", "Yeongdong-gun", "Jeungpyeong-gun", "Jincheon-gun", "Goesan-gun", "Eumseong-gun", "Danyang-gun"],
                "Chungcheongnam-do": ["Cheonan-si Dongnam-gu", "Cheonan-si Seobuk-gu", "Gongju-si", "Boryeong-si", "Asan-si", "Seosan-si", "Nonsan-si", "Gyeryong-si", "Dangjin-si", "Geumsan-gun", "Buyeo-gun", "Seocheon-gun", "Cheongyang-gun", "Hongseong-gun", "Yesan-gun", "Taean-gun"],
                "Daejeon": ["Daedeok-gu", "Dong-gu", "Seo-gu", "Yuseong-gu", "Jung-gu"],
                "Sejong": ["Sejong"]
            },
            "Jeolla Area": {
                "Jeollabuk-do": ["Jeonju-si Wansan-gu", "Jeonju-si Deokjin-gu", "Gunsan-si", "Iksan-si", "Jeongeup-si", "Namwon-si", "Gimje-si", "Wanju-gun", "Jinan-gun", "Muju-gun", "Jangsu-gun", "Imsil-gun", "Sunchang-gun", "Gochang-gun", "Buan-gun"],
                "Jeollanam-do": ["Mokpo-si", "Yeosu-si", "Suncheon-si", "Naju-si", "Gwangyang-si", "Damyang-gun", "Gokseong-gun", "Gurye-gun", "Goheung-gun", "Boseong-gun", "Hwasun-gun", "Jangheung-gun", "Gangjin-gun", "Haenam-gun", "Yeongam-gun", "Muan-gun", "Hampyeong-gun", "Yeonggwang-gun", "Jangseong-gun", "Wando-gun", "Jindo-gun", "Sinan-gun"],
                "Gwangju": ["Gwangsan-gu", "Nam-gu", "Dong-gu", "Buk-gu", "Seo-gu"]
            },
            "Gyeongsang Area": {
                "Gyeongsangbuk-do": ["Pohang-si Nam-gu", "Pohang-si Buk-gu", "Gyeongju-si", "Gimcheon-si", "Andong-si", "Gumi-si", "Yeongju-si", "Yeongcheon-si", "Sangju-si", "Mungyeong-si", "Gyeongsan-si", "Gunwi-gun", "Uiseong-gun", "Cheongsong-gun", "Yeongyang-gun", "Yeongdeok-gun", "Cheongdo-gun", "Goryeong-gun", "Seongju-gun", "Chilgok-gun", "Yecheon-gun", "Bonghwa-gun", "Uljin-gun", "Ulleung-gun"],
                "Gyeongsangnam-do": ["Changwon-si Uichang-gu", "Changwon-si Seongsan-gu", "Changwon-si Masanhappo-gu", "Changwon-si Masanhoewon-gu", "Changwon-si Jinhae-gu", "Jinju-si", "Tongyeong-si", "Sacheon-si", "Gimhae-si", "Miryang-si", "Geoje-si", "Yangsan-si", "Uiryeong-gun", "Haman-gun", "Changnyeong-gun", "Goseong-gun", "Namhae-gun", "Hadong-gun", "Sancheong-gun", "Hamyang-gun", "Geochang-gun", "Hapcheon-gun"],
                "Busan": ["Gangseo-gu", "Geumjeong-gu", "Nam-gu", "Dong-gu", "Dongnae-gu", "Busanjin-gu", "Buk-gu", "Sasang-gu", "Saha-gu", "Seo-gu", "Suyeong-gu", "Yeonje-gu", "Yeongdo-gu", "Jung-gu", "Haeundae-gu", "Gijang-gun"],
                "Daegu": ["Nam-gu", "Dalseo-gu", "Dong-gu", "Buk-gu", "Seo-gu", "Suseong-gu", "Jung-gu", "Dalseong-gun"],
                "Ulsan": ["Nam-gu", "Dong-gu", "Buk-gu", "Jung-gu", "Ulju-gun"]
            },
            "Jeju Area": {
                "Jeju": ["Seogwipo-si", "Jeju-si"]
            }
        };

export default addressData;
