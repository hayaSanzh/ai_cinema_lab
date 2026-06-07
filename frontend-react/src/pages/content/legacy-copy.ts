import { supportedLanguages, type SupportedLanguage } from '../../shared/i18n/i18n';

type Paragraphs = string[];

type HomeCopy = {
  tabs: {
    concept: string;
    research: string;
    visuals: string;
  };
  aboutTabs: Record<'Concept' | 'Research' | 'Visuals', Paragraphs>;
  counters: string[];
  focusCards: Array<{
    title: string;
    body: string;
  }>;
  featuredTitle: string;
  projects: Array<{
    label: string;
    title: string;
    body: string;
  }>;
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  quote: string;
  tools: {
    eyebrow: string;
    title: string;
    items: string[];
  };
  message: {
    title: string;
    cta: string;
    body: string;
  };
};

type AboutCopy = {
  intro: Paragraphs;
  quiz: string;
  tabs: {
    mission: string;
    vision: string;
    values: string;
  };
  mission: {
    body: string;
    items: string[];
  };
  vision: {
    body: string;
  };
  values: {
    body: string;
    items: string[];
  };
};

type CasesCopy = {
  cards: Array<{
    category: string;
    body: string;
  }>;
};

export type LegacyCopy = {
  home: HomeCopy;
  about: AboutCopy;
  cases: CasesCopy;
};

export const legacyCopyByLanguage: Record<SupportedLanguage, LegacyCopy> = {
  en: {
    home: {
      tabs: {
        concept: 'Concept',
        research: 'Research',
        visuals: 'Visual Experiments',
      },
      aboutTabs: {
        Concept: [
          '<b>AI Cinema Lab</b> investigates how artificial intelligence, deepfakes, and digital actors are reshaping modern cinema. We explore how machine-generated performances affect emotion, presence, and authenticity on screen.',
          'The goal is to raise <b>media literacy</b> and awareness — helping audiences understand how AI-driven performances influence perception and redefine what it means to “act” in the digital age.',
        ],
        Research: [
          'The research focuses on <b>audience perception</b> — how viewers emotionally respond to AI-generated or digitally replaced actors. Do people feel empathy towards a synthetic face? Do they notice manipulation? How does trust shift when the performer is artificial?',
          'By combining cinematic analysis, audience testing, and AI-generated scenes, we study the boundaries between reality, illusion, and machine presence in film.',
        ],
        Visuals: [
          'A series of <b>visual experiments</b> demonstrate how AI and deepfake technologies alter cinematic performance. Using real footage and synthetic doubles, we analyze changes in emotion, timing, and viewer response.',
          'The visuals include side-by-side comparisons, frame reconstructions, and full AI-generated short scenes — revealing the new aesthetics of digital acting.',
        ],
      },
      counters: [
        'Films using AI-driven performances or digital actors',
        'Active AI tools for video and performance generation',
      ],
      focusCards: [
        {
          title: 'AI-generated Actors',
          body: 'Exploring how synthetic performers and digital doubles reshape acting, presence, and emotion in modern cinema — redefining what it means to perform on screen.',
        },
        {
          title: 'Deepfake Narratives',
          body: 'Investigating how deepfake technology transforms storytelling and challenges authorship, truth, and visual authenticity in film narratives.',
        },
        {
          title: 'Audience Perception',
          body: 'Studying how audiences emotionally respond to AI-generated performances — questioning empathy, recognition, and realism in the age of synthetic cinema.',
        },
        {
          title: 'Ethics & Authenticity',
          body: 'Reflecting on ethical implications and creative ownership in AI-driven filmmaking — where identity, consent, and authorship merge into digital ambiguity.',
        },
      ],
      featuredTitle: 'Featured <br> <img src="assets/img/has.png" alt="img"> <span>AI in Cinema</span>',
      projects: [
        {
          label: '“The Irishman”, 2019',
          title: 'De-aging through AI technology',
          body: 'Using advanced neural reconstruction, Scorsese’s team digitally rejuvenated actors without traditional makeup. The result raised questions about memory, identity, and the role of AI in preserving cinematic youth.',
        },
        {
          label: '“Secret Invasion”, 2023',
          title: 'AI-generated opening sequence',
          body: 'The first major studio series to feature a fully AI-generated intro. It blurred the line between creative collaboration and ethical controversy, challenging how we define artistic authorship.',
        },
        {
          label: '“Rogue One: A Star Wars Story”, 2016',
          title: 'AI resurrection of actor Peter Cushing',
          body: 'The film digitally revived Peter Cushing, who had died in 1994, recreating his role as Grand Moff Tarkin using advanced facial capture, CGI modeling, and machine learning texture synthesis. This groundbreaking use of AI questioned where digital performance ends and human legacy begins.',
        },
      ],
      faq: {
        eyebrow: 'AI in Cinema',
        title: 'Key <b>Questions</b> and Ethical Reflections',
        description: 'Artificial intelligence is reshaping how we perceive performance, authenticity, and emotion on screen. These questions invite reflection on the future of cinematic storytelling.',
        items: [
          {
            question: 'Can AI truly replace real actors?',
            answer: 'AI-generated faces can mimic expression and tone, but lack emotional intention. The question is not about imitation — it’s about whether empathy can exist without a human soul behind the image.',
          },
          {
            question: 'Who owns a digital likeness of an actor?',
            answer: 'When studios resurrect deceased performers or recreate living ones, ownership becomes blurred. The line between creative tribute and ethical exploitation depends on consent, contracts, and legacy.',
          },
          {
            question: 'Can we trust what we see on screen anymore?',
            answer: 'Deepfakes and AI-driven visuals blur the border between fiction and documentation. The viewer must now develop “visual literacy” — learning to question, analyze, and verify moving images.',
          },
          {
            question: 'Does AI creativity diminish human artistry?',
            answer: 'Many argue AI only extends the artist’s palette — transforming imagination into pixels. Yet when algorithms learn from countless human works, authorship becomes collective, not individual.',
          },
          {
            question: 'What happens when AI outlives its human creator?',
            answer: 'When AI-generated performances continue after an artist’s death, cinema becomes an archive of memory. The boundary between memory and simulation grows thinner — forcing us to redefine presence and legacy.',
          },
        ],
      },
      quote: '“The line between reality and illusion has never been thinner”',
      tools: {
        eyebrow: 'AI Tools Overview',
        title: 'Tools Behind <span>AI-Driven Cinema</span>',
        items: [
          '<b>Runway ML</b> — one of the most widely used AI tools in the film industry. It enables the creation of cinematic scenes, smooth camera movements, and realistic VFX — all generated through machine learning, without heavy post-production.',
          '<b>Kaiber AI</b> — transforms still images and concepts into moving cinematic sequences. Used by filmmakers and artists to generate music videos, surreal motion studies, and story-driven AI animations.',
          '<b>Synthesia</b> — creates digital actors and realistic speech-driven performances. It’s used for producing deepfake-like character interactions and emotional dialogues entirely generated by AI — bridging ethics and storytelling.',
          '<b>Sora</b> — OpenAI’s next-generation text-to-video model that can create full cinematic scenes directly from text prompts. It blurs the line between direction, performance, and machine-driven creativity — reshaping how films are made.',
        ],
      },
      message: {
        title: 'Explore the Future of Cinema <span><b>with AI</b></span>',
        cta: 'Let’s talk',
        body: 'Artificial intelligence is transforming performance and storytelling. Our <b>AI Community</b> is a creative space for filmmakers, artists, and curious minds to share AI news, exchange ideas, learn, and explore how AI reshapes the language of cinema.',
      },
    },
    about: {
      intro: [
        'We are students of <strong>Media Technology</strong> at Astana IT University, united by our passion for visual storytelling and cinema. In our future careers, Ainissa dreams of working as a <strong>film editor</strong>, shaping rhythm and emotion through montage, while Zhaniya aspires to be a <strong>cinematographer</strong>, capturing meaning through light and movement.',
        'The rapid growth of <strong>artificial intelligence</strong> is transforming the way films are made and perceived. Technologies that once belonged to science fiction are now editing, generating, and even performing alongside humans. This evolution raises deep ethical and artistic questions: <em>Can AI truly create emotion? Can we trust what we see on screen?</em>',
        'On social media, millions of clips are created by AI every day. Under each post, one comment repeats again and again — <em>“Is this real or AI?”</em> People begin to doubt their own perception. That question inspired us to create <strong>AI Cinema Lab</strong> — a space where art, ethics, and technology meet to explore trust and truth in visual storytelling.',
      ],
      quiz: 'Try our quiz',
      tabs: {
        mission: 'Our Mission',
        vision: 'Our Vision',
        values: 'Core Values',
      },
      mission: {
        body: 'Our mission is to study and visualize how AI changes the way we create and perceive films. We aim to build awareness about the new boundaries between authenticity and simulation — and to remind that even in a digital world, <strong>emotion is human</strong>.',
        items: [
          'Exploring AI’s impact on film professions',
          'Reflecting on truth and perception in cinema',
          'Combining creativity, ethics, and technology',
        ],
      },
      vision: {
        body: 'We envision a future where <strong>AI and humans collaborate</strong> — where technology becomes not a replacement for creativity, but its expansion.',
      },
      values: {
        body: 'At AI Cinema Lab, we believe in transparency, empathy, and creative courage. Technology should amplify human imagination — not erase it.',
        items: ['Creativity with conscience', 'Curiosity and experimentation', 'Ethical storytelling'],
      },
    },
    cases: {
      cards: [
        {
          category: 'Multiverse Aesthetics',
          body: 'The Daniels used AI-driven editing tools to blend multiple universes and faces. The film visually captures the fragmented logic of digital identity — chaotic yet deeply human.',
        },
        {
          category: 'AI Performance Capture',
          body: 'Neural networks were trained to predict actors’ facial muscles underwater, merging human performance and AI to create seamless emotional realism. “AI and deep learning are becoming part of the filmmaking craft. We don’t use them to replace actors — we use them to reveal more truth in their performances.” - James Cameron',
        },
        {
          category: 'AI Ethics & Visual Realism',
          body: 'Gareth Edwards combined real-world footage with AI compositing tools to generate futuristic landscapes. The film explores coexistence between artificial and organic life — on screen and behind it.',
        },
        {
          category: 'AI Face Reconstruction',
          body: 'AI de-aged Harrison Ford by analyzing decades of archival footage. This fusion of memory and data created a version of the actor who never truly existed — only remembered by algorithms.',
        },
        {
          category: 'Generative AI for visual effects',
          body: 'Used generative AI for visual effects, including the creation of a complex building-collapse sequence, helping reduce production time and costs.',
        },
        {
          category: 'Digital de-aging',
          body: 'Used Vanity AI for digital de-aging, allowing characters to appear younger without extensive makeup or traditional VFX workflows.',
        },
        {
          category: 'De-aging and Age transformation',
          body: 'Used Metaphysic AI for de-aging and age transformation, enabling actors to portray their characters across multiple decades while maintaining the same cast.',
        },
        {
          category: 'Fully AI',
          body: 'Created entirely with Higgsfield Cinema Studio, enabling a single filmmaker to produce a 22-minute action-horror film in one week without a traditional production crew, significantly reducing production time, costs, and post-production requirements.',
        },
        {
          category: 'Fully AI',
          body: 'Created as a fully AI-generated feature film, using AI-generated visuals, characters, and voice transformations with a production budget of under $2,000.',
        },
      ],
    },
  },
  kk: {
    home: {
      tabs: {
        concept: 'Тұжырымдама',
        research: 'Зерттеу',
        visuals: 'Визуалды тәжірибелер',
      },
      aboutTabs: {
        Concept: [
          '<b>AI Cinema Lab</b> жасанды интеллект, дипфейктер және цифрлық актерлер заманауи киноны қалай өзгертіп жатқанын зерттейді. Біз машина арқылы жасалған перформанстар экрандағы эмоцияға, қатысу сезіміне және шынайылыққа қалай әсер ететінін қарастырамыз.',
          'Мақсат — <b>медиа сауаттылықты</b> және хабардарлықты арттыру: көрермендерге AI арқылы жасалған перформанстар қабылдауға қалай әсер ететінін және цифрлық дәуірде “ойнау” ұғымын қалай қайта анықтайтынын түсіндіру.',
        ],
        Research: [
          'Зерттеу <b>көрермен қабылдауына</b> бағытталған: адамдар AI жасаған немесе цифрлық түрде алмастырылған актерлерге эмоциялық тұрғыдан қалай жауап береді? Олар синтетикалық бетке эмпатия сезіне ме? Манипуляцияны байқай ма? Орындаушы жасанды болған кезде сенім қалай өзгереді?',
          'Киноталдау, аудиториялық тестілеу және AI жасаған көріністерді біріктіре отырып, біз фильмдегі шындық, иллюзия және машиналық қатысу арасындағы шекараларды зерттейміз.',
        ],
        Visuals: [
          '<b>Визуалды тәжірибелер</b> сериясы AI және дипфейк технологиялары кинематографиялық перформансты қалай өзгертетінін көрсетеді. Нақты кадрлар мен синтетикалық дубльдерді пайдаланып, эмоция, ырғақ және көрермен реакциясындағы өзгерістерді талдаймыз.',
          'Визуалдар қатарында салыстырмалы кадрлар, кадр реконструкциялары және толық AI жасаған қысқа көріністер бар — олар цифрлық актерліктің жаңа эстетикасын ашады.',
        ],
      },
      counters: [
        'AI перформанстарын немесе цифрлық актерлерді қолданатын фильмдер',
        'Видео және перформанс генерациясына арналған белсенді AI құралдары',
      ],
      focusCards: [
        {
          title: 'AI жасаған актерлер',
          body: 'Синтетикалық орындаушылар мен цифрлық дубльдер актерлік ойынды, экрандағы қатысуды және эмоцияны қалай өзгертетінін зерттеу.',
        },
        {
          title: 'Дипфейк нарративтері',
          body: 'Дипфейк технологиясы оқиға баяндауды қалай өзгертетінін және авторлыққа, шындыққа, визуалды шынайылыққа қалай сұрақ қоятынын қарастыру.',
        },
        {
          title: 'Көрермен қабылдауы',
          body: 'Көрермендердің AI жасаған перформанстарға эмоциялық жауаптарын зерттеу — эмпатия, тану және синтетикалық кино дәуіріндегі реализм мәселелері.',
        },
        {
          title: 'Этика және шынайылық',
          body: 'AI арқылы жасалатын кинодағы этика мен шығармашылық иелік мәселелерін талдау: тұлға, келісім және авторлық цифрлық екіұштылыққа айналады.',
        },
      ],
      featuredTitle: 'Таңдаулы <br> <img src="assets/img/has.png" alt="img"> <span>Кинодағы AI</span>',
      projects: [
        {
          label: '“The Irishman”, 2019',
          title: 'AI технологиясы арқылы жасарту',
          body: 'Жетілдірілген нейрондық реконструкция арқылы Скорсезе командасы актерлерді дәстүрлі гримсіз цифрлық түрде жасартты. Бұл нәтиже жады, тұлғалық болмыс және AI-дың кинодағы жастық бейнені сақтаудағы рөлі туралы сұрақтар көтерді.',
        },
        {
          label: '“Secret Invasion”, 2023',
          title: 'AI жасаған бастапқы титрлер',
          body: 'Толық AI арқылы жасалған интро қолданған алғашқы ірі студиялық сериалдардың бірі. Ол шығармашылық серіктестік пен этикалық даудың арасын бұлдыратып, көркем авторлықты қалай анықтайтынымызға сұрақ қойды.',
        },
        {
          label: '“Rogue One: A Star Wars Story”, 2016',
          title: 'Питер Кушинг актерін AI арқылы қайта жасау',
          body: 'Фильм 1994 жылы қайтыс болған Питер Кушингті цифрлық түрде қайта тірілтіп, оның Гранд Мофф Таркин рөлін бет қимылын түсіру, CGI модельдеу және машиналық текстура синтезі арқылы қалпына келтірді. Бұл AI қолдану цифрлық перформанс пен адам мұрасының шекарасын қайта ойландырды.',
        },
      ],
      faq: {
        eyebrow: 'Кинодағы AI',
        title: 'Негізгі <b>сұрақтар</b> және этикалық ойлар',
        description: 'Жасанды интеллект экрандағы перформансты, шынайылықты және эмоцияны қабылдауымызды өзгертіп жатыр. Бұл сұрақтар кино баяндауының болашағы туралы ойлануға шақырады.',
        items: [
          {
            question: 'AI шынайы актерлерді толық алмастыра ала ма?',
            answer: 'AI жасаған беттер мимика мен интонацияны еліктей алады, бірақ эмоциялық ниетке ие емес. Мәселе еліктеуде емес — адам жаны жоқ бейнеде эмпатия болуы мүмкін бе деген сұрақта.',
          },
          {
            question: 'Актердің цифрлық бейнесі кімге тиесілі?',
            answer: 'Студиялар қайтыс болған орындаушыларды қайта жасағанда немесе тірі актерлерді цифрлық көшіргенде, иелік түсінігі бұлдырайды. Шығармашылық құрмет пен этикалық пайдалану арасындағы шекара келісімге, шарттарға және мұраға байланысты.',
          },
          {
            question: 'Экранда көргенімізге әлі де сене аламыз ба?',
            answer: 'Дипфейктер мен AI визуалдары фантастика мен құжаттылық арасындағы шекараны жояды. Көрермен енді “визуалды сауаттылықты” дамытуы керек — қозғалмалы бейнені сұраққа алып, талдап, тексеруді үйрену.',
          },
          {
            question: 'AI шығармашылығы адам өнерін әлсірете ме?',
            answer: 'Көпшілік AI суретшінің құралдарын ғана кеңейтеді дейді — қиялды пиксельге айналдырады. Бірақ алгоритмдер сансыз адам еңбегінен үйренгенде, авторлық жеке емес, ұжымдық сипатқа ие болады.',
          },
          {
            question: 'AI өз жасаушысынан ұзақ өмір сүрсе не болады?',
            answer: 'AI жасаған перформанстар автор қайтыс болғаннан кейін де жалғасса, кино жады архивіне айналады. Жады мен симуляция арасындағы шекара жұқарады — біз қатысу мен мұра ұғымын қайта анықтауға мәжбүр боламыз.',
          },
        ],
      },
      quote: '“Шындық пен иллюзияның арасындағы сызық бұрын-соңды мұнша жұқа болған емес”',
      tools: {
        eyebrow: 'AI құралдарына шолу',
        title: '<span>AI басқаратын киноның</span> артындағы құралдар',
        items: [
          '<b>Runway ML</b> — кино индустриясында кең қолданылатын AI құралдарының бірі. Ол машиналық оқыту арқылы кинематографиялық көріністер, жұмсақ камера қозғалыстары және реалистік VFX жасауға мүмкіндік береді.',
          '<b>Kaiber AI</b> — статикалық суреттер мен идеяларды қозғалыстағы кинематографиялық тізбектерге айналдырады. Оны режиссерлер мен суретшілер музыкалық видео, сюрреал қозғалыс зерттеулері және AI-анимациялар жасау үшін қолданады.',
          '<b>Synthesia</b> — цифрлық актерлер мен сөйлеуге негізделген реалистік перформанстар жасайды. Ол AI арқылы жасалған кейіпкер диалогтары мен эмоциялық өзара әрекеттер үшін қолданылады.',
          '<b>Sora</b> — OpenAI-дың мәтіннен видео жасайтын жаңа буын моделі. Ол мәтіндік prompt арқылы толық кинематографиялық көріністер жасай алады және режиссура, перформанс, машиналық шығармашылық арасындағы шекараны бұлдыратады.',
        ],
      },
      message: {
        title: 'Киноның болашағын <span><b>AI арқылы</b></span> зерттеңіз',
        cta: 'Сөйлесейік',
        body: 'Жасанды интеллект перформанс пен оқиға баяндауды өзгертіп жатыр. Біздің <b>AI Community</b> — режиссерлер, суретшілер және қызығушылығы бар адамдар AI жаңалықтарын бөлісетін, идея алмасатын, үйренетін және AI кино тілін қалай өзгертетінін зерттейтін шығармашылық кеңістік.',
      },
    },
    about: {
      intro: [
        'Біз Astana IT University университетінің медиа технология студенттеріміз, визуалды сторителлинг пен киноға қызығушылығымыз ортақ. Болашақта Ainissa <strong>монтаж режиссері</strong> болып, монтаж арқылы ырғақ пен эмоция құруды армандайды, ал Zhaniya жарық пен қозғалыс арқылы мағына жеткізетін <strong>оператор</strong> болғысы келеді.',
        '<strong>Жасанды интеллекттің</strong> жылдам дамуы фильмдердің жасалуын және қабылдануын өзгертіп жатыр. Бір кезде ғылыми фантастика болып көрінген технологиялар қазір монтаждап, генерация жасап, адамдармен бірге “ойнап” та жүр. Бұл терең этикалық және көркем сұрақтар туғызады: <em>AI шынайы эмоция жасай ала ма? Экранда көргенімізге сене аламыз ба?</em>',
        'Әлеуметтік желілерде күн сайын миллиондаған AI клиптері пайда болады. Әр посттың астында бір сұрақ қайта-қайта кездеседі — <em>“Бұл шынайы ма, әлде AI ма?”</em> Адамдар өз қабылдауына күмәндана бастайды. Осы сұрақ бізді <strong>AI Cinema Lab</strong> жасауға шабыттандырды — өнер, этика және технология визуалды сторителлингтегі сенім мен шындықты зерттейтін кеңістік.',
      ],
      quiz: 'Квизден өту',
      tabs: {
        mission: 'Миссиямыз',
        vision: 'Көзқарасымыз',
        values: 'Құндылықтар',
      },
      mission: {
        body: 'Біздің миссиямыз — AI фильмдерді жасау және қабылдау тәсілін қалай өзгертетінін зерттеп, визуалдау. Біз шынайылық пен симуляция арасындағы жаңа шекаралар туралы хабардарлық қалыптастырғымыз келеді және цифрлық әлемде де <strong>эмоция адамға тән</strong> екенін еске саламыз.',
        items: [
          'AI-дың кино мамандықтарына әсерін зерттеу',
          'Кинодағы шындық пен қабылдау туралы ойлану',
          'Шығармашылықты, этиканы және технологияны біріктіру',
        ],
      },
      vision: {
        body: 'Біз <strong>AI мен адам бірге жұмыс істейтін</strong> болашақты елестетеміз — технология шығармашылықты алмастырмай, оны кеңейтетін құралға айналады.',
      },
      values: {
        body: 'AI Cinema Lab-та біз ашықтыққа, эмпатияға және шығармашылық батылдыққа сенеміз. Технология адам қиялын өшірмей, оны күшейтуі керек.',
        items: ['Ар-ожданмен жасалатын шығармашылық', 'Қызығушылық және тәжірибе', 'Этикалық сторителлинг'],
      },
    },
    cases: {
      cards: [
        {
          category: 'Мультиәлем эстетикасы',
          body: 'Daniels режиссерлері бірнеше әлем мен беттерді біріктіру үшін AI негізіндегі монтаж құралдарын қолданды. Фильм цифрлық бірегейліктің бөлшектенген логикасын визуалды түрде көрсетеді — хаосты, бірақ терең адамдық.',
        },
        {
          category: 'AI перформансын түсіру',
          body: 'Нейрондық желілер су астындағы актерлердің бет бұлшықеттерін болжауға үйретілді. Бұл адам перформансы мен AI-ды біріктіріп, үздіксіз эмоциялық реализм жасады. “AI және deep learning кино жасау өнерінің бір бөлігіне айналып келеді. Біз оларды актерлерді алмастыру үшін емес, олардың перформансындағы шындықты көбірек ашу үшін қолданамыз.” - James Cameron',
        },
        {
          category: 'AI этикасы және визуалды реализм',
          body: 'Gareth Edwards нақты әлем кадрларын AI compositing құралдарымен біріктіріп, футуристік ландшафттар жасады. Фильм жасанды және органикалық өмірдің қатар өмір сүруін экранда да, өндіріс процесінде де зерттейді.',
        },
        {
          category: 'AI арқылы бет реконструкциясы',
          body: 'AI ондаған жылдық архив кадрларын талдап, Harrison Ford-ты жасартты. Жады мен деректердің бұл қосындысы алгоритмдер ғана “еске түсіретін” актер нұсқасын жасады.',
        },
        {
          category: 'Generative AI for visual effects',
          body: 'Used generative AI for visual effects, including the creation of a complex building-collapse sequence, helping reduce production time and costs.',
        },
        {
          category: 'Digital de-aging',
          body: 'Used Vanity AI for digital de-aging, allowing characters to appear younger without extensive makeup or traditional VFX workflows.',
        },
        {
          category: 'De-aging and Age transformation',
          body: 'Used Metaphysic AI for de-aging and age transformation, enabling actors to portray their characters across multiple decades while maintaining the same cast.',
        },
        {
          category: 'Fully AI',
          body: 'Created entirely with Higgsfield Cinema Studio, enabling a single filmmaker to produce a 22-minute action-horror film in one week without a traditional production crew, significantly reducing production time, costs, and post-production requirements.',
        },
        {
          category: 'Fully AI',
          body: 'Created as a fully AI-generated feature film, using AI-generated visuals, characters, and voice transformations with a production budget of under $2,000.',
        },
      ],
    },
  },
  ru: {
    home: {
      tabs: {
        concept: 'Концепция',
        research: 'Исследование',
        visuals: 'Визуальные эксперименты',
      },
      aboutTabs: {
        Concept: [
          '<b>AI Cinema Lab</b> исследует, как искусственный интеллект, дипфейки и цифровые актеры меняют современное кино. Мы изучаем, как машинно созданные перформансы влияют на эмоцию, присутствие и подлинность на экране.',
          'Цель — повысить <b>медиаграмотность</b> и осознанность, помогая зрителям понять, как AI-перформансы влияют на восприятие и переопределяют само понятие “играть” в цифровую эпоху.',
        ],
        Research: [
          'Исследование сфокусировано на <b>восприятии аудитории</b>: как зрители эмоционально реагируют на AI-сгенерированных или цифрово замененных актеров. Чувствуют ли люди эмпатию к синтетическому лицу? Замечают ли манипуляцию? Как меняется доверие, когда исполнитель искусственный?',
          'Объединяя киноанализ, тестирование аудитории и AI-сгенерированные сцены, мы изучаем границы между реальностью, иллюзией и машинным присутствием в кино.',
        ],
        Visuals: [
          'Серия <b>визуальных экспериментов</b> показывает, как AI и дипфейк-технологии меняют кинематографический перформанс. Используя реальные кадры и синтетических двойников, мы анализируем изменения эмоции, тайминга и реакции зрителя.',
          'Визуальные материалы включают сравнения бок о бок, реконструкции кадров и короткие сцены, полностью созданные AI, раскрывая новую эстетику цифровой актерской игры.',
        ],
      },
      counters: [
        'Фильмы, использующие AI-перформансы или цифровых актеров',
        'Активные AI-инструменты для генерации видео и перформанса',
      ],
      focusCards: [
        {
          title: 'AI-сгенерированные актеры',
          body: 'Исследуем, как синтетические исполнители и цифровые двойники меняют актерскую игру, присутствие и эмоцию в современном кино.',
        },
        {
          title: 'Дипфейк-нарративы',
          body: 'Изучаем, как дипфейк-технологии трансформируют сторителлинг и ставят под вопрос авторство, правду и визуальную подлинность киноисторий.',
        },
        {
          title: 'Восприятие аудитории',
          body: 'Изучаем, как зрители эмоционально реагируют на AI-перформансы, задавая вопросы об эмпатии, распознавании и реализме в эпоху синтетического кино.',
        },
        {
          title: 'Этика и подлинность',
          body: 'Размышляем об этических последствиях и творческом праве в AI-кинопроизводстве, где личность, согласие и авторство становятся цифрово неоднозначными.',
        },
      ],
      featuredTitle: 'Избранное <br> <img src="assets/img/has.png" alt="img"> <span>AI в кино</span>',
      projects: [
        {
          label: '“The Irishman”, 2019',
          title: 'Омоложение через AI-технологии',
          body: 'Используя продвинутую нейронную реконструкцию, команда Скорсезе цифрово омолодила актеров без традиционного грима. Результат поднял вопросы памяти, идентичности и роли AI в сохранении кинематографической молодости.',
        },
        {
          label: '“Secret Invasion”, 2023',
          title: 'AI-сгенерированная вступительная заставка',
          body: 'Один из первых крупных студийных сериалов с полностью AI-сгенерированным интро. Он размыл границу между творческим сотрудничеством и этическим спором, заставив заново определить художественное авторство.',
        },
        {
          label: '“Rogue One: A Star Wars Story”, 2016',
          title: 'AI-воссоздание актера Питера Кушинга',
          body: 'Фильм цифрово вернул Питера Кушинга, умершего в 1994 году, восстановив его роль Гранд-моффа Таркина с помощью захвата мимики, CGI-моделирования и машинного синтеза текстур. Этот пример AI поставил вопрос о границе между цифровым перформансом и человеческим наследием.',
        },
      ],
      faq: {
        eyebrow: 'AI в кино',
        title: 'Ключевые <b>вопросы</b> и этические размышления',
        description: 'Искусственный интеллект меняет то, как мы воспринимаем перформанс, подлинность и эмоцию на экране. Эти вопросы помогают задуматься о будущем кинематографического сторителлинга.',
        items: [
          {
            question: 'Может ли AI по-настоящему заменить реальных актеров?',
            answer: 'AI-сгенерированные лица могут имитировать выражение и тон, но не обладают эмоциональным намерением. Вопрос не в имитации, а в том, может ли существовать эмпатия без человеческой души за изображением.',
          },
          {
            question: 'Кому принадлежит цифровой образ актера?',
            answer: 'Когда студии возвращают умерших исполнителей или воссоздают живых, право собственности становится размытым. Граница между творческой данью и этической эксплуатацией зависит от согласия, контрактов и наследия.',
          },
          {
            question: 'Можно ли все еще доверять тому, что мы видим на экране?',
            answer: 'Дипфейки и AI-визуалы размывают границу между вымыслом и документальностью. Зрителю теперь нужна визуальная грамотность — умение задавать вопросы, анализировать и проверять движущиеся изображения.',
          },
          {
            question: 'Уменьшает ли AI-creative ценность человеческого искусства?',
            answer: 'Многие считают, что AI лишь расширяет палитру художника, превращая воображение в пиксели. Но когда алгоритмы учатся на бесчисленных человеческих работах, авторство становится коллективным, а не индивидуальным.',
          },
          {
            question: 'Что происходит, когда AI переживает своего создателя?',
            answer: 'Когда AI-перформансы продолжаются после смерти автора, кино становится архивом памяти. Граница между памятью и симуляцией истончается, заставляя нас заново определить присутствие и наследие.',
          },
        ],
      },
      quote: '“Граница между реальностью и иллюзией никогда не была такой тонкой”',
      tools: {
        eyebrow: 'Обзор AI-инструментов',
        title: 'Инструменты за <span>AI-кинематографом</span>',
        items: [
          '<b>Runway ML</b> — один из самых распространенных AI-инструментов в киноиндустрии. Он позволяет создавать кинематографические сцены, плавные движения камеры и реалистичные VFX через машинное обучение без тяжелого постпродакшена.',
          '<b>Kaiber AI</b> — превращает статичные изображения и идеи в движущиеся кинематографические последовательности. Его используют режиссеры и художники для музыкальных видео, сюрреалистичных motion studies и сюжетных AI-анимаций.',
          '<b>Synthesia</b> — создает цифровых актеров и реалистичные речевые перформансы. Ее используют для AI-диалогов персонажей и эмоциональных взаимодействий, соединяя этику и сторителлинг.',
          '<b>Sora</b> — модель OpenAI нового поколения для генерации видео из текста. Она может создавать полноценные кинематографические сцены из prompt и размывает границу между режиссурой, перформансом и машинным творчеством.',
        ],
      },
      message: {
        title: 'Исследуйте будущее кино <span><b>с AI</b></span>',
        cta: 'Обсудить',
        body: 'Искусственный интеллект меняет перформанс и сторителлинг. Наше <b>AI Community</b> — творческое пространство для режиссеров, художников и всех любопытных, где можно делиться новостями об AI, идеями, учиться и исследовать, как AI меняет язык кино.',
      },
    },
    about: {
      intro: [
        'Мы студентки медиа-технологий в Astana IT University, объединенные интересом к визуальному сторителлингу и кино. В будущей карьере Ainissa мечтает работать <strong>монтажером</strong>, создавая ритм и эмоцию через монтаж, а Zhaniya хочет стать <strong>оператором-постановщиком</strong>, передавая смысл через свет и движение.',
        'Быстрый рост <strong>искусственного интеллекта</strong> меняет то, как фильмы создаются и воспринимаются. Технологии, которые раньше казались научной фантастикой, теперь монтируют, генерируют и даже выступают рядом с людьми. Это поднимает глубокие этические и художественные вопросы: <em>Может ли AI действительно создавать эмоцию? Можем ли мы доверять тому, что видим на экране?</em>',
        'В социальных сетях каждый день появляются миллионы AI-клипов. Под каждым постом снова и снова повторяется один вопрос — <em>“Это реальность или AI?”</em> Люди начинают сомневаться в собственном восприятии. Этот вопрос вдохновил нас создать <strong>AI Cinema Lab</strong> — пространство, где искусство, этика и технологии встречаются, чтобы исследовать доверие и правду в визуальном сторителлинге.',
      ],
      quiz: 'Пройти квиз',
      tabs: {
        mission: 'Наша миссия',
        vision: 'Наше видение',
        values: 'Ценности',
      },
      mission: {
        body: 'Наша миссия — изучать и визуализировать, как AI меняет создание и восприятие фильмов. Мы хотим повысить осознанность о новых границах между подлинностью и симуляцией и напомнить, что даже в цифровом мире <strong>эмоция остается человеческой</strong>.',
        items: [
          'Изучать влияние AI на кинопрофессии',
          'Размышлять о правде и восприятии в кино',
          'Соединять творчество, этику и технологии',
        ],
      },
      vision: {
        body: 'Мы видим будущее, где <strong>AI и люди сотрудничают</strong>, а технология становится не заменой творчества, а его расширением.',
      },
      values: {
        body: 'В AI Cinema Lab мы верим в прозрачность, эмпатию и творческую смелость. Технология должна усиливать человеческое воображение, а не стирать его.',
        items: ['Творчество с ответственностью', 'Любопытство и эксперименты', 'Этичный сторителлинг'],
      },
    },
    cases: {
      cards: [
        {
          category: 'Эстетика мультивселенной',
          body: 'Daniels использовали AI-инструменты монтажа, чтобы соединить разные вселенные и лица. Фильм визуально передает фрагментированную логику цифровой идентичности — хаотичную, но глубоко человеческую.',
        },
        {
          category: 'AI-захват перформанса',
          body: 'Нейросети обучались предсказывать движения лицевых мышц актеров под водой, объединяя человеческий перформанс и AI для создания цельного эмоционального реализма. “AI и deep learning становятся частью киноремесла. Мы используем их не для замены актеров, а чтобы раскрыть больше правды в их игре.” - James Cameron',
        },
        {
          category: 'AI-этика и визуальный реализм',
          body: 'Gareth Edwards объединил реальные съемки с AI compositing tools, чтобы создать футуристические ландшафты. Фильм исследует сосуществование искусственной и органической жизни — на экране и за его пределами.',
        },
        {
          category: 'AI-реконструкция лица',
          body: 'AI омолодил Harrison Ford, анализируя десятилетия архивных кадров. Это соединение памяти и данных создало версию актера, которая никогда по-настоящему не существовала — только была “вспомнена” алгоритмами.',
        },
        {
          category: 'Generative AI for visual effects',
          body: 'Used generative AI for visual effects, including the creation of a complex building-collapse sequence, helping reduce production time and costs.',
        },
        {
          category: 'Digital de-aging',
          body: 'Used Vanity AI for digital de-aging, allowing characters to appear younger without extensive makeup or traditional VFX workflows.',
        },
        {
          category: 'De-aging and Age transformation',
          body: 'Used Metaphysic AI for de-aging and age transformation, enabling actors to portray their characters across multiple decades while maintaining the same cast.',
        },
        {
          category: 'Fully AI',
          body: 'Created entirely with Higgsfield Cinema Studio, enabling a single filmmaker to produce a 22-minute action-horror film in one week without a traditional production crew, significantly reducing production time, costs, and post-production requirements.',
        },
        {
          category: 'Fully AI',
          body: 'Created as a fully AI-generated feature film, using AI-generated visuals, characters, and voice transformations with a production budget of under $2,000.',
        },
      ],
    },
  },
};

export function getLegacyCopy(language: string): LegacyCopy {
  const normalizedLanguage = language.split('-')[0] as SupportedLanguage;

  if (supportedLanguages.includes(normalizedLanguage)) {
    return legacyCopyByLanguage[normalizedLanguage];
  }

  return legacyCopyByLanguage.en;
}
