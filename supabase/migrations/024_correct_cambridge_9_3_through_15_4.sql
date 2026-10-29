-- Repair 26 Cambridge Academic Reading tests against the source URLs in this manifest.
-- Preserve test, section and question IDs; previous attempts remain unchanged.
begin;
do $repair$
declare
  exam_data jsonb;
  section_data jsonb;
  group_data jsonb;
  question_data jsonb;
  exam_id uuid;
  section_id_value uuid;
  group_id_value uuid;
  group_order integer;
  question_order integer;
  affected integer;
begin
  for exam_data in select value from jsonb_array_elements($data$[
  {
    "slug": "cam-9-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-09-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "Attitudes to language",
        "contentHtml": "<h2>Attitudes to language</h2><p>It is not easy to be systematic and objective about language study. Popular linguistic debate regularly deteriorates into invective and polemic. Language belongs to everyone, so most people feel they have a right to hold an opinion about it. And when opinions differ, emotions can run high. Arguments can start as easily over minor points of usage as over major policies of linguistic education.</p><p>Language, moreover, is a very public behaviour, so it is easy for different usages to be noted and criticised. No part of society or social behaviour is exempt: linguistic factors influence how we judge personality, intelligence, social status, educational standards, job aptitude, and many other areas of identity and social survival. As a result, it is easy to hurt, and to be hurt, when language use is unfeelingly attacked.</p><p>In its most general sense, prescriptivism is the view that one variety of language has an inherently higher value than others, and that this ought to be imposed on the whole of the speech community. The view is propounded especially in relation to grammar and vocabulary, and frequently with reference to pronunciation.</p><p>The variety which is favoured, in this account, is usually a version of the ‘standard’ written language, especially as encountered in literature, or in the formal spoken language which most closely reflects this style. Adherents to this variety are said to speak or write ‘correctly’; deviations from it are said to be ‘incorrect’.</p><p>All the main languages have been studied prescriptively, especially in the 18th century approach to the writing of grammars and dictionaries. The aims of these early grammarians were threefold: (a) they wanted to codify the principles of their languages, to show that there was a system beneath the apparent chaos of usage, (b) they wanted a means of settling disputes over usage, and (c) they wanted to point out what they felt to be common errors, in order to ‘improve’ the language.</p><p>The authoritarian nature of the approach is best characterised by its reliance on ‘rules’ of grammar. Some usages are ‘prescribed’, to be learnt and followed accurately; others are ‘proscribed’, to be avoided. In this early period, there were no half-measures: usage was either right or wrong, and it was the task of the grammarian not simply to record alternatives, but to pronounce judgement upon them.</p><p>These attitudes are still with us, and they motivate a widespread concern that linguistic standards should be maintained. Nevertheless, there is an alternative point of view that is concerned less with standards than with the facts of linguistic usage. This approach is summarised in the statement that it is the task of the grammarian to describe, not prescribe - to record the facts of linguistic diversity, and not to attempt the impossible tasks of evaluating language variation or halting language change.</p><p>In the second half of the 18th century, we already find advocates of this view, such as Joseph Priestley, whose Rudiments of English Grammar (1761) insists that ‘the custom of speaking is the original and only just standard of any language’. Linguistic issues, it is argued, cannot be solved by logic and legislation. And this view has become the tenet of the modern linguistic approach to grammatical analysis.</p><p>In our own time, the opposition between ‘descriptivists’ and ‘prescriptivists’ has often become extreme, with both sides painting unreal pictures of the other. Descriptive grammarians have been presented as people who do not care about standards, because of the way they see all forms of usage as equally valid. Prescriptive grammarians have been presented as blind adherents to a historical tradition.</p><p>The opposition has even been presented in quasi-political terms - of radical liberalism vs elitist conservatism.</p>"
      },
      {
        "section": 2,
        "title": "Tidal Power",
        "contentHtml": "<h2>Tidal Power</h2><p>Undersea turbines which produce electricity from the tides are set to become an important source of renewable energy for Britain. It is still too early to predict the extent of the impact they may have, but all the signs are that they will play a significant role in the future</p><p><strong>A</strong> Operating on the same principle as wind turbines, the power in sea turbines comes from tidal currents which turn blades similar to ships' propellers, but, unlike wind, the tides are predictable and the power input is constant. The technology raises the prospect of Britain becoming self-sufficient in renewable energy and drastically reducing its carbon dioxide emissions.</p><p>If tide, wind and wave power are all developed, Britain would be able to close gas, coal and nuclear power plants and export renewable power to other parts of Europe. Unlike wind power, which Britain originally developed and then abandoned for 20 years allowing the Dutch to make it a major industry, undersea turbines could become a big export earner to island nations such as Japan and New Zealand.</p><p><strong>B</strong> Tidal sites have already been identified that will produce one sixth or more of the UK's power - and at prices competitive with modern gas turbines and undercutting those of the already ailing nuclear industry.</p><p>One site alone, the Pentland Firth, between Orkney and mainland Scotland, could produce 10% of the country's electricity with banks of turbines under the sea, and another at Alderney in the Channel Islands three times the 1,200 megawatts of Britain's largest and newest nuclear plant, Sizewell B, in Suffolk. Other sites identified include the Bristol Channel and the west coast of Scotland, particularly the channel between Campbeltown and Northern Ireland.</p><p><strong>C</strong> Work on designs for the new turbine blades and sites are well advanced at the University of Southampton's sustainable energy research group. The first station is expected to be installed off Lynmouth in Devon shortly to test the technology in a venture jointly funded by the department of Trade and Industry and the European Union.</p><p>AbuBakr Bahaj, in charge of the Southampton research, said: 'The prospects for energy from tidal currents are far better than from wind because the flows of water are predictable and constant. The technology for dealing with the hostile saline environment under the sea has been developed in the North Sea oil industry and much is already known about turbine blade design, because of wind power and ship propellers.</p><p>There are a few technical difficulties, but I believe in the next five to ten years we will be installing commercial marine turbine farms.' Southampton has been awarded £215,000 over three years to develop the turbines and is working with Marine Current Turbines, a subsidiary of IT power, on the Lynmouth project. EU research has now identified 106 potential sites for tidal power, 80% round the coasts of Britain.</p><p>The best sites are between islands or around heavily indented coasts where there are strong tidal currents.</p><p><strong>D</strong> A marine turbine blade needs to be only one third of the size of a wind generator to produce three times as much power. The blades will be about 20 metres in diameter, so around 30 metres of water is required. Unlike wind power, there are unlikely to be environmental objections. Fish and other creatures are thought unlikely to be at risk from the relatively slow-turning blades. Each turbine will be mounted on a tower which will connect to the national power supply grid via underwater cables.</p><p>The towers will stick out of the water and be lit, to warn shipping, and also be designed to be lifted out of the water for maintenance and to clean seaweed from the blades.</p><p><strong>E</strong> Dr Bahaj has done most work on the Alderney site, where there are powerful currents. The single undersea turbine farm would produce far more power than needed for the Channel Islands and most would be fed into the French Grid and be re-imported into Britain via the cable under the Channel.</p><p><strong>F</strong> One technical difficulty is cavitation, where low pressure behind a turning blade causes air bubbles. These can cause vibration and damage the blades of the turbines. Dr Bahaj said: 'We have to test a number of blade types to avoid this happening or at least make sure it does not damage the turbines or reduce performance. Another slight concern is submerged debris floating into the blades. So far we do not know how much of a problem it might be.</p><p>We will have to make the turbines robust because the sea is a hostile environment, but all the signs that we can do it are good.'</p>"
      },
      {
        "section": 3,
        "title": "Information theory – the big idea",
        "contentHtml": "<h2>Information theory – the big idea</h2><p>Information theory lies at the heart of everything – from DVD players and the genetic code of DNA to the physics of the universe at its most fundamental. It has been central to the development of the science of communication, which enables data to be sent electronically and has therefore had a major impact on our lives</p><p><strong>A</strong> In April 2002 an event took place which demonstrated one of the many applications of information theory. The space probe, Voyager 1, launched in 1977, had sent back spectacular images of Jupiter and Saturn and then soared out of the Solar System on a one-way mission to the stars. After 25 years of exposure to the freezing temperatures of deep space, the probe was beginning to show its age.</p><p>Sensors and circuits were on the brink of failing and NASA experts realised that they had to do something or lose contact with their probe forever. The solution was to get a message to Voyager 1 to instruct it to use spares to change the failing parts. With the probe 12 billion kilometres from Earth, this was not an easy task. By means of a radio dish belonging to NASA’s Deep Space Network, the message was sent out into the depths of space.</p><p>Even travelling at the speed of light, it took over 11 hours to reach its target, far beyond the orbit of Pluto. Yet, incredibly, the little probe managed to hear the faint call from its home planet, and successfully made the switchover.</p><p><strong>B</strong> It was the longest-distance repair job in history, and a triumph for the NASA engineers. But it also highlighted the astonishing power of the techniques developed by American communications engineer Claude Shannon, who had died just a year earlier. Born in 1916 in Petoskey, Michigan, Shannon showed an early talent for maths and for building gadgets, and made breakthroughs in the foundations of computer technology when still a student.</p><p>While at Bell Laboratories, Shannon developed information theory, but shunned the resulting acclaim. In the 1940s, he single-handedly created an entire science of communication which has since inveigled its way into a host of applications, from DVDs to satellite communications to bar codes - any area, in short, where data has to be conveyed rapidly yet accurately.</p><p><strong>C</strong> This all seems light years away from the down-to-earth uses Shannon originally had for his work, which began when he was a 22-year-old graduate engineering student at the prestigious Massachusetts Institute of Technology in 1939. He set out with an apparently simple aim: to pin down the precise meaning of the concept of ‘information’. The most basic form of information, Shannon argued, is whether something is true or false - which can be captured in the binary unit, or ‘bit’, of the form 1 or 0.</p><p>Having identified this fundamental unit, Shannon set about defining otherwise vague ideas about information and how to transmit it from place to place. In the process he discovered something surprising: it is always possible to guarantee information will get through random interference - ‘noise’ - intact.</p><p><strong>D</strong> Noise usually means unwanted sounds which interfere with genuine information. Information theory generalises this idea via theorems that capture the effects of noise with mathematical precision. In particular, Shannon showed that noise sets a limit on the rate at which information can pass along communication channels while remaining error-free. This rate depends on the relative strengths of the signal and noise travelling down the communication channel, and on its capacity (its ‘bandwidth’).</p><p>The resulting limit, given in units of bits per second, is the absolute maximum rate of error-free communication given signal strength and noise level. The trick, Shannon showed, is to find ways of packaging up - ‘coding’ - information to cope with the ravages of noise, while staying within the information-carrying capacity - ‘bandwidth’ - of the communication system being used.</p><p><strong>E</strong> Over the years scientists have devised many such coding methods, and they have proved crucial in many technological feats. The Voyager spacecraft transmitted data using codes which added one extra bit for every single bit of information; the result was an error rate of just one bit in 10,000 - and stunningly clear pictures of the planets.</p><p>Other codes have become part of everyday life - such as the Universal Product Code, or bar code, which uses a simple error-detecting system that ensures supermarket check-out lasers can read the price even on, say, a crumpled bag of crisps. As recently as 1993, engineers made a major breakthrough by discovering so-called turbo codes - which come very close to Shannon’s ultimate limit for the maximum rate that data can be transmitted reliably, and now play a key role in the mobile videophone revolution.</p><p><strong>F</strong> Shannon also laid the foundations of more efficient ways of storing information, by stripping out superfluous (‘redundant’) bits from data which contributed little real information. As mobile phone text messages like ‘I CN C U’ show, it is often possible to leave out a lot of data without losing much meaning. As with error correction, however, there’s a limit beyond which messages become too ambiguous.</p><p>Shannon showed how to calculate this limit, opening the way to the design of compression methods that cram maximum information into the minimum space.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 8,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 1–8</h3><p>Do the following statements agree with the claims of the writer in Reading Passage 1?</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "There are understandable reasons why arguments occur about language.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "People feel more strongly about language education than about small differences in language usage.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Our assessment of a person’s intelligence is affected by the way he or she uses language.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Prescriptive grammar books cost a lot of money to buy in the 18th century.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Prescriptivism still exists today.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "According to descriptivists it is pointless to try to stop language change.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "Descriptivism only appeared after the 18th century.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Both descriptivists and prescriptivists have been misrepresented.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 12,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 9–12</h3><p>Complete the summary using the list of words, A-I, below.</p>",
        "config": {
          "phraseOptions": [
            "descriptivists",
            "language experts",
            "popular speech",
            "formal language",
            "evaluation",
            "rules",
            "modern linguists",
            "prescriptivists",
            "change"
          ]
        },
        "questionHtml": "<p>The language debate</p><p>According to 9_______ , there is only one correct form of language. Linguists who take this approach to language place great importance on grammatical 10_______ .</p><p>Conversely, the view of 11_______ , such as Joseph Priestley, is that grammar should be based on 12_______ .</p>",
        "questions": [
          {
            "number": 9,
            "prompt": "According to 9_______ , there is only one correct form of language. Linguists who take this approach to language place great importance on grammatical 10_______ .",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "According to 9_______ , there is only one correct form of language. Linguists who take this approach to language place great importance on grammatical 10_______ .",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Conversely, the view of 11_______ , such as Joseph Priestley, is that grammar should be based on 12_______ .",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Conversely, the view of 11_______ , such as Joseph Priestley, is that grammar should be based on 12_______ .",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 13,
        "to": 13,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 13</h3><p>Choose the correct letter, A, B, C or D.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 13,
            "prompt": "What is the writer's purpose in Reading Passage 1?",
            "options": [
              "to argue in favour of a particular approach to writing dictionaries and grammar books",
              "to present a historical account of differing views of language",
              "to describe the differences between spoken and written language",
              "to show how a certain view of language has been discredited"
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 17,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–17</h3><p>Reading Passage 2 has six paragraphs, A-F.</p><p>Which paragraph contains the following information?</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "the location of the first test site",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "a way of bringing the power produced on one site back into Britain",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "a reference to a previous attempt by Britain to find an alternative source of energy",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "mention of the possibility of applying technology from another industry",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 18,
        "to": 22,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 18–22</h3><p>Choose FIVE letters, A-J.</p>",
        "config": {
          "answerSlots": 5
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 18,
            "prompt": "Which FIVE of the following claims about tidal power are made by the writer?",
            "options": [
              "It is a more reliable source of energy than wind power.",
              "It would replace all other forms of energy in Britain.",
              "Its introduction has come as a result of public pressure.",
              "It could contribute to the closure of many existing power stations in Britain.",
              "It would cut down on air pollution.",
              "It could be a means of increasing national income.",
              "It could face a lot of resistance from other fuel industries.",
              "It could be sold more cheaply than any other type of fuel.",
              "It could compensate for the shortage of inland sites for energy production.",
              "It is best produced in the vicinity of coastlines with particular features."
            ],
            "answerKey": "A",
            "acceptedAnswers": [
              "D",
              "E",
              "F",
              "J"
            ]
          },
          {
            "number": 19,
            "prompt": "Which FIVE of the following claims about tidal power are made by the writer?",
            "options": [
              "It is a more reliable source of energy than wind power.",
              "It would replace all other forms of energy in Britain.",
              "Its introduction has come as a result of public pressure.",
              "It could contribute to the closure of many existing power stations in Britain.",
              "It would cut down on air pollution.",
              "It could be a means of increasing national income.",
              "It could face a lot of resistance from other fuel industries.",
              "It could be sold more cheaply than any other type of fuel.",
              "It could compensate for the shortage of inland sites for energy production.",
              "It is best produced in the vicinity of coastlines with particular features."
            ],
            "answerKey": "D",
            "acceptedAnswers": [
              "A",
              "E",
              "F",
              "J"
            ]
          },
          {
            "number": 20,
            "prompt": "Which FIVE of the following claims about tidal power are made by the writer?",
            "options": [
              "It is a more reliable source of energy than wind power.",
              "It would replace all other forms of energy in Britain.",
              "Its introduction has come as a result of public pressure.",
              "It could contribute to the closure of many existing power stations in Britain.",
              "It would cut down on air pollution.",
              "It could be a means of increasing national income.",
              "It could face a lot of resistance from other fuel industries.",
              "It could be sold more cheaply than any other type of fuel.",
              "It could compensate for the shortage of inland sites for energy production.",
              "It is best produced in the vicinity of coastlines with particular features."
            ],
            "answerKey": "E",
            "acceptedAnswers": [
              "A",
              "D",
              "F",
              "J"
            ]
          },
          {
            "number": 21,
            "prompt": "Which FIVE of the following claims about tidal power are made by the writer?",
            "options": [
              "It is a more reliable source of energy than wind power.",
              "It would replace all other forms of energy in Britain.",
              "Its introduction has come as a result of public pressure.",
              "It could contribute to the closure of many existing power stations in Britain.",
              "It would cut down on air pollution.",
              "It could be a means of increasing national income.",
              "It could face a lot of resistance from other fuel industries.",
              "It could be sold more cheaply than any other type of fuel.",
              "It could compensate for the shortage of inland sites for energy production.",
              "It is best produced in the vicinity of coastlines with particular features."
            ],
            "answerKey": "F",
            "acceptedAnswers": [
              "A",
              "D",
              "E",
              "J"
            ]
          },
          {
            "number": 22,
            "prompt": "Which FIVE of the following claims about tidal power are made by the writer?",
            "options": [
              "It is a more reliable source of energy than wind power.",
              "It would replace all other forms of energy in Britain.",
              "Its introduction has come as a result of public pressure.",
              "It could contribute to the closure of many existing power stations in Britain.",
              "It would cut down on air pollution.",
              "It could be a means of increasing national income.",
              "It could face a lot of resistance from other fuel industries.",
              "It could be sold more cheaply than any other type of fuel.",
              "It could compensate for the shortage of inland sites for energy production.",
              "It is best produced in the vicinity of coastlines with particular features."
            ],
            "answerKey": "J",
            "acceptedAnswers": [
              "A",
              "D",
              "E",
              "F"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 26,
        "type": "fill",
        "displayType": "fill-blank",
        "instructionHtml": "<h3>Questions 23–26</h3><p>Label the diagram below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p>",
        "config": {},
        "questionHtml": "<p><img src=\"https://www.ielts-mentor.com/wp-content/uploads/2013/12/reading-passage55-an-undersea-turbine.png\" alt=\"An undersea turbine, questions 23–26\" /></p><p>23_______</p><p>24_______</p><p>25_______</p><p>26_______</p>",
        "questions": [
          {
            "number": 23,
            "prompt": "The whole tower can be raised for what and for the extraction of seaweed from the blades?",
            "options": [],
            "answerKey": "maintenance",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "Sea life is not in danger due to the fact that blades are comparatively what?",
            "options": [],
            "answerKey": "slow turning",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "Air bubbles result from the what behind the blades?",
            "options": [],
            "answerKey": "low pressure",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "What is this phenomenon known as?",
            "options": [],
            "answerKey": "cavitation",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 32,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 27–32</h3><p>Reading Passage 3 has six paragraphs, A-F.</p><p>Which paragraph contains the following information?</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "an explanation of the factors affecting the transmission of information",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "an example of how unnecessary information can be omitted",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "a reference to Shannon’s attitude to fame",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "details of a machine capable of interpreting incomplete information",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "a detailed account of an incident involving information theory",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "a reference to what Shannon initially intended to achieve in his research",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 33,
        "to": 37,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 33–37</h3><p>Complete the notes below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p>",
        "config": {},
        "questionHtml": "<p>The Voyager 1 Space Probe</p><p>• The probe transmitted pictures of both 33_______  and Saturn, then left the 34_______ .</p><p>• The freezing temperatures were found to have a negative effect on parts of the space probe.</p><p>• Scientists feared that both the sensors and 35_______  were about to stop working.</p><p>• The only hope was to tell the probe to replace them with 36_______  - but distance made communication with the probe difficult.</p><p>• A 37_______  was used to transmit the message at the speed of light.</p><p>• The message was picked up by the probe and the switchover took place.</p>",
        "questions": [
          {
            "number": 33,
            "prompt": "* The probe transmitted pictures of both 33_______  and Saturn, then left the 34_______ .",
            "options": [],
            "answerKey": "Jupiter",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "* The probe transmitted pictures of both 33_______  and Saturn, then left the 34_______ .",
            "options": [],
            "answerKey": "Solar System",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "* Scientists feared that both the sensors and 35_______  were about to stop working.",
            "options": [],
            "answerKey": "circuits",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "* The only hope was to tell the probe to replace them with 36_______  - but distance made communication with the probe difficult.",
            "options": [],
            "answerKey": "spares",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "* A 37_______  was used to transmit the message at the speed of light.",
            "options": [],
            "answerKey": "radio dish",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 38,
        "to": 40,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 38–40</h3><p>Do the following statements agree with the information given in Reading Passage 3?</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 38,
            "prompt": "The concept of describing something as true or false was the starting point for Shannon in his attempts to send messages over distances.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "The amount of information that can be sent in a given time period is determined with reference to the signal strength and noise level.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Products have now been developed which can convey more information than Shannon had anticipated as possible.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-9-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-09-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "The life and work of Marie Curie",
        "contentHtml": "<h2>The life and work of Marie Curie</h2><p>Marie Curie is probably the most famous woman scientist who has ever lived. Born Maria Sklodowska in Poland in 1867, she is famous for her work on radioactivity, and was twice a winner of the Nobel Prize. With her husband, Pierre Curie, and Henri Becquerel, she was awarded the 1903 Nobel Prize for Physics, and was then sole winner of the 1911 Nobel Prize for Chemistry. She was the first woman to win a Nobel Prize.</p><p>From childhood, Marie was remarkable for her prodigious memory, and at the age of 16 won a gold medal on completion of her secondary education. Because her father lost his savings through bad investment, she then had to take work as a teacher. From her earnings she was able to finance her sister Bronia's medical studies in Paris, on the understanding that Bronia would, in turn, later help her to get an education.</p><p>In 1891 this promise was fulfilled and Marie went to Paris and began to study at the Sorbonne (the University of Paris). She often worked far into the night and lived on little more than bread and butter and tea. She came first in the examination in the physical sciences in 1893, and in 1894 was placed second in the examination in mathematical sciences. It was not until the spring of that year that she was introduced to Pierre Curie.</p><p>Their marriage in 1895 marked the start of a partnership that was soon to achieve results of world significance. Following Henri Becquerel's discovery in 1896 of a new phenomenon, which Marie later called 'radioactivity', Marie Curie decided to find out if the radioactivity discovered in uranium was to be found in other elements. She discovered that this was true for thorium.</p><p>Turning her attention to minerals, she found her interest drawn to pitchblende, a mineral whose radioactivity, superior to that of pure uranium, could be explained only by the presence in the ore of small quantities of an unknown substance of very high activity. Pierre Curie joined her in the work that she had undertaken to resolve this problem, and that led to the discovery of the new elements, polonium and radium.</p><p>While Pierre Curie devoted himself chiefly to the physical study of the new radiations, Marie Curie struggled to obtain pure radium in the metallic state. This was achieved with the help of the chemist André-Louis Debierne, one of Pierre Curie's pupils. Based on the results of this research, Marie Curie received her Doctorate of Science, and in 1903 Marie and Pierre shared with Becquerel the Nobel Prize for Physics for the discovery of radioactivity.</p><p>The births of Marie's two daughters, Irène and Eve, in 1897 and 1904 failed to interrupt her scientific work. She was appointed lecturer in physics at the École Normale Supérieure for girls in Sèvres, France (1900), and introduced a method of teaching based on experimental demonstrations. In December 1904 she was appointed chief assistant in the laboratory directed by Pierre Curie.</p><p>The sudden death of her husband in 1906 was a bitter blow to Marie Curie, but was also a turning point in her career: henceforth she was to devote all her energy to completing alone the scientific work that they had undertaken. On May 13, 1906, she was appointed to the professorship that had been left vacant on her husband's death, becoming the first woman to teach at the Sorbonne. In 1911 she was awarded the Nobel Prize for Chemistry for the isolation of a pure form of radium.</p><p>During World War I, Marie Curie, with the help of her daughter Irène, devoted herself to the development of the use of X-radiography, including the mobile units which came to be known as 'Little Curies', used for the treatment of wounded soldiers. In 1918 the Radium Institute, whose staff Irène had joined, began to operate in earnest, and became a centre for nuclear physics and chemistry.</p><p>Marie Curie, now at the highest point of her fame and, from 1922, a member of the Academy of Medicine, researched the chemistry of radioactive substances and their medical applications.</p><p>In 1921, accompanied by her two daughters, Marie Curie made a triumphant journey to the United States to raise funds for research on radium. Women there presented her with a gram of radium for her campaign. Marie also gave lectures in Belgium, Brazil, Spain and Czechoslovakia and, in addition, had the satisfaction of seeing the development of the Curie Foundation in Paris, and the inauguration in 1932 in Warsaw of the Radium Institute, where her sister Bronia became director.</p><p>One of Marie Curie's outstanding achievements was to have understood the need to accumulate intense radioactive sources, not only to treat illness but also to maintain an abundant supply for research. The existence in Paris at the Radium Institute of a stock of 1.5 grams of radium made a decisive contribution to the success of the experiments undertaken in the years around 1930.</p><p>This work prepared the way for the discovery of the neutron by Sir James Chadwick and, above all, for the discovery in 1934 by Irène and Frédéric Joliot-Curie of artificial radioactivity. A few months after this discovery, Marie Curie died as a result of leukaemia caused by exposure to radiation. She had often carried test tubes containing radioactive isotopes in her pocket, remarking on the pretty blue-green light they gave off.</p><p>Her contribution to physics had been immense, not only in her own work, the importance of which had been demonstrated by her two Nobel Prizes, but because of her influence on subsequent generations of nuclear physicists and chemists.</p>"
      },
      {
        "section": 2,
        "title": "Young children's sense of identity",
        "contentHtml": "<h2>Young children's sense of identity</h2><p><strong>A</strong> A sense of self develops in young children by degrees. The process can usefully be thought of in terms of the gradual emergence of two somewhat separate features: the self as a subject, and the self as an object. William James introduced the distinction in 1892, and contemporaries of his, such as Charles Cooley, added to the developing debate. Ever since then psychologists have continued building on the theory.</p><p><strong>B</strong> According to James, a child's first step on the road to self-understanding can be seen as the recognition that he or she exists. This is an aspect of the self that he labelled 'self-as-subject', and he gave it various elements. These included an awareness of one's own agency (i.e. one's power to act), and an awareness of one's distinctiveness from other people. These features gradually emerge as infants explore their world and interact with caregivers.</p><p>Cooley (1902) suggested that a sense of the self-as-subject was primarily concerned with being able to exercise power. He proposed that the earliest examples of this are an infant's attempts to control physical objects, such as toys or his or her own limbs. This is followed by attempts to affect the behaviour of other people. For example, infants learn that when they cry or smile someone responds to them.</p><p><strong>C</strong> Another powerful source of information for infants about the effects they can have on the world around them is provided when others mimic them. Many parents spend a lot of time, particularly in the early months, copying their infant's vocalizations and expressions. In addition, young children enjoy looking in mirrors, where the movements they can see are dependent upon their own movements. This is not to say that infants recognize the reflection as their own image (a later development).</p><p>However, Lewis and Brooks-Gunn (1979) suggest that infants' developing understanding that the movements they see in the mirror are contingent on their own, leads to a growing awareness that they are distinct from other people. This is because they, and only they, can change the reflection in the mirror.</p><p><strong>D</strong> This understanding that children gain of themselves as active agents continues to develop in their attempts to co-operate with others in play. Dunn (1988) points out that it is in such day-to-day relationships and interactions that the child's understanding of his- or herself emerges.</p><p>Empirical investigations of the self-as-subject in young children are, however, rather scarce because of difficulties of communication: even if young infants can reflect on their experience, they certainly cannot express this aspect of the self directly.</p><p><strong>E</strong> Once children have acquired a certain level of self-awareness, they begin to place themselves in a whole series of categories, which together play such an important part in defining them uniquely as 'themselves'. This second step in the development of a full sense of self is what James called the 'self-as-object'.</p><p>This has been seen by many to be the aspect of the self which is most influenced by social elements, since it is made up of social roles (such as student, brother, colleague) and characteristics which derive their meaning from comparison or interaction with other people (such as trustworthiness, shyness, sporting ability).</p><p><strong>F</strong> Cooley and other researchers suggested a close connection between a person's own understanding of their identity and other people's understanding of it. Cooley believed that people build up their sense of identity from the reactions of others to them, and from the view they believe others have of them. He called the self-as-object the 'looking-glass self', since people come to see themselves as they are reflected in others.</p><p>Mead (1934) went even further, and saw the self and the social world as inextricably bound together: 'The self is essentially a social structure, and it arises in social experience ... it is impossible to conceive of a self arising outside of social experience.'</p><p><strong>G</strong> Lewis and Brooks-Gunn argued that an important developmental milestone is reached when children become able to recognize themselves visually without the support of seeing contingent movement. This recognition occurs around their second birthday. In one experiment, Lewis and Brooks-Gunn (1979) dabbed some red powder on the noses of children who were playing in front of a mirror, and then observed how often they touched their noses.</p><p>The psychologists reasoned that if the children knew what they usually looked like, they would be surprised by the unusual red mark and would start touching it. On the other hand, they found that children of 15 to 18 months are generally not able to recognize themselves unless other cues such as movement are present.</p><p><strong>H</strong> Finally, perhaps the most graphic expressions of self-awareness in general can be seen in the displays of rage which are most common from 18 months to 3 years of age. In a longitudinal study of groups of three or four children, Bronson (1975) found that the intensity of the frustration and anger in their disagreements increased sharply between the ages of 1 and 2 years.</p><p>Often, the children's disagreements involved a struggle over a toy that none of them had played with before or after the tug-of-war: the children seemed to be disputing ownership rather than wanting to play with it. Although it may be less marked in other societies, the link between the sense of 'self' and of 'ownership' is a notable feature of childhood in Western societies.</p>"
      },
      {
        "section": 3,
        "title": "The Development of Museums",
        "contentHtml": "<h2>The Development of Museums</h2><p><strong>A</strong> The conviction that historical relics provide infallible testimony about the past is rooted in the nineteenth and early twentieth centuries, when science was regarded as objective and value free. As one writer observes: 'Although it is now evident that artefacts are as easily altered as chronicles, public faith in their veracity endures: a tangible relic seems ipso facto real.' Such conviction was, until recently, reflected in museum displays.</p><p>Museums used to look – and some still do – much like storage rooms of objects packed together in showcases: good for scholars who wanted to study the subtle differences in design, but not for the ordinary visitor, to whom it all looked alike. Similarly, the information accompanying the objects often made little sense to the lay visitor. The content and format of explanations dated back to a time when the museum was the exclusive domain of the scientific researcher.</p><p><strong>B</strong> Recently, however, attitudes towards history and the way it should be presented have altered. The key word in heritage display is now 'experience', the more exciting the better and, if possible, involving all the senses. Good examples of this approach in the UK are the Jorvik Centre in York; the National Museum of Photography, Film and Television in Bradford; and the Imperial War Museum in London.</p><p>In the US the trend emerged much earlier: Williamsburg has been a prototype for many heritage developments in other parts of the world. No one can predict where the process will end. On so-called heritage sites the re-enactment of historical events is increasingly popular, and computers will soon provide virtual reality experiences, which will present visitors with a vivid image of the period of their choice, in which they themselves can act as if part of the historical environment.</p><p>Such developments have been criticised as an intolerable vulgarisation, but the success of many historical theme parks and similar locations suggests that the majority of the public does not share this opinion.</p><p><strong>C</strong> In a related development, the sharp distinction between museum and heritage sites on the one hand, and theme parks on the other, is gradually evaporating. They already borrow ideas and concepts from one another. For example, museums have adopted story lines for exhibitions, sites have accepted 'theming' as a relevant tool, and theme parks are moving towards more authenticity and research-based presentations.</p><p>In zoos, animals are no longer kept in cages, but in great spaces, either in the open air or in enormous greenhouses, such as the jungle and desert environments in Burgers' Zoo in Holland. This particular trend is regarded as one of the major developments in the presentation of natural history in the twentieth century.</p><p><strong>D</strong> Theme parks are undergoing other changes, too, as they try to present more serious social and cultural issues, and move away from fantasy. This development is a response to market forces and, although museums and heritage sites have a special, rather distinct, role to fulfil, they are also operating in a very competitive environment, where visitors make choices on how and where to spend their free time.</p><p>Heritage and museum experts do not have to invent stories and recreate historical environments to attract their visitors: their assets are already in place. However, exhibits must be both based on artefacts and facts as we know them, and attractively presented.</p><p>Those who are professionally engaged in the art of interpreting history are thus in a difficult position, as they must steer a narrow course between the demands of 'evidence' and 'attractiveness', especially given the increasing need in the heritage industry for income-generating activities.</p><p><strong>E</strong> It could be claimed that in order to make everything in heritage more 'real', historical accuracy must be increasingly altered. For example, Pithecanthropus erectus is depicted in an Indonesian museum with Malay facial features, because this corresponds to public perceptions. Similarly, in the Museum of Natural History in Washington, Neanderthal man is shown making a dominant gesture to his wife. Such presentations tell us more about contemporary perceptions of the world than about our ancestors.</p><p>There is one compensation, however, for the professionals who make these interpretations: if they did not provide the interpretation, visitors would do it for themselves, based on their own ideas, misconceptions and prejudices. And no matter how exciting the result, it would contain a lot more bias than the presentations provided by experts.</p><p><strong>F</strong> Human bias is inevitable, but another source of bias in the representation of history has to do with the transitory nature of the materials themselves. The simple fact is that not everything from history survives the historical process. Castles, palaces and cathedrals have a longer lifespan than the dwellings of ordinary people. The same applies to the furnishings and other contents of the premises.</p><p>In a town like Leyden in Holland, which in the seventeenth century was occupied by approximately the same number of inhabitants as today, people lived within the walled town, an area more than five times smaller than modern Leyden. In most of the houses several families lived together in circumstances beyond our imagination. Yet in museums, fine period rooms give only an image of the lifestyle of the upper class of that era.</p><p>No wonder that people who stroll around exhibitions are filled with nostalgia; the evidence in museums indicates that life was so much better in the past. This notion is induced by the bias in its representation in museums and heritage centres.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 6,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–6</h3><p>Do the following statements agree with the information given in Reading Passage 1?</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "Marie Curie's husband was a joint winner of both Marie's Nobel Prizes.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Marie became interested in science when she was a child.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Marie was able to attend the Sorbonne because of her sister's financial contribution.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Marie stopped doing research for several years when her children were born.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Marie took over the teaching position her husband had held.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Marie's sister Bronia studied the medical uses of radioactivity.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 7,
        "to": 13,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 7–13</h3><p>Complete the notes below.</p><p>Choose ONE WORD from the passage for each answer.</p>",
        "config": {},
        "questionHtml": "<p>Marie Curie's research on radioactivity</p><p>• When uranium was discovered to be radioactive, Marie Curie found that the element called 7_______  had the same property.</p><p>• Marie and Pierre Curie's research into the radioactivity of the mineral known as 8_______  led to the discovery of two new elements.</p><p>• In 1911, Marie Curie received recognition for her work on the element 9_______ .</p><p>• Marie and Irène Curie developed X-radiography which was used as a medical technique for 10_______ .</p><p>• Marie Curie saw the importance of collecting radioactive material both for research and for cases of 11_______ .</p><p>• The radioactive material stocked in Paris contributed to the discoveries in the 1930s of the 12_______  and of what was known as artificial radioactivity.</p><p>• During her research, Marie Curie was exposed to radiation and as a result she suffered from 13_______ .</p>",
        "questions": [
          {
            "number": 7,
            "prompt": "* When uranium was discovered to be radioactive, Marie Curie found that the element called 7_______  had the same property.",
            "options": [],
            "answerKey": "thorium",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "* Marie and Pierre Curie's research into the radioactivity of the mineral known as 8_______  led to the discovery of two new elements.",
            "options": [],
            "answerKey": "pitchblende",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "* In 1911, Marie Curie received recognition for her work on the element 9_______ .",
            "options": [],
            "answerKey": "radium",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "* Marie and Irène Curie developed X-radiography which was used as a medical technique for 10_______ .",
            "options": [],
            "answerKey": "soldiers",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "* Marie Curie saw the importance of collecting radioactive material both for research and for cases of 11_______ .",
            "options": [],
            "answerKey": "illness",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "* The radioactive material stocked in Paris contributed to the discoveries in the 1930s of the 12_______  and of what was known as artificial radioactivity.",
            "options": [],
            "answerKey": "neutron",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "* During her research, Marie Curie was exposed to radiation and as a result she suffered from 13_______ .",
            "options": [],
            "answerKey": "leukaemia",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 19,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–19</h3><p>Reading Passage 2 has eight paragraphs, A-H.</p><p>Which paragraph contains the following information?</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "an account of the method used by researchers in a particular study",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "the role of imitation in developing a sense of identity",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "the age at which children can usually identify a static image of themselves",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "a reason for the limitations of scientific research into 'self-as-subject'",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "reference to a possible link between culture and a particular form of behaviour",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "examples of the wide range of features that contribute to the sense of 'self-as-object'",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 20,
        "to": 23,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 20–23</h3><p>Look at the following findings (Questions 20-23) and the list of researchers below.</p><p>Match each finding with the correct researcher or researchers, A-E.</p>",
        "config": {
          "featureOptions": [
            "James",
            "Cooley",
            "Lewis and Brooks-Gunn",
            "Mead",
            "Bronson"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 20,
            "prompt": "A sense of identity can never be formed without relationships with other people.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "A child's awareness of self is related to a sense of mastery over things and people.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "At a certain age, children's sense of identity leads to aggressive behaviour.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "Observing their own reflection contributes to children's self awareness.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 24,
        "to": 26,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 24–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
        "config": {},
        "questionHtml": "<p>How children acquire a sense of identity</p><p>First, children come to realise that they can have an effect on the world around them, for example by handling objects, or causing the image to move when they face a 24_______  . This aspect of self-awareness is difficult to research directly, because of 25_______  problems.</p><p>Secondly, children start to become aware of how they are viewed by others. One important stage in this process is the visual recognition of themselves which usually occurs when they reach the age of two. In Western societies at least, the development of self awareness is often linked to a sense of 26_______  , and can lead to disputes.</p>",
        "questions": [
          {
            "number": 24,
            "prompt": "First, children come to realise that they can have an effect on the world around them, for example by handling objects, or causing the image to move when they face a 24_______  . This aspect of self-awareness is difficult to research directly, because of 25_______  problems.",
            "options": [],
            "answerKey": "mirror",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "First, children come to realise that they can have an effect on the world around them, for example by handling objects, or causing the image to move when they face a 24_______  . This aspect of self-awareness is difficult to research directly, because of 25_______  problems.",
            "options": [],
            "answerKey": "communication",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "Secondly, children start to become aware of how they are viewed by others. One important stage in this process is the visual recognition of themselves which usually occurs when they reach the age of two. In Western societies at least, the development of self awareness is often linked to a sense of 26_______  , and can lead to disputes.",
            "options": [],
            "answerKey": "ownership",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 30,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 27–30</h3><p>Reading Passage 3 has six paragraphs, A-F.</p><p>Choose the correct heading for paragraphs B-E from the list of headings below.</p>",
        "config": {
          "headings": [
            "Commercial pressures on people in charge",
            "Mixed views on current changes to museums",
            "Interpreting the facts to meet visitor expectations",
            "The international dimension",
            "Collections of factual evidence",
            "Fewer differences between public attractions",
            "Current reviews and suggestions"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "ii",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "iii",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 31,
        "to": 36,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 31–36</h3><p>Choose the correct letter, A, B, C or D.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 31,
            "prompt": "Compared with today's museums, those of the past",
            "options": [
              "did not present history in a detailed way.",
              "were not primarily intended for the public.",
              "were more clearly organised.",
              "preserved items with greater care."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "According to the writer, current trends in the heritage industry",
            "options": [
              "emphasise personal involvement.",
              "have their origins in York and London.",
              "rely on computer images.",
              "reflect minority tastes."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "The writer says that museums, heritage sites and theme parks",
            "options": [
              "often work in close partnership.",
              "try to preserve separate identities.",
              "have similar exhibits.",
              "are less easy to distinguish than before."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "The writer says that in preparing exhibits for museums, experts",
            "options": [
              "should pursue a single objective.",
              "have to do a certain amount of language translation.",
              "should be free from commercial constraints.",
              "have to balance conflicting priorities."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "In paragraph E, the writer suggests that some museum exhibits",
            "options": [
              "fail to match visitor expectations.",
              "are based on the false assumptions of professionals.",
              "reveal more about present beliefs than about the past.",
              "allow visitors to make more use of their imagination."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "The passage ends by noting that our view of history is biased because",
            "options": [
              "we fail to use our imagination.",
              "only very durable objects remain from the past.",
              "we tend to ignore things that displease us.",
              "museum exhibits focus too much on the local area."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 37,
        "to": 40,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Do the following statements agree with the information given in Reading Passage 3?</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "Consumers prefer theme parks which avoid serious issues.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "More people visit museums than theme parks.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "The boundaries of Leyden have changed little since the seventeenth century.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Museums can give a false impression of how life used to be.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-10-1",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-10-academic-reading-test-1/",
    "sections": [
      {
        "section": 1,
        "title": "Stepwells",
        "contentHtml": "<h2>Stepwells</h2><p>A millennium ago, stepwells were fundamental to life in the driest parts of India. Although many have been neglected, recent restoration has returned them to their former glory. Richard Cox travelled to north-western India to document these spectacular monuments from a bygone era.</p><p>During the sixth and seventh centuries, the inhabitants of the modern-day states of Gujarat and Rajasthan in North-western India developed a method of gaining access to clean, fresh groundwater during the dry season for drinking, bathing, watering animals and irrigation. However, the significance of this invention – the stepwell – goes beyond its utilitarian application.</p><p>Unique to the region, stepwells are often architecturally complex and vary widely in size and shape. During their heyday, they were places of gathering, of leisure, of relaxation and of worship for villagers of all but the lowest castes. Most stepwells are found dotted around the desert areas of Gujarat (where they are called vav) and Rajasthan (where they are known as baori), while a few also survive in Delhi.</p><p>Some were located in or near villages as public spaces for the community; others were positioned beside roads as resting places for travellers.</p><p>As their name suggests, stepwells comprise a series of stone steps descending from ground level to the water source (normally an underground aquifer) as it recedes following the rains. When the water level was high, the user needed only to descend a few steps to reach it; when it was low, several levels would have to be negotiated.</p><p>Some wells are vast, open craters with hundreds of steps paving each sloping side, often in tiers. Others are more elaborate, with long stepped passages leading to the water via several storeys. Built from stone and supported by pillars, they also included pavilions that sheltered visitors from the relentless heat.</p><p>But perhaps the most impressive features are the intricate decorative sculptures that embellish many stepwells, showing activities from fighting and dancing to everyday acts such as women combing their hair and churning butter.</p><p>Down the centuries, thousands of wells were constructed throughout northwestern India, but the majority have now fallen into disuse; many are derelict and dry, as groundwater has been diverted for industrial use and the wells no longer reach the water table. Their condition hasn’t been helped by recent dry spells: southern Rajasthan suffered an eight-year drought between 1996 and 2004.</p><p>However, some important sites in Gujarat have recently undergone major restoration, and the state government announced in June last year that it plans to restore the stepwells throughout the state.</p><p>In Patan, the state’s ancient capital, the stepwell of Rani Ki Vav (Queen’s Stepwell) is perhaps the finest current example. It was built by Queen Udayamati during the late 11th century, but became silted up following a flood during the 13th century. But the Archaeological Survey of India began restoring it in the 1960s, and today it’s in pristine condition.</p><p>At 65 metres long, 20 metres wide and 27 metres deep, Rani Ki Vav features 500 distinct sculptures carved into niches throughout the monument, depicting gods such as Vishnu and Parvati in various incarnations. Incredibly, in January 2001, this ancient structure survived a devastating earthquake that measured 7.6 on the Richter scale.</p><p>Another example is the Surya Kund in Modhera, northern Gujarat, next to the Sun Temple, built by King Bhima I in 1026 to honour the sun god Surya. It actually resembles a tank (kund means reservoir or pond) rather than a well, but displays the hallmarks of stepwell architecture, including four sides of steps that descend to the bottom in a stunning geometrical formation. The terraces house 108 small, intricately carved shrines between the sets of steps.</p><p>Rajasthan also has a wealth of wells. The ancient city of Bundi, 200 kilometres south of Jaipur, is renowned for its architecture, including its stepwells. One of the larger examples is Raniji Ki Baori, which was built by the queen of the region, Nathavatji, in 1699. At 46 metres deep, 20 metres wide and 40 metres long, the intricately carved monument is one of 21 baoris commissioned in the Bundi area by Nathavatji.</p><p>In the old ruined town of Abhaneri, about 95 kilometres east of Jaipur, is Chand Baori, one of India’s oldest and deepest wells; aesthetically, it’s perhaps one of the most dramatic. Built in around 850 AD next to the temple of Harshat Mata, the baori comprises hundreds of zigzagging steps that run along three of its sides, steeply descending 11 storeys, resulting in a striking geometric pattern when seen from afar. On the fourth side, verandas which are supported by ornate pillars overlook the steps.</p><p>Still in public use is Neemrana Ki Baori, located just off the Jaipur–Dehli highway. Constructed in around 1700, it’s nine storeys deep, with the last two being underwater. At ground level, there are 86 colonnaded openings from where the visitor descends 170 steps to the deepest water source.</p><p>Today, following years of neglect, many of these monuments to medieval engineering have been saved by the Archaeological Survey of India, which has recognised the importance of preserving them as part of the country’s rich history. Tourists flock to wells in far-flung corners of northwestern India to gaze in wonder at these architectural marvels from 1,000 years ago, which serve as a reminder of both the ingenuity and artistry of ancient civilisations and of the value of water to human existence.</p>"
      },
      {
        "section": 2,
        "title": "EUROPEAN TRANSPORT SYSTEMS 1990-2010",
        "contentHtml": "<h2>EUROPEAN TRANSPORT SYSTEMS 1990-2010</h2><p>What have been the trends and what are the prospects for European transport systems?</p><p><strong>A</strong> It is difficult to conceive of vigorous economic growth without an efficient transport system. Although modern information technologies can reduce the demand for physical transport by facilitating teleworking and teleservices, the requirement for transport continues to increase. There are two key factors behind this trend. For passenger transport, the determining factor is the spectacular growth in car use.</p><p>The number of cars on European Union (EU) roads saw an increase of three million cars each year from 1990 to 2010, and in the next decade the EU will see a further substantial increase in its fleet.</p><p><strong>B</strong> As far as goods transport is concerned, growth is due to a large extent to changes in the European economy and its system of production. In the last 20 years, as internal frontiers have been abolished, the EU has moved from a ‘stock’ economy to a ‘flow’ economy.</p><p>This phenomenon has been emphasised by the relocation of some industries, particularly those which are labour intensive, to reduce production costs, even though the production site is hundreds or even thousands of kilometres away from the final assembly plant or away from users.</p><p><strong>C</strong> The strong economic growth expected in countries which are candidates for entry to the EU will also increase transport flows, in particular road haulage traffic. In 1998, some of these countries already exported more than twice their 1990 volumes and imported more than five times their 1990 volumes. And although many candidate countries inherited a transport system which encourages rail, the distribution between modes has tipped sharply in favour of road transport since the 1990s.</p><p>Between 1990 and 1998, road haulage increased by 19.4%, while during the same period rail haulage decreased by 43.5%, although – and this could benefit the enlarged EU – it is still on average at a much higher level than in existing member states.</p><p><strong>D</strong> However, a new imperative-sustainable development – offers an opportunity for adapting the EU’s common transport policy. This objective, agreed by the Gothenburg European Council, has to be achieved by integrating environmental considerations into Community policies, and shifting the balance between modes of transport lies at the heart of its strategy.</p><p>The ambitious objective can only be fully achieved by 2020, but proposed measures are nonetheless a first essential step towards a sustainable transport system which will ideally be in place in 30 years' time, that is by 2040.</p><p><strong>E</strong> In 1998, energy consumption in the transport sector was to blame for 28% of emissions of CO2, the leading greenhouse gas. According to the latest estimates, if nothing is done to reverse the traffic growth trend, CO2 emissions from transport can be expected to increase by around 50% to 1,113 billion tonnes by 2020, compared with the 739 billion tonnes recorded in 1990. Once again, road transport is the main culprit since it alone accounts for 84% of the CO2 emissions attributable to transport.</p><p>Using alternative fuels and improving energy efficiency is thus both an ecological necessity and a technological challenge.</p><p><strong>F</strong> At the same time greater efforts must be made to achieve a modal shift. Such a change cannot be achieved overnight, all the less so after over half a century of constant deterioration in favour of road. This has reached such a pitch that today rail freight services are facing marginalisation, with just 8% of market share, and with international goods trains struggling along at an average speed of 18km/h. Three possible options have emerged.</p><p><strong>G</strong> The first approach would consist of focusing on road transport solely through pricing. This option would not be accompanied by complementary measures in the other modes of transport. In the short term it might curb the growth in road transport through the better loading ratio of goods vehicles and occupancy rates of passenger vehicles expected as a result of the increase in the price of transport.</p><p>However, the lack of measures available to revitalise other modes of transport would make it impossible for more sustainable modes of transport to take up the baton.</p><p><strong>H</strong> The second approach also concentrates on road transport pricing but is accompanied by measures to increase the efficiency of the other modes (better quality of services, logistics, technology). However, this approach does not include investment in new infrastructure, nor does it guarantee better regional cohesion.</p><p>It could help to achieve greater uncoupling than the first approach, but road transport would keep the lion’s share of the market and continue to concentrate on saturated arteries, despite being the most polluting of the modes. It is therefore not enough to guarantee the necessary shift of the balance.</p><p><strong>I</strong> The third approach, which is not new, comprises a series of measures ranging from pricing to revitalising alternative modes of transport and targeting investment in the trans-European network. This integrated approach would allow the market shares of the other modes to return to their 1998 levels and thus make a shift of balance.</p><p>It is far more ambitious than it looks, bearing in mind the historical imbalance in favour of roads for the last fifty years, but would achieve a marked break in the link between road transport growth and economic growth, without placing restrictions on the mobility of people and goods.</p>"
      },
      {
        "section": 3,
        "title": "The psychology of innovation",
        "contentHtml": "<h2>The psychology of innovation</h2><p>Why are so few companies truly innovative?</p><p>Innovation is key to business survival, and companies put substantial resources into inspiring employees to develop new ideas. There are, nevertheless, people working in luxurious, state-of-the-art centres designed to stimulate innovation who find that their environment doesn’t make them feel at all creative. And there are those who don’t have a budget, or much space, but who innovate successfully.</p><p>For Robert B. Cialdini, Professor of Psychology at Arizona State University, one reason that companies don’t succeed as often as they should is that innovation starts with recruitment. Research shows that the fit between an employee’s values and a company’s values makes a difference to what contribution they make and whether, two years after they join, they’re still at the company.</p><p>Studies at Harvard Business School show that, although some individuals may be more creative than others, almost every individual can be creative in the right circumstances.</p><p>One of the most famous photographs in the story of rock’n’roll emphasises Ciaidini’s views. The 1956 picture of singers Elvis Presley, Carl Perkins, Johnny Cash and Jerry Lee Lewis jamming at a piano in Sun Studios in Memphis tells a hidden story. Sun’s ‘million-dollar quartet’ could have been a quintet. Missing from the picture is Roy Orbison’ a greater natural singer than Lewis, Perkins or Cash.</p><p>Sam Phillips, who owned Sun, wanted to revolutionise popular music with songs that fused black and white music, and country and blues. Presley, Cash, Perkins and Lewis instinctively understood Phillips’s ambition and believed in it. Orbison wasn’t inspired by the goal, and only ever achieved one hit with the Sun label.</p><p>The value fit matters, says Cialdini, because innovation is, in part, a process of change, and under that pressure we, as a species, behave differently, ‘When things change, we are hard-wired to play it safe.’ Managers should therefore adopt an approach that appears counterintuitive -they should explain what stands to be lost if the company fails to seize a particular opportunity. Studies show that we invariably take more gambles when threatened with a loss than when offered a reward.</p><p>Managing innovation is a delicate art. It’s easy for a company to be pulled in conflicting directions as the marketing, product development, and finance departments each get different feedback from different sets of people. And without a system which ensures collaborative exchanges within the company, it’s also easy for small ‘pockets of innovation’ to disappear. Innovation is a contact sport. You can’t brief people just by saying, ‘We’re going in this direction and I’m going to take you with me.’</p><p>Cialdini believes that this ‘follow-the-leader syndrome, is dangerous, not least because it encourages bosses to go it alone. ‘It’s been scientifically proven that three people will be better than one at solving problems, even if that one person is the smartest person in the field.’ To prove his point, Cialdini cites an interview with molecular biologist James Watson. Watson, together with Francis Crick, discovered the structure of DNA, the genetic information carrier of all living organisms.</p><p>‘When asked how they had cracked the code ahead of an array of highly accomplished rival investigators, he said something that stunned me. He said he and Crick had succeeded because they were aware that they weren’t the most intelligent of the scientists pursuing the answer. The smartest scientist was called Rosalind Franklin who, Watson said, “was so intelligent she rarely sought advice”.’</p><p>Teamwork taps into one of the basic drivers of human behaviour. ‘The principle of social proof is so pervasive that we don’t even recognise it,’ says Cialdini. ‘If your project is being resisted, for example, by a group of veteran employees, ask another old-timer to speak up for it.’ Cialdini is not alone in advocating this strategy. Research shows that peer power, used horizontally not vertically, is much more powerful than any boss’s speech.</p><p>Writing, visualising and prototyping can stimulate the flow of new ideas. Cialdini cites scores of research papers and historical events that prove that even something as simple as writing deepens every individual’s engagement in the project. It is, he says, the reason why all those competitions on breakfast cereal packets encouraged us to write in saying, in no more than 10 words: ‘I like Kellogg’s Com Flakes because… .’ The very act of writing makes us more likely to believe it.</p><p>Authority doesn’t have to inhibit innovation but it often does. The wrong kind of leadership will lead to what Cialdini calls ‘captainitis, the regrettable tendency of team members to opt out of team responsibilities that are properly theirs’. He calls it captainitis because, he says, ‘crew members of multipilot aircraft exhibit a sometimes deadly passivity when the flight captain makes a clearly wrong-headed decision’.</p><p>This behaviour is not, he says, unique to air travel, but can happen in any workplace where the leader is overbearing.</p><p>At the other end of the scale is the 1980s Memphis design collective, a group of young designers for whom ‘the only rule was that there were no rules’. This environment encouraged a free interchange of ideas, which led to more creativity with form, function, colour and materials that revolutionised attitudes to furniture design.</p><p>Many theorists believe the ideal boss should lead from behind, taking pride in collective accomplishment and giving credit where it is due. Cialdini says: ‘Leaders should encourage everyone to contribute and simultaneously assure all concerned that every recommendation is important to making the right decision and will be given full attention.’ The frustrating thing about innovation is that there are many approaches, but no magic formula.</p><p>However, a manager who wants to create a truly innovative culture can make their job a lot easier by recognising these psychological realities.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 5,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–5</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "Examples of ancient stepwells can be found all over the world.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Stepwells had a range of functions, in addition to those related to water collection.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "The few existing stepwells in Delhi are more attractive than those found elsewhere.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "It took workers many years to build the stone steps characteristic of stepwells.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "The number of steps above the water level in a stepwell altered during the course of a year.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 6,
        "to": 8,
        "type": "fill",
        "displayType": "fill-blank",
        "instructionHtml": "<h3>Questions 6–8</h3><p>Answer the questions below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 6,
            "prompt": "Which part of some stepwells provided shade for people?",
            "options": [],
            "answerKey": "pavilions",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "What type of serious climatic event, which took place in southern Rajasthan, is mentioned in the article?",
            "options": [],
            "answerKey": "drought",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Who are frequent visitors to stepwells nowadays?",
            "options": [],
            "answerKey": "tourists",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 13,
        "type": "fill",
        "displayType": "table-completion",
        "instructionHtml": "<h3>Questions 9–13</h3><p>Complete the table below</p><p>Choose ONE WORD AND/OR A NUMBER from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<table><tbody><tr><td>Stepwells</td><td>Date</td><td>Features</td><td>Other notes</td></tr><tr><td>Rani Ki Vav</td><td>Late 11th century</td><td>As many as 500 sculptures decorate the monument</td><td>Restored in the 1990s Excellent condition, despite the 9_______  of 2001.</td></tr><tr><td>Surya Kund</td><td>1026</td><td>Steps on the 10_______  produce a geometric pattern Carved shrines.</td><td>Looks more like a 11_______  than a well.</td></tr><tr><td>Raniji Ki Baori</td><td>1699</td><td>Intricately carved monument</td><td>One of 21 baoris in the area commissioned by Queen Nathavatji</td></tr><tr><td>Chand Baori</td><td>850 AD</td><td>Steps take you down 11 storeys to the bottom</td><td>Old, deep and very dramatic Has 12_______  which provide a view to the steps.</td></tr><tr><td>Neemrana Ki Baori</td><td>1700</td><td>Has two 13_______  levels.</td><td>Used by public today</td></tr></tbody></table>",
        "questions": [
          {
            "number": 9,
            "prompt": "Rani Ki Vav | Late 11th century | As many as 500 sculptures decorate the monument | Restored in the 1990s Excellent condition, despite the 9_______  of 2001.",
            "options": [],
            "answerKey": "earthquake",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Surya Kund | 1026 | Steps on the 10_______  produce a geometric pattern Carved shrines. | Looks more like a 11_______  than a well.",
            "options": [],
            "answerKey": "4 sides",
            "acceptedAnswers": [
              "Four sides/ 4 sides"
            ]
          },
          {
            "number": 11,
            "prompt": "Surya Kund | 1026 | Steps on the 10_______  produce a geometric pattern Carved shrines. | Looks more like a 11_______  than a well.",
            "options": [],
            "answerKey": "tank",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Chand Baori | 850 AD | Steps take you down 11 storeys to the bottom | Old, deep and very dramatic Has 12_______  which provide a view to the steps.",
            "options": [],
            "answerKey": "verandas",
            "acceptedAnswers": [
              "verandas/ verandahs"
            ]
          },
          {
            "number": 13,
            "prompt": "Neemrana Ki Baori | 1700 | Has two 13_______  levels. | Used by public today",
            "options": [],
            "answerKey": "underwater",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 21,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 14–21</h3><p>The Reading Passage has nine paragraphs, A-I.</p><p>Choose the correct heading for paragraphs A-E and G-I from the list of headings below.</p><p>Write the correct number, i-xi, in boxes on your answer sheet.</p>",
        "config": {
          "headings": [
            "A fresh and important long-term goal",
            "Charging for roads and improving other transport methods",
            "Changes affecting the distances goods may be transported",
            "Taking all the steps necessary to change transport patterns",
            "The environmental costs of road transport",
            "The escalating cost of rail transport",
            "The need to achieve transport rebalance",
            "The rapid growth of private transport",
            "Plans to develop major road networks",
            "Restricting road use through charging policies alone",
            "Transport trends in countries awaiting EU admission"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "viii",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "iii",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "xi",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "v",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Paragraph G",
            "options": [],
            "answerKey": "x",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "Paragraph H",
            "options": [],
            "answerKey": "ii",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "Paragraph I",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 22,
        "to": 26,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 22–26</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 22,
            "prompt": "The need for transport is growing, despite technological developments.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "To reduce production costs, some industries have been moved closer to their relevant consumers.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "Cars are prohibitively expensive in some EU candidate countries.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "The Gothenburg European Council was set up 30 years ago.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "By the end of this decade, CO2 emissions from transport are predicted to reach 739 billion tonnes.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 30,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 27–30</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "The example of the ‘million-dollar quartet’ underlines the writer’s point about",
            "options": [
              "recognising talent.",
              "working as a team.",
              "having a shared objective.",
              "being an effective leader."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "James Watson suggests that he and Francis Crick won the race to discover the DNA code because they",
            "options": [
              "were conscious of their own limitations.",
              "brought complementary skills to their partnership.",
              "were determined to outperform their brighter rivals.",
              "encouraged each other to realise their joint ambition."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "The writer mentions competitions on breakfast cereal packets as an example of how to",
            "options": [
              "inspire creative thinking.",
              "generate concise writing.",
              "promote loyalty to a group.",
              "strengthen commitment to an idea."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "In the last paragraph, the writer suggests that it is important for employees to",
            "options": [
              "be aware of their company’s goals.",
              "feel that their contributions are valued.",
              "have respect for their co-workers‟ achievements.",
              "understand why certain management decisions are made."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 31,
        "to": 35,
        "type": "matching",
        "displayType": "sentence-ending",
        "instructionHtml": "<h3>Questions 31–35</h3><p>Complete each sentence with the correct ending, A-G, below.</p><p>Write the correct letter, A-G, in boxes on your answer sheet</p>",
        "config": {
          "sentenceEndings": [
            "take chances.",
            "share their ideas.",
            "become competitive.",
            "get promotion.",
            "avoid risk.",
            "ignore their duties.",
            "remain in their jobs."
          ]
        },
        "questionHtml": "<p>• Employees whose values match those of their employers are more likely to 31_______ </p><p>• At times of change, people tend to 32_______ </p><p>• If people are aware of what they might lose, they will often 33_______ </p><p>• People working under a dominant boss are liable to 34_______ </p><p>• Employees working in organisations with few rules are more likely to 35_______ </p>",
        "questions": [
          {
            "number": 31,
            "prompt": "• Employees whose values match those of their employers are more likely to 31_______ ",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "• At times of change, people tend to 32_______ ",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "• If people are aware of what they might lose, they will often 33_______ ",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "• People working under a dominant boss are liable to 34_______ ",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "• Employees working in organisations with few rules are more likely to 35_______ ",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 36,
        "to": 40,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 36–40</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 36,
            "prompt": "The physical surroundings in which a person works play a key role in determining their creativity.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Most people have the potential to be creative.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "Teams work best when their members are of equally matched intelligence.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "It is easier for smaller companies to be innovative.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "A manager’s approval of an idea is more persuasive than that of a colleague.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-10-2",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-10-academic-reading-test-2/",
    "sections": [
      {
        "section": 1,
        "title": "Tea and the Industrial Revolution",
        "contentHtml": "<h2>Tea and the Industrial Revolution</h2><p>A Cambridge professor says that a change in drinking habits was the reason for the Industrial Revolution in Britain. Anjana Abuja reports</p><p><strong>A</strong> Alan Macfarlane, professor of anthropological science at King’s College, Cambridge has, like other historians, spent decades wrestling with the enigma of the Industrial Revolution. Why did this particular Big Bang – the world-changing birth of industry-happen in Britain? And why did it strike at the end of the 18th century?</p><p><strong>B</strong> Macfarlane compares the puzzle to a combination lock. ‘There are about 20 different factors and all of them need to be present before the revolution can happen,’ he says. For industry to take off, there needs to be the technology and power to drive factories, large urban populations to provide cheap labour, easy transport to move goods around, an affluent middle-class willing to buy mass-produced objects, a market-driven economy and a political system that allows this to happen.</p><p>While this was the case for England, other nations, such as Japan, the Netherlands and France also met some of these criteria but were not industrialising. All these factors must have been necessary. But not sufficient to cause the revolution, says Macfarlane. ‘After all, Holland had everything except coal while China also had many of these factors. Most historians are convinced there are one or two missing factors that you need to open the lock.’</p><p><strong>C</strong> The missing factors, he proposes, are to be found in almost even kitchen cupboard. Tea and beer, two of the nation’s favourite drinks, fuelled the revolution. The antiseptic properties of tannin, the active ingredient in tea, and of hops in beer – plus the fact that both are made with boiled water – allowed urban communities to flourish at close quarters without succumbing to water-borne diseases such as dysentery.</p><p>The theory sounds eccentric but once he starts to explain the detective work that went into his deduction, the scepticism gives way to wary admiration. Macfarlanes case has been strengthened by support from notable quarters – Roy Porter, the distinguished medical historian, recently wrote a favourable appraisal of his research.</p><p><strong>D</strong> Macfarlane had wondered for a long time how the Industrial Revolution came about. Historians had alighted on one interesting factor around the mid-18th century that required explanation. Between about 1650 and 1740, the population in Britain was static. But then there was a burst in population growth. Macfarlane says: ‘The infant mortality rate halved in the space of 20 years, and this happened in both rural areas and cities, and across all classes. People suggested four possible causes.</p><p>Was there a sudden change in the viruses and bacteria around? Unlikely. Was there a revolution in medical science? But this was a century before Lister’s revolution*. Was there a change in environmental conditions? There were improvements in agriculture that wiped out malaria, but these were small gains. Sanitation did not become widespread until the 19th century. The only option left is food. But the height and weight statistics show a decline. So the food must have got worse.</p><p>Efforts to explain this sudden reduction in child deaths appeared to draw a blank.’</p><p><strong>E</strong> This population burst seemed to happen at just the right time to provide labour for the Industrial Revolution. ‘When you start moving towards an industrial revolution, it is economically efficient to have people living close together,’ says Macfarlane. ‘But then you get disease, particularly from human waste.’ Some digging around in historical records revealed that there was a change in the incidence of water-borne disease at that time, especially dysentery.</p><p>Macfarlane deduced that whatever the British were drinking must have been important in regulating disease. He says, ‘We drank beer. For a long time, the English were protected by the strong antibacterial agent in hops, which were added to help preserve the beer. But in the late 17th century a tax was introduced on malt, the basic ingredient of beer. The poor turned to water and gin and in the 1720s the mortality rate began to rise again. Then it suddenly dropped again. What caused this?’</p><p><strong>F</strong> Macfarlane looked to Japan, which was also developing large cities about the same time, and also had no sanitation. Water-borne diseases had a much looser grip on the Japanese population than those in Britain. Could it be the prevalence of tea in their culture? Macfarlane then noted that the history of tea in Britain provided an extraordinary coincidence of dates. Tea was relatively expensive until Britain started a direct clipper trade with China in the early 18th century.</p><p>By the 1740s, about the time that infant mortality was dipping, the drink was common. Macfarlane guessed that the fact that water had to be boiled, together with the stomach-purifying properties of tea meant that the breast milk provided by mothers was healthier than it had ever been. No other European nation sipped tea like the British, which, by Macfarlanes logic, pushed these other countries out of contention for the revolution.</p><p><strong>G</strong> But, if tea is a factor in the combination lock, why didn’t Japan forge ahead in a tea-soaked industrial revolution of its own? Macfarlane notes that even though 17th-century Japan had large cities, high literacy rates, even a futures market, it had turned its back on the essence of any work-based revolution by giving up labour-saving devices such as animals, afraid that they would put people out of work.</p><p>So, the nation that we now think of as one of the most technologically advanced entered the 19th century having ‘abandoned the wheel’.</p><p>* Joseph Lister was the first doctor to use antiseptic techniques during surgical operations to prevent infections.</p>"
      },
      {
        "section": 2,
        "title": "Gifted children and learning",
        "contentHtml": "<h2>Gifted children and learning</h2><p><strong>A</strong> Internationally, ‘giftedness’ is most frequently determined by a score on a general intelligence test, known as an IQ test, which is above a chosen cutoff point, usually at around the top 2-5%. Children’s educational environment contributes to the IQ score and the way intelligence is used. For example, a very close positive relationship was found when children’s IQ scores were compared with their home educational provision (Freeman, 2010).</p><p>The higher the children’s IQ scores, especially over IQ 130, the better the quality of their educational backup, measured in terms of reported verbal interactions with parents, number of books and activities in their home etc. Because IQ tests are decidedly influenced by what the child has learned, they are to some extent measures of current achievement based on age-norms; that is, how well the children have learned to manipulate their knowledge and know-how within the terms of the test.</p><p>The vocabulary aspect, for example, is dependent on having heard those words. But IQ tests can neither identify the processes of learning and thinking nor predict creativity.</p><p><strong>B</strong> Excellence does not emerge without appropriate help. To reach an exceptionally high standard in any area very able children need the means to learn, which includes material to work with and focused challenging tuition -and the encouragement to follow their dream. There appears to be a qualitative difference in the way the intellectually highly able think, compared with more average-ability or older pupils, for whom external regulation by the teacher often compensates for lack of internal regulation.</p><p>To be at their most effective in their self-regulation, all children can be helped to identify their own ways of learning – metacognition – which will include strategies of planning, monitoring, evaluation, and choice of what to learn. Emotional awareness is also part of metacognition, so children should be helped to be aware of their feelings around the area to be learned, feelings of curiosity or confidence, for example.</p><p><strong>C</strong> High achievers have been found to use self-regulatory learning strategies more often and more effectively than lower achievers, and are better able to transfer these strategies to deal with unfamiliar tasks. This happens to such a high degree in some children that they appear to be demonstrating talent in particular areas.</p><p>Overviewing research on the thinking process of highly able children, (Shore and Kanevsky, 1993) put the instructor’s problem succinctly: ‘If they [the gifted] merely think more quickly, then .we need only teach more quickly. If they merely make fewer errors, then we can shorten the practice’. But of course, this is not entirely the case; adjustments have to be made in methods of learning and teaching, to take account of the many ways individuals think.</p><p><strong>D</strong> Yet in order to learn by themselves, the gifted do need some support from their teachers. Conversely, teachers who have a tendency to ‘overdirect’ can diminish their gifted pupils’ learning autonomy. Although ‘spoon-feeding’ can produce extremely high examination results, these are not always followed by equally impressive life successes. Too much dependence on the teachers risks loss of autonomy and motivation to discover.</p><p>However, when teachers help pupils to reflect on their own learning and thinking activities, they increase their pupils’ self-regulation. For a young child, it may be just the simple question ‘What have you learned today?’ which helps them to recognise what they are doing.</p><p>Given that a fundamental goal of education is to transfer the control of learning from teachers to pupils, improving pupils’ learning to learn techniques should be a major outcome of the school experience, especially for the highly competent. There are quite a number of new methods which can help, such as child- initiated learning, ability-peer tutoring, etc. Such practices have been found to be particularly useful for bright children from deprived areas.</p><p><strong>E</strong> But scientific progress is not all theoretical, knowledge is also vital to outstanding performance: individuals who know a great deal about a specific domain will achieve at a higher level than those who do not (Elshout, 1995).</p><p>Research with creative scientists by Simonton (1988) brought him to the conclusion that above a certain high level, characteristics such as independence seemed to contribute more to reaching the highest levels of expertise than intellectual skills, due to the great demands of effort and time needed for learning and practice. Creativity in all forms can be seen as expertise se mixed with a high level of motivation (Weisberg, 1993).</p><p><strong>F</strong> To sum up, learning is affected by emotions of both the individual and significant others. Positive emotions facilitate the creative aspects of earning and negative emotions inhibit it. Fear, for example, can limit the development of curiosity, which is a strong force in scientific advance, because it motivates problem-solving behaviour. In Boekaerts’ (1991) review of emotion the learning of very high IQ and highly achieving children, she found emotional forces in harness.</p><p>They were not only curious, but often had a strong desire to control their environment, improve their learning efficiency and increase their own learning resources.</p>"
      },
      {
        "section": 3,
        "title": "Museums of fine art and their public",
        "contentHtml": "<h2>Museums of fine art and their public</h2><p>The fact that people go to the Louvre museum in Paris to see the original painting Mona Lisa when they can see a reproduction anywhere leads us to question some assumptions about the role of museums of fine art in today’s world</p><p>One of the most famous works of art in the world is Leonardo da Vinci’s Mona Lisa. Nearly everyone who goes to see the original will already be familiar with it from reproductions, but they accept that fine art is more rewardingly viewed in its original form.</p><p>However, if Mona Lisa was a famous novel, few people would bother to go to a museum to read the writer’s actual manuscript rather than a printed reproduction. This might be explained by the fact that the novel has evolved precisely because of technological developments that made it possible to print out huge numbers of texts, whereas oil paintings have always been produced as unique objects.</p><p>In addition, it could be argued that the practice of interpreting or ‘reading’ each medium follows different conventions. With novels, the reader attends mainly to the meaning of words rather than the way they are printed on the page, whereas the ‘reader’ of a painting must attend just as closely to the material form of marks and shapes in the picture as to any ideas they may signify.</p><p>Yet it has always been possible to make very accurate facsimiles of pretty well any fine art work. The seven surviving versions of Mona Lisa bear witness to the fact that in the 16th century, artists seemed perfectly content to assign the reproduction of their creations to their workshop apprentices as regular ‘bread and butter’ work.</p><p>And today the task of reproducing pictures is incomparably more simple and reliable, with reprographic techniques that allow the production of high-quality prints made exactly to the original scale, with faithful colour values, and even with duplication of the surface relief of the painting.</p><p>But despite an implicit recognition that the spread of good reproductions can be culturally valuable, museums continue to promote the special status of original work.</p><p>Unfortunately, this seems to place severe limitations on the kind of experience offered to visitors.</p><p>One limitation is related to the way the museum presents its exhibits. As repositories of unique historical objects, art museums are often called ‘treasure houses’. We are reminded of this even before we view a collection by the presence of security guards, attendants, ropes and display cases to keep us away from the exhibits. In many cases, the architectural style of the building further reinforces that notion.</p><p>In addition, a major collection like that of London’s National Gallery is housed in numerous rooms, each with dozens of works, any one of which is likely to be worth more than all the average visitor possesses. In a society that judges the personal status of the individual so much by their material worth, it is therefore difficult not to be impressed by one’s own relative ‘worthlessness’ in such an environment.</p><p>Furthermore, consideration of the ‘value’ of the original work in its treasure house setting impresses upon the viewer that, since these works were originally produced, they have been assigned a huge monetary value by some person or institution more powerful than themselves.</p><p>Evidently, nothing the viewer thinks about the work is going to alter that value, and so today’s viewer is deterred from trying to extend that spontaneous, immediate, self-reliant kind of reading which would originally have met the work.</p><p>The visitor may then be struck by the strangeness of seeing such diverse paintings, drawings and sculptures brought together in an environment for which they were not originally created. This ‘displacement effect’ is further heightened by the sheer volume of exhibits. In the case of a major collection, there are probably more works on display than we could realistically view in weeks or even months.</p><p>This is particularly distressing because time seems to be a vital factor in the appreciation of all art forms. A fundamental difference between paintings and other art forms is that there is no prescribed time over which a painting is viewed. By contrast, the audience encourage an opera or a play over a specific time, which is the duration of the performance.</p><p>Similarly novels and poems are read in a prescribed temporal sequence, whereas a picture has no clear place at which to start viewing, or at which to finish. Thus art works themselves encourage us to view them superficially, without appreciating the richness of detail and labour that is involved.</p><p>Consequently, the dominant critical approach becomes that of the art historian, a specialised academic approach devoted to ‘discovering the meaning’ of art within the cultural context of its time. This is in perfect harmony with the museum’s function, since the approach is dedicated to seeking out and conserving ‘authentic’, original, readings of the exhibits.</p><p>Again, this seems to put paid to that spontaneous, participators criticism which can be found in abundance in criticism of classic works of literature, but is absent from most art history.</p><p>The displays of art museums serve as a warning of what critical practices can emerge when spontaneous criticism is suppressed. The museum public, like any other audience, experience art more rewardingly when given the confidence to express their views. If appropriate works of fine art could be rendered permanently accessible to the public by means of high-fidelity reproductions, as literature and music already are, the public may feel somewhat less in awe of them.</p><p>Unfortunately, that may be too much to ask from those who seek to maintain and control the art establishment.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 7,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 1–7</h3><p>The Reading Passage has seven paragraphs, A-G.</p><p>Choose the correct heading for each paragraph from the list of headings below.</p><p>Write the correct number, i-ix, in boxes on your answer sheet</p>",
        "config": {
          "headings": [
            "The search for the reasons for an increase in population",
            "Industrialisation and the fear of unemployment",
            "The development of cities in Japan",
            "The time and place of the Industrial Revolution",
            "The cases of Holland, France and China",
            "Changes in drinking habits in Britain",
            "Two keys to Britain’s industrial revolution",
            "Conditions required for industrialisation",
            "Comparisons with Japan lead to the answer"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "viii",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "vii",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "ix",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "Paragraph G",
            "options": [],
            "answerKey": "ii",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 8,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 8–13</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 8,
            "prompt": "China’s transport system was not suitable for industry in the 18th century.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "Tea and beer both helped to prevent dysentery in Britain.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Roy Porter disagrees with Professor Macfarlane’s findings.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "After 1740，there was a reduction in population in Britain.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "People in Britain used to make beer at home.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "The tax on malt indirectly caused a rise in the death rate.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 17,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–17</h3><p>The Reading Passage has six paragraphs, A-F.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-F, in boxes on your answer sheet</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "a reference to the influence of the domestic background on the gifted child.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "reference to what can be lost if learners are given too much guidance.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "a reference to the damaging effects of anxiety.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "examples of classroom techniques which favour socially-disadvantaged children.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 18,
        "to": 22,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 18–22</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person or people, A-E.</p><p>Write the correct letter, A-E, in boxes on your answer sheet.</p>",
        "config": {
          "featureOptions": [
            "Freeman",
            "Shore and Kanevsky",
            "Elshout",
            "Simonton",
            "Boekaerts"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 18,
            "prompt": "Less time can be spent on exercises with gifted pupils who produce accurate work.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Self-reliance is a valuable tool that helps gifted students reach their goals.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "Gifted children know how to channel their feelings to assist their learning.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "The very gifted child benefits from appropriate support from close relatives.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Really successful students have learnt a considerable amount about their subject.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 26,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 23–26</h3><p>Complete the sentences below.</p><p>Choose NO MORE THAN THREE WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet</p>",
        "config": {},
        "questionHtml": "<p>• One study found a strong connection between children’s IQ and the availability of books and 23_______  at home.</p><p>• Children of average ability seem to need more direction from teachers because they do not have 24_______ .</p><p>• Meta-cognition involves children understanding their own learning strategies, as well as developing 25_______ .</p><p>• Teachers who rely on what is known as 26_______  often produce sets of impressive grades in class tests.</p>",
        "questions": [
          {
            "number": 23,
            "prompt": "* One study found a strong connection between children’s IQ and the availability of books and 23_______  at home.",
            "options": [],
            "answerKey": "books and activities",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "* Children of average ability seem to need more direction from teachers because they do not have 24_______ .",
            "options": [],
            "answerKey": "internal regulation",
            "acceptedAnswers": [
              "internal regulation/ self-regulation"
            ]
          },
          {
            "number": 25,
            "prompt": "* Meta-cognition involves children understanding their own learning strategies, as well as developing 25_______ .",
            "options": [],
            "answerKey": "emotional awareness",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "* Teachers who rely on what is known as 26_______  often produce sets of impressive grades in class tests.",
            "options": [],
            "answerKey": "spoon-feeding",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Complete the summary using the list of words, A-L, below.</p><p>Write the correct letter, A-L, in boxes</p><p>on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "institution",
            "mass production",
            "mechanical processes",
            "public",
            "paints",
            "artist",
            "size",
            "underlying ideas",
            "basic technology",
            "readers",
            "picture frames",
            "assistants"
          ]
        },
        "questionHtml": "<p>The value attached to original works of art</p><p>People go to art museums because they accept the value of seeing an original work of art. But they do not go to museums to read original manuscripts of novels, perhaps because the availability of novels has depended on 27_______  for so long, and also because with novels, the 28_______  are the most important thing.</p><p>However, in historical times artists such as Leonardo were happy to instruct 29_______  to produce copies of their work and these days new methods of reproduction allow excellent replication of surface relief features as well as colour and 30_______ .</p><p>It is regrettable that museums still promote the superiority of original works of art, since this may not be in the interests of the 31_______ .</p>",
        "questions": [
          {
            "number": 27,
            "prompt": "People go to art museums because they accept the value of seeing an original work of art. But they do not go to museums to read original manuscripts of novels, perhaps because the availability of novels has depended on 27_______  for so long, and also because with novels, the 28_______  are the most important thing.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "People go to art museums because they accept the value of seeing an original work of art. But they do not go to museums to read original manuscripts of novels, perhaps because the availability of novels has depended on 27_______  for so long, and also because with novels, the 28_______  are the most important thing.",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "However, in historical times artists such as Leonardo were happy to instruct 29_______  to produce copies of their work and these days new methods of reproduction allow excellent replication of surface relief features as well as colour and 30_______ .",
            "options": [],
            "answerKey": "L",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "However, in historical times artists such as Leonardo were happy to instruct 29_______  to produce copies of their work and these days new methods of reproduction allow excellent replication of surface relief features as well as colour and 30_______ .",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "It is regrettable that museums still promote the superiority of original works of art, since this may not be in the interests of the 31_______ .",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 35,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 32–35</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 32,
            "prompt": "The writer mentions London’s National Gallery to illustrate",
            "options": [
              "the undesirable cost to a nation of maintaining a huge collection of art.",
              "the conflict that may arise in society between financial and artistic values.",
              "the negative effect a museum can have on visitors’ opinions of themselves.",
              "the need to put individual well-being above large-scale artistic schemes."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "The writer says that today, viewers may be unwilling to criticise a because",
            "options": [
              "they lack the knowledge needed to support an opinion.",
              "they fear it may have financial implications.",
              "they have no real concept of the work’s value.",
              "they feel their personal reaction is of no significance."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "According to the writer, the ‘displacement effect’ on the visitor is caused by",
            "options": [
              "the variety of works on display and the way they are arranged.",
              "the impossibility of viewing particular works of art over a long period.",
              "the similar nature of the paintings and the lack of great works.",
              "the inappropriate nature of the individual works selected for exhibition."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "The writer says that unlike other forms of art, a painting does not",
            "options": [
              "involve direct contact with an audience.",
              "require a specific location for a performance.",
              "need the involvement of other professionals.",
              "have a specific beginning or end."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 36,
        "to": 40,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 36–40</h3><p>Do the following statements agree with the views of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the views of the writer</p><p>NO if the statement contradicts the views of the writer</p><p>NOT GIVEN if the is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 36,
            "prompt": "Art history should focus on discovering the meaning of art using a range of media.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "The approach of art historians conflicts with that of art museums.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "People should be encouraged to give their opinions openly on works of art.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Reproductions of fine art should only be sold to the public if they are of high quality.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "In the future, those with power are likely to encourage more people to enjoy art.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-10-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-10-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "The Context, Meaning and Scope of Tourism",
        "contentHtml": "<h2>The Context, Meaning and Scope of Tourism</h2><p><strong>A</strong> Travel has existed since the beginning of time, when primitive man set out, often traversing great distances in search of game, which provided the food and clothing necessary for his survival. Throughout the course of history, people have travelled for purposes of trade, religious conviction, economic gain, war, migration and other equally compelling motivations. In the Roman era, wealthy aristocrats and high government officials also travelled for pleasure.</p><p>Seaside resorts located at Pompeii and Herculaneum afforded citizens the opportunity to escape to their vacation villas in order to avoid the summer heat of Rome. Travel, except during the Dark Ages, has continued to grow and, throughout recorded history, has played a vital role in the development of civilisations and their economies.</p><p><strong>B</strong> Tourism in the mass form as we know it today is a distinctly twentieth-century phenomenon. Historians suggest that the advent of mass tourism began in England during the industrial revolution with the rise of the middle class and the availability of relatively inexpensive transportation. The creation of the commercial airline industry following the Second World War and the subsequent development of the jet aircraft in the 1950s signalled the rapid growth and expansion of international travel.</p><p>This growth led to the development of a major new industry: tourism. In turn, international tourism became the concern of a number of world governments since it not only provided new employment opportunities but also produced a means of earning foreign exchange.</p><p><strong>C</strong> Tourism today has grown significantly in both economic and social importance. In most industrialised countries over the past few years the fastest growth has been seen in the area of services. One of the largest segments of the service industry, although largely unrecognised as an entity in some of these countries, is travel and tourism.</p><p>According to the World Travel and Tourism Council (1992), Travel and tourism is the largest industry in the world on virtually any economic measure including value-added capital investment, employment and tax contributions. In 1992, the industry’s gross output was estimated to be $3.5 trillion, over 12 per cent of all consumer spending. The travel and tourism industry is the world’s largest employer the almost 130 million jobs, or almost 7 per cent of all employees.</p><p>This industry is the world’s leading industrial contributor, producing over 6 per cent of the world’s national product and accounting for capital investment in excess of $422 billion in direct indirect and personal taxes each year. Thus, tourism has a profound impact both on the world economy and, because of the educative effect of travel and the effects on employment, on society itself.</p><p><strong>D</strong> However, the major problems of the travel and tourism industry that have hidden, or obscured, its economic impact are the diversity and fragmentation of the industry itself. The travel industry includes: hotels, motels and other types of accommodation; restaurants and other food services; transportation services and facilities; amusements, attractions and other leisure facilities; gift shops and a large number of other enterprises.</p><p>Since many of these businesses also serve local residents, the impact of spending by visitors can easily be overlooked or underestimated. In addition, Meis (1992) points out that the tourism industry involves concepts that have remained amorphous to both analysts and decision makers.</p><p>Moreover, in all nations this problem has made it difficult for the industry to develop any type of reliable or credible tourism information base in order to estimate the contribution it makes to regional, national and global economies. However, the nature of this very diversity makes travel and tourism ideal vehicles for economic development in a wide variety of countries, regions or communities.</p><p><strong>E</strong> Once the exclusive province of the wealthy, travel and tourism have become an institutionalised way of life for most of the population. In fact, McIntosh and Goeldner (1990) suggest that tourism has become the largest commodity in international trade for many nations and, for a significant number of other countries, it ranks second or third. For example, tourism is the major source of income in Bermuda, Greece, Italy, Spain, Switzerland and most Caribbean countries.</p><p>In addition, Hawkins and Ritchie, quoting from data published by the American Express Company, suggest that the travel and tourism industry is the number one ranked employer in the Bahamas, Brazil, Canada, France, (the former) West Germany, Hong Kong, Italy, Jamaica, Japan, Singapore, the United Kingdom and the United States.</p><p>However, because of problems of definition, which directly affect statistical measurement, it is not possible with any degree of certainty to provide precise, valid or reliable data about the extent of world-wide tourism participation or its economic impact. In many cases, similar difficulties arise when attempts are made to measure domestic tourism.</p>"
      },
      {
        "section": 2,
        "title": "Autumn leaves",
        "contentHtml": "<h2>Autumn leaves</h2><p>Canadian writer Jay Ingram investigates the mystery of why leaves turn red in the fall</p><p><strong>A</strong> One of the most captivating natural events of the year in many areas throughout North America is the turning of the leaves in the fall. The colours are magnificent, but the question of exactly why some trees turn yellow or orange, and others red or purple, is something which has long puzzled scientists.</p><p><strong>B</strong> Summer leaves are green because they are full of chlorophyll, the molecule that captures sunlight converts that energy into new building materials for the tree. As fall approaches in the northern hemisphere, the amount of solar energy available declines considerably. For many trees – evergreen conifers being an exception – the best strategy is to abandon photosynthesis* until the spring.</p><p>So rather than maintaining the now redundant leaves throughout the winter, the tree saves its precious resources and discards them. But before letting its leaves go, the tree dismantles their chlorophyll molecules and ships their valuable nitrogen back into the twigs. As chlorophyll is depleted, other colours that have been dominated by it throughout the summer begin to be revealed.</p><p>This unmasking explains the autumn colours of yellow and orange, but not the brilliant reds and purples of trees such as the maple or sumac.</p><p><strong>C</strong> The source of the red is widely known: it is created by anthocyanins, water-soluble plant pigments reflecting the red to blue range of the visible spectrum. They belong to a class of sugar-based chemical compounds also known as flavonoids. What’s puzzling is that anthocyanins are actually newly minted, made in the leaves at the same time as the tree is preparing to drop them.</p><p>But it is hard to make sense of the manufacture of anthocyanins – why should a tree bother making new chemicals in its leaves when it’s already scrambling to withdraw and preserve the ones already there?</p><p><strong>D</strong> Some theories about anthocyanins have argued that they might act as a chemical defence against attacks by insects or fungi, or that they might attract fruit-eating birds or increase a leaf's tolerance to freezing. However there are problems with each of these theories, including the fact that leaves are red for such a relatively short period that the expense of energy needed to manufacture the anthocyanins would outweigh any anti-fungal or anti-herbivore activity achieved.</p><p><strong>E</strong> It has also been proposed that trees may produce vivid red colours to convince herbivorous insects that they are healthy and robust and would be easily able to mount chemical defences against infestation. If insects paid attention to such advertisements, they might be prompted to lay their eggs on a duller, and presumably less resistant host. The flaw in this theory lies in the lack of proof to support it.</p><p>No one has as yet ascertained whether more robust trees sport the brightest leaves, or whether insects make choices according to colour intensity.</p><p><strong>F</strong> Perhaps the most plausible suggestion as to why leaves would go to the trouble of making anthocyanins when they’re busy packing up for the winter is the theory known as the ‘light screen’ hypothesis. It sounds paradoxical, because the idea behind this hypothesis is that the red pigment is made in autumn leaves to protect chlorophyll, the light-absorbing chemical, from too much light.</p><p>Why does chlorophyll need protection when it is the natural world’s supreme light absorber? Why protect chlorophyll at a time when the tree is breaking it down to salvage as much of it as possible?</p><p><strong>G</strong> Chlorophyll, although exquisitely evolved to capture the energy of sunlight, can sometimes be overwhelmed by it, especially in situations of drought, low temperatures, or nutrient deficiency. Moreover, the problem of oversensitivity to light is even more acute in the fall, when the leaf is busy preparing for winter by dismantling its internal machinery.</p><p>The energy absorbed by the chlorophyll molecules of the unstable autumn leaf is not immediately channelled into useful products and processes, as it would be in an intact summer leaf. The weakened fall leaf then becomes vulnerable to the highly destructive effects of the oxygen created by the excited chlorophyll molecules.</p><p><strong>H</strong> Even if you had never suspected that this is what was going on when leaves turn red, there are clues out there. One is straightforward: on many trees, the leaves that are the reddest are those on the side of the tree which gets most sun. Not only that, but the red is brighter on the upper side of the leaf.</p><p>It has also been recognised for decades that the best conditions for intense red colours are dry, sunny days and cool nights, conditions that nicely match those that make leaves susceptible to excess light. And finally, trees such as maples usually get much redder the more north you travel in the northern hemisphere. It’s colder there, they’re more stressed, their chlorophyll is more sensitive and it needs more sunblock.</p><p><strong>I</strong> What is still not fully understood, however, is why some trees resort to producing red pigments while others don’t bother, and simply reveal their orange or yellow hues. Do these trees have other means at their disposal to prevent overexposure to light in autumn? Their story, though not as spectacular to the eye, will surely turn out to be as subtle and as complex.</p><p>* photosynthesis: the production of new material from sunlight, water and carbon dioxide.</p>"
      },
      {
        "section": 3,
        "title": "Beyond the blue horizon",
        "contentHtml": "<h2>Beyond the blue horizon</h2><p>Ancient voyagers who settled the far-flung islands of the Pacific Ocean</p><p>An important archaeological discovery on the island of Efate in the Pacific archipelago of Vanuatu has revealed traces of an ancient seafaring people, the distant ancestors of today’s Polynesians. The site came to light only by chance. An agricultural worker, digging in the grounds of a derelict plantation, scraped open a grave – the first of dozens in a burial ground some 3,000 years old.</p><p>It is the oldest cemetery ever found in the Pacific islands, and it harbors the remains of an ancient people archaeologists call the Lapita.</p><p>They were daring blue-water adventurers who used basic canoes to rove across the ocean. But they were not just explorers. They were also pioneers who carried with them everything they would need to build new lives – their livestock, taro seedlings and stone tools. Within the span of several centuries, the Lapita stretched the boundaries of their world from the jungle-clad volcanoes of Papua New Guinea to the loneliest coral outliers of Tonga.</p><p>The Lapita left precious few clues about themselves, but Efate expands the volume of data available to researchers dramatically. The remains of 62 individuals have been uncovered so far, and archaeologists were also thrilled to find six complete Lapita pots. Other items included a Lapita burial urn with modeled birds arranged on the rim as though peering down at the human remains sealed inside.</p><p>‘It’s an important discovery,’ says Matthew Spriggs, professor of archaeology at the Australian National University and head of the international team digging up the site, ‘for it conclusively identifies the remains as Lapita.’</p><p>DNA teased from these human remains may help answer one of the most puzzling questions in Pacific anthropology: did all Pacific islanders spring from one source or many? Was there only one outward migration from a single point in Asia, or several from different points? ‘This represents the best opportunity we’ve had yet,’ says Spriggs, ‘to find out who the Lapita actually were, where they came from, and who their closest descendants are today.’</p><p>There is one stubborn question for which archaeology has yet to provide any answers: how did the Lapita accomplish the ancient equivalent of a moon landing, many times over? No-one has found one of their canoes or any rigging, which could reveal how the canoes were sailed. Nor do the oral histories and traditions of later Polynesians offer any insights, for they turn into myths long before they reach as far back in time as the Lapita.</p><p>‘All we can say for certain is that the Lapita had canoes that were capable of ocean voyages, and they had the ability to sail them,’ says Geoff Irwin, a professor of archaeology at the University of Auckland. Those sailing skills, he says, were developed and passed down over thousands of years by earlier mariners who worked their way through the archipelagoes of the western Pacific, making short crossings to nearby islands.</p><p>The real adventure didn’t begin, however, until their Lapita descendants sailed out of sight of land, with empty horizons on every side. This must have been as difficult for them as landing on the moon is for us today. Certainly it distinguished them from their ancestors, but what gave them the courage to launch out on such risky voyages?</p><p>The Lapita's thrust into the Pacific was eastward, against the prevailing trade winds, Irwin notes. Those nagging headwinds, he argues, may have been the key to their success. ‘They could sail out for days into the unknown and assess the area, secure in the knowledge that if they didn’t find anything, they could turn about and catch a swift ride back on the trade winds.</p><p>This is what would have made the whole thing work.’ Once out there, skilled seafarers would have detected abundant leads to follow to land: seabirds, coconuts and twigs carried out to sea by the tides, and the afternoon pile-up of clouds on the horizon which often indicates an island in the distance.</p><p>For returning explorers, successful or not, the geography of their own archipelagoes would have provided a safety net. Without this to go by, overshooting their home ports, getting lost and sailing off into eternity would have been all too easy. Vanuatu, for example, stretches more than 500 miles in a northwest-southeast trend, its scores of intervisible islands forming a backstop for mariners riding the trade winds home.</p><p>All this presupposes one essential detail, says Atholl Anderson, professor of prehistory at the Australian National University: the Lapita had mastered the advanced art of sailing against the wind. ‘And there’s no proof they could do any such thing,’ Anderson says. ‘There has been this assumption they did, and people have built canoes to re-create those early voyages based on that assumption. But nobody has any idea what their canoes looked like or how they were rigged.’</p><p>Rather than give all the credit to human skill, Anderson invokes the winds of chance. El Nino, the same climate disruption that affects the Pacific today, may have helped scatter the Lapita, Anderson suggests. He points out that climate data obtained from slow-growing corals around the Pacific indicate a series of unusually frequent El Ninos around the time of the Lapita expansion.</p><p>By reversing the regular east-to-west flow of the trade winds for weeks at a time, these super El Ninos might have taken the Lapita on long unplanned voyages.</p><p>However they did it, the Lapita spread themselves a third of the way across the Pacific, then called it quits for reasons known only to them. Ahead lay the vast emptiness of the central Pacific and perhaps they were too thinly stretched to venture farther. They probably never numbered more than a few thousand in total, and in their rapid migration eastward they encountered hundreds of islands – more than 300 in Fiji alone.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 4,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 1–4</h3><p>The Reading Passage has five paragraphs, A-E.</p><p>Choose the correct heading for paragraphs B-E from the list of headings below.</p><p>Write the correct number, i-vii, in boxes on your answer sheet</p>",
        "config": {
          "headings": [
            "Economic and social significance of tourism",
            "The development of mass tourism",
            "Travel for the wealthy",
            "Earning foreign exchange through tourism",
            "Difficulty in recognising the economic effects of tourism",
            "The contribution of air travel to tourism",
            "The world impact of tourism",
            "The history of travel"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "ii",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "v",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "vii",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 5,
        "to": 10,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 5–10</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 5,
            "prompt": "The largest employment figures in the world are found in the travel and tourism industry.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Tourism contributes over six per cent of the Australian gross national product.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "Tourism has a social impact because it promotes recreation.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Two main features of the travel and tourism industry make its economic significance difficult to ascertain.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "Visitor spending is always greater than the spending of residents in tourist areas.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "It is easy to show statistically how tourism affects individual economies.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 11,
        "to": 13,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 11–13</h3><p>Complete the sentences below.</p><p>Choose NO MORE THAN THREE WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• In Greece, tourism the most important 11_______ .</p><p>• The travel and tourism industry in Jamaica is the major 12_______ .</p><p>• The problems associated with measuring international tourism are often reflected in the measurement of 13_______ .</p>",
        "questions": [
          {
            "number": 11,
            "prompt": "* In Greece, tourism the most important 11_______ .",
            "options": [],
            "answerKey": "source of income",
            "acceptedAnswers": [
              "source of income/ industry"
            ]
          },
          {
            "number": 12,
            "prompt": "* The travel and tourism industry in Jamaica is the major 12_______ .",
            "options": [],
            "answerKey": "employer",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "* The problems associated with measuring international tourism are often reflected in the measurement of 13_______ .",
            "options": [],
            "answerKey": "domestic tourism",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 18,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–18</h3><p>The Reading Passage has nine paragraphs, A-l.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-l, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "a description of the substance responsible for the red colouration of leaves",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "the reason why trees drop their leaves in autumn",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "some evidence to confirm a theory about the purpose of the red leaves",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "an explanation of the function of chlorophyll",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "a suggestion that the red colouration in leaves could serve as a warning signal",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 22,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 19–22</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Why believe the ‘light screen’ hypothesis?</p><p>• The most vividly coloured red leaves are found on the side of the tree facing the 19_______ .</p><p>• The 20_______  surfaces of leaves contain the most red pigment.</p><p>• Red leaves are most abundant when daytime weather conditions are 21_______  and sunny.</p><p>• The intensity of the red colour of leaves increases as you go further 22_______ </p>",
        "questions": [
          {
            "number": 19,
            "prompt": "* The most vividly coloured red leaves are found on the side of the tree facing the 19_______ .",
            "options": [],
            "answerKey": "sun",
            "acceptedAnswers": [
              "sun(light)"
            ]
          },
          {
            "number": 20,
            "prompt": "* The 20_______  surfaces of leaves contain the most red pigment.",
            "options": [],
            "answerKey": "upper",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "* Red leaves are most abundant when daytime weather conditions are 21_______  and sunny.",
            "options": [],
            "answerKey": "dry",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "* The intensity of the red colour of leaves increases as you go further 22_______ ",
            "options": [],
            "answerKey": "north",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 25,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 23–25</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "It is likely that the red pigments help to protect the leaf from freezing temperatures.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "The ‘light screen’ hypothesis would initially seem to contradict what is known about chlorophyll.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "Leaves which turn colours other than red are more likely to be damaged by sunlight.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 26,
        "to": 26,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 26</h3><p>Choose the correct letter A, B, C or D.</p><p>Write the correct letter in box on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 26,
            "prompt": "For which of the following questions does the writer offer an explanation?",
            "options": [
              "why conifers remain green in winter",
              "how leaves turn orange and yellow in autumn",
              "how herbivorous insects choose which trees to lay their eggs in",
              "why anthocyanins are restricted to certain trees"
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Complete the summary using the list of words and phrases, A-J, below.</p><p>Write the correct letter, A-J, in boxes on your sheet.</p>",
        "config": {
          "phraseOptions": [
            "proof",
            "plantation",
            "harbour",
            "bones",
            "data",
            "archaeological discovery",
            "burial urn",
            "source",
            "animals",
            "maps"
          ]
        },
        "questionHtml": "<p>The Éfaté burial site</p><p>A 3,000-year-old burial ground of a seafaring people called the Lapita has been found on an abandoned 27_______  on the Pacific island of Efate. The cemetery, which is a significant 28_______ , was uncovered accidentally by an agricultural worker.</p><p>The Lapita explored and colonised many Pacific islands over several centuries. They took many things with them on their voyages including 29_______  and tools.</p><p>The burial ground increases the amount of information about the Lapita available to scientists. A team of researchers, led by Matthew Spriggs from the Australian National University, are helping with the excavation of the site. Spriggs believes the 30_______  which was found at the site is very important since it confirms that the 31_______  found inside are Lapita.</p>",
        "questions": [
          {
            "number": 27,
            "prompt": "A 3,000-year-old burial ground of a seafaring people called the Lapita has been found on an abandoned 27_______  on the Pacific island of Efate. The cemetery, which is a significant 28_______ , was uncovered accidentally by an agricultural worker.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "A 3,000-year-old burial ground of a seafaring people called the Lapita has been found on an abandoned 27_______  on the Pacific island of Efate. The cemetery, which is a significant 28_______ , was uncovered accidentally by an agricultural worker.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "The Lapita explored and colonised many Pacific islands over several centuries. They took many things with them on their voyages including 29_______  and tools.",
            "options": [],
            "answerKey": "I",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "The burial ground increases the amount of information about the Lapita available to scientists. A team of researchers, led by Matthew Spriggs from the Australian National University, are helping with the excavation of the site. Spriggs believes the 30_______  which was found at the site is very important since it confirms that the 31_______  found inside are Lapita.",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "The burial ground increases the amount of information about the Lapita available to scientists. A team of researchers, led by Matthew Spriggs from the Australian National University, are helping with the excavation of the site. Spriggs believes the 30_______  which was found at the site is very important since it confirms that the 31_______  found inside are Lapita.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 35,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 32–35</h3><p>Choose the correct letter A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 32,
            "prompt": "According to the writer, there are difficulties explaining how the Lapita accomplished their journeys because",
            "options": [
              "the canoes that have been discovered offer relatively few clues.",
              "archaeologists have shown limited interest in this area of research.",
              "little information relating to this period can be relied upon for accuracy.",
              "technological advances have altered the way such achievements are viewed."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "According to the sixth paragraph, what was extraordinary about the Lapita?",
            "options": [
              "They sailed beyond the point where land was visible.",
              "Their cultural heritage discouraged the expression of fear.",
              "They were able to build canoes that withstood ocean voyages.",
              "Their navigational skills were passed on from one generation to the next."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "What does ‘This’ refer to in the seventh paragraph?",
            "options": [
              "the Lapita’s seafaring talent",
              "the Lapita s ability to detect signs of land",
              "the Lapita’s extensive knowledge of the region",
              "the Lapita’s belief they would be able to return home"
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "According to the eighth paragraph, how was the geography of the region significant?",
            "options": [
              "It played an important role in Lapita culture.",
              "It meant there were relatively few storms at sea.",
              "It provided a navigational aid for the Lapita.",
              "It made a large number of islands habitable."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 36,
        "to": 40,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 36–40</h3><p>Do the following statements agree with the views of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the views of the writer</p><p>NO if the statement contradicts the views of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 36,
            "prompt": "It is now clear that the Lapita could sail into a prevailing wind.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Extreme climate conditions may have played a role in Lapita migration.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "The Lapita learnt to predict the duration of El Ninos.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "It remains unclear why the Lapita halted their expansion across the Pacific.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "It is likely that the majority of Lapita settled on Fiji.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-10-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-10-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "The megafires of California",
        "contentHtml": "<h2>The megafires of California</h2><p>Drought, housing expansion, and oversupply of tinder make for bigger, hotter fires in the western United States</p><p>Wildfires are becoming an increasing menace in the western United States, with Southern California being the hardest hit area. There’s a reason fire squads battling more frequent blazes in Southern California are having such difficulty containing the flames, despite better preparedness than ever and decades of experience fighting fires fanned by the ‘Santa Ana Winds’. The wildfires themselves, experts say, are generally hotter, faster, and spread more erratically than in the past.</p><p>Megafires, also called ‘siege fires’, are the increasingly frequent blazes that burn 500,000 acres or more – 10 times the size of the average forest fire of 20 years ago. Some recent wildfires are among the biggest ever in California in terms of acreage burned, according to state figures and news reports.</p><p>One explanation for the trend to more superhot fires is that the region, which usually has dry summers, has had significantly below normal precipitation in many recent years. Another reason, experts say, is related to the century- long policy of the US Forest Service to stop wildfires as quickly as possible. The unintentional consequence has been to halt the natural eradication of underbrush, now the primary fuel for megafires.</p><p>Three other factors contribute to the trend, they add. First is climate change, marked by a 1-degree Fahrenheit rise in average yearly temperature across the western states. Second is fire seasons that on average are 78 days longer than they were 20 years ago. Third is increased construction of homes in wooded areas.</p><p>‘We are increasingly building our homes in fire-prone ecosystems,’ says Dominik Kulakowski, adjunct professor of biology at Clark University Graduate School of Geography in Worcester, Massachusetts. ‘Doing that in many of the forests of the western US is like building homes on the side of an active volcano.’</p><p>In California, where population growth has averaged more than 600,000 a year for at least a decade, more residential housing is being built. ‘What once was open space is now residential homes providing fuel to make fires burn with greater intensity,’ says Terry McHale of the California Department of Forestry firefighters’ union. ‘With so much dryness, so many communities to catch fire, so many fronts to fight, it becomes an almost incredible job.’</p><p>That said, many experts give California high marks for making progress on preparedness in recent years, after some of the largest fires in state history scorched thousands of acres, burned thousands of homes, and killed numerous people. Stung in the past by criticism of bungling that allowed fires to spread when they might have been contained, personnel are meeting the peculiar challenges of neighborhood – and canyon- hopping fires better than previously, observers say.</p><p>State promises to provide more up-to-date engines, planes, and helicopters to fight fires have been fulfilled. Firefighters’ unions that in the past complained of dilapidated equipment, old fire engines, and insufficient blueprints for fire safety are now praising the state’s commitment, noting that funding for firefighting has increased, despite huge cuts in many other programs.</p><p>‘We are pleased that the current state administration has been very proactive in its support of us, and [has] come through with budgetary support of the infrastructure needs we have long sought,’ says Mr. McHale of the firefighters’ union.</p><p>Besides providing money to upgrade the fire engines that must traverse the mammoth state and wind along serpentine canyon roads, the state has invested in better command-and-control facilities as well as in the strategies to run them. ‘In the fire sieges of earlier years, we found that other jurisdictions and states were willing to offer mutual-aid help, but we were not able to communicate adequately with them,’ says Kim Zagaris, chief of the state’s Office of Emergency Services Fire and Rescue Branch.</p><p>After a commission examined and revamped communications procedures, the statewide response ‘has become far more professional and responsive,’ he says. There is a sense among both government officials and residents that the speed, dedication, and coordination of firefighters from several states and jurisdictions are resulting in greater efficiency than in past ‘siege fire’ situations.</p><p>In recent years, the Southern California region has improved building codes, evacuation procedures, and procurement of new technology. ‘I am extraordinarily impressed by the improvements we have witnessed,’ says Randy Jacobs, a Southern California- based lawyer who has had to evacuate both his home and business to escape wildfires.</p><p>‘Notwithstanding all the damage that will continue to be caused by wildfires, we will no longer suffer the loss of life endured in the past because of the fire prevention and firefighting measures that have been put in place,’ he says.</p>"
      },
      {
        "section": 2,
        "title": "Second nature",
        "contentHtml": "<h2>Second nature</h2><p>Your personality isn’t necessarily set in stone. With a little experimentation, people can reshape their temperaments and inject passion, optimism, joy and courage into their lives</p><p><strong>A</strong> Psychologists have long held that a person’s character cannot undergo a transformation in any meaningful way and that the key traits of personality are determined at a very young age. However, researchers have begun looking more closely at ways we can change. Positive psychologists have identified 24 qualities we admire, such as loyalty and kindness, and are studying them to find out why they come so naturally to some people.</p><p>What they’re discovering is that many of these qualities amount to habitual behaviour that determines the way we respond to the world. The good news is that all this can be learned.</p><p>Some qualities are less challenging to develop than others, optimism being one of them. However, developing qualities requires mastering a range of skills which are diverse and sometimes surprising. For example, to bring more joy and passion into your life, you must be open to experiencing negative emotions. Cultivating such qualities will help you realise your full potential.</p><p><strong>B</strong> ‘The evidence is good that most personality traits can be altered,’ says Christopher Peterson, professor of psychology at the University of Michigan, who cites himself as an example. Inherently introverted, he realised early on that as an academic, his reticence would prove disastrous in the lecture hall. So he learned to be more outgoing and to entertain his classes. ‘Now my extroverted behaviour is spontaneous,’ he says.</p><p><strong>C</strong> David Fajgenbaum had to make a similar transition. He was preparing for university, when he had an accident that put an end to his sports career. On campus, he quickly found that beyond ordinary counselling, the university had no services for students who were undergoing physical rehabilitation and suffering from depression like him. He therefore launched a support group to help others in similar situations. He took action despite his own pain – a typical response of an optimist.</p><p><strong>D</strong> Suzanne Segerstrom, professor of psychology at the University of Kentucky, believes that the key to increasing optimism is through cultivating optimistic behaviour, rather than positive thinking. She recommends you train yourself to pay attention to good fortune by writing down three positive things that come about each day. This will help you convince yourself that favourable outcomes actually happen all the time, making it easier to begin taking action.</p><p><strong>E</strong> You can recognise a person who is passionate about a pursuit by the way they are so strongly involved in it. Tanya Streeter’s passion is freediving – the sport of plunging deep into the water without tanks or other breathing equipment. Beginning in 1998, she set nine world records and can hold her breath for six minutes. The physical stamina required for this sport is intense but the psychological demands are even more overwhelming.</p><p>Streeter learned to untangle her fears from her judgment of what her body and mind could do. ‘In my career as a competitive freediver, there was a limit to what I could do – but it wasn’t anywhere near what I thought it was/ she says.</p><p><strong>F</strong> Finding a pursuit that excites you can improve anyone’s life. The secret about consuming passions, though, according to psychologist Paul Silvia of the University of North Carolina, is that ‘they require discipline, hard work and ability, which is why they are so rewarding.’ Psychologist Todd Kashdan has this advice for those people taking up a new passion: ‘As a newcomer, you also have to tolerate and laugh at your own ignorance.</p><p>You must be willing to accept the negative feelings that come your way,’ he says.</p><p><strong>G</strong> In 2004, physician-scientist Mauro Zappaterra began his PhD research at Harvard Medical School. Unfortunately, he was miserable as his research wasn’t compatible with his curiosity about healing. He finally took a break and during eight months in Santa Fe, Zappaterra learned about alternative healing techniques not taught at Harvard. When he got back, he switched labs to study how cerebrospinal fluid nourishes the developing nervous system.</p><p>He also vowed to look for the joy in everything, including failure, as this could help him learn about his research and himself.</p><p>One thing that can hold joy back is a person’s concentration on avoiding failure rather than their looking forward to doing something well. ‘Focusing on being safe might get in the way of your reaching your goals,’ explains Kashdan. For example, are you hoping to get through a business lunch without embarrassing yourself, or are you thinking about how fascinating the conversation might be?</p><p><strong>H</strong> Usually, we think of courage in physical terms but ordinary life demands something else. For marketing executive Kenneth Pedeleose, it meant speaking out against something he thought was ethically wrong. The new manager was intimidating staff so Pedeleose carefully recorded each instance of bullying and eventually took the evidence to a senior director, knowing his own job security would be threatened. Eventually the manager was the one to go.</p><p>According to Cynthia Pury, a psychologist at Clemson University, Pedeleose’s story proves the point that courage is not motivated by fearlessness, but by moral obligation. Pury also believes that people can acquire courage. Many of her students said that faced with a risky situation, they first tried to calm themselves down, then looked for a way to mitigate the danger, just as Pedeleose did by documenting his allegations.</p><p>Over the long term, picking up a new character trait may help you move toward being the person you want to be. And in the short term, the effort itself could be surprisingly rewarding, a kind of internal adventure.</p>"
      },
      {
        "section": 3,
        "title": "When evolution runs backwards",
        "contentHtml": "<h2>When evolution runs backwards</h2><p>Evolution isn’t supposed to run backwards – yet an increasing number of examples show that it does and that it can sometimes represent the future of a species.</p><p>The description of any animal as an ‘evolutionary throwback’ is controversial. For the better part of a century, most biologists have been reluctant to use those words, mindful of a principle of evolution that says ‘evolution cannot run backwards. But as more and more examples come to light and modern genetics enters the scene, that principle is having to be rewritten. Not only are evolutionary throwbacks possible, they sometimes play an important role in the forward march of evolution.</p><p>The technical term for an evolutionary throwback is an ‘atavism’, from the Latin atavus, meaning forefather. The word has ugly connotations thanks largely to Cesare Lombroso, a 19th-century Italian medic who argued that criminals were born not made and could be identified by certain physical features that were throwbacks to a primitive, sub-human state.</p><p>While Lombroso was measuring criminals, a Belgian palaeontologist called Louis Dollo was studying fossil records and coming to the opposite conclusion. In 1890 he proposed that evolution was irreversible: that ‘an organism is unable to return, even partially, to a previous stage already realised in the ranks of its ancestors.</p><p>Early 20th-century biologists came to a similar conclusion, though they qualified it in terms of probability, stating that there is no reason why evolution cannot run backwards -it is just very unlikely. And so the idea of irreversibility in evolution stuck and came to be known as ‘Dollo’s law.</p><p>If Dollo’s law is right, atavisms should occur only very rarely, if at all. Yet almost since the idea took root, exceptions have been cropping up. In 1919, for example, a humpback whale with a pair of leglike appendages over a metre long, complete with a full set of limb bones, was caught off Vancouver Island in Canada. Explorer Roy Chapman Andrews argued at the time that the whale must be a throwback to a land-living ancestor. ‘I can see no other explanation,’ he wrote in 1921.</p><p>Since then, so many other examples have been discovered that it no longer makes sense to say that evolution is as good as irreversible. And this poses a puzzle: how can characteristics that disappeared millions of years ago suddenly reappear?</p><p>In 1994, Rudolf Raff and colleagues at Indiana University in the USA decided to use genetics to put a number on the probability of evolution going into reverse. They reasoned that while some evolutionary changes involve the loss of genes and are therefore irreversible, others may be the result of genes being switched off. If these silent genes are somehow switched back on, they argued, long-lost traits could reappear.</p><p>Raff’s team went on to calculate the likelihood of it happening. Silent genes accumulate random mutations, they reasoned, eventually rendering them useless. So how long can a gene survive in a species if it is no longer used? The team calculated that there is a good chance of silent genes surviving for up to 6 million years in at least a few individuals in a population, and that some might survive as long as 10 million years.</p><p>In other words, throwbacks are possible, but only to the relatively recent evolutionary past.</p><p>As a possible example, the team pointed to the mole salamanders of Mexico and California. Like most amphibians these begin life in a juvenile ‘tadpole’ state, then metamorphose into the adult form – except for one species, the axolotl, which famously lives its entire life as a juvenile. The simplest explanation for this is that the axolotl lineage alone lost the ability to metamorphose, while others retained it.</p><p>From a detailed analysis of the salamanders’ family tree, however, it is clear that the other lineages evolved from an ancestor that itself had lost the ability to metamorphose. In other words, metamorphosis in mole salamanders is an atavism. The salamander example fits with Raff’s 10million-year time frame.</p><p>More recently, however, examples have been reported that break the time limit, suggesting that silent genes may not be the whole story. In a paper published last year, biologist Gunter Wagner of Yale University reported some work on the evolutionary history of a group of South American lizards called Bachia. Many of these have minuscule limbs; some look more like snakes than lizards and a few have completely lost the toes on their hind limbs.</p><p>Other species, however, sport up to four toes on their hind legs. The simplest explanation is that the toed lineages never lost their toes, but Wagner begs to differ. According to his analysis of the Bachia family tree, the toed species re-evolved toes from toeless ancestors and, what is more, digit loss and gain has occurred on more than one occasion over tens of millions of years.</p><p>So what’s going on? One possibility is that these traits are lost and then simply reappear, in much the same way that similar structures can independently arise in unrelated species, such as the dorsal fins of sharks and killer whales. Another more intriguing possibility is that the genetic information needed to make toes somehow survived for tens or perhaps hundreds of millions of years in the lizards and was reactivated.</p><p>These atavistic traits provided an advantage and spread through the population, effectively reversing evolution.</p><p>But if silent genes degrade within 6 to million years, how can long-lost traits be reactivated over longer timescales? The answer may lie in the womb. Early embryos of many species develop ancestral features. Snake embryos, for example, sprout hind limb buds. Later in development these features disappear thanks to developmental programs that say ‘lose the leg’. If for any reason this does not happen, the ancestral feature may not disappear, leading to an atavism.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 6,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–6</h3><p>Complete the notes below.</p><p>Choose ONE WORD AND/OR A NUMBER from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Wildfires</p><p>• Characteristics of wildfires and wildfire conditions today compared to the past:</p><p>• * occurrence: more frequent</p><p>• temperature: hotter</p><p>• speed: faster</p><p>• movement: 1_______  more unpredictably</p><p>• size of fires: 2_______  greater on average than two decades ago</p><p>• Reasons wildfires cause more damage today compared to the past:</p><p>• * rainfall: 3_______  average</p><p>• more brush to act as 4_______ </p><p>• increase in yearly temperature</p><p>• extended fire 5_______ </p><p>• more building of 6_______  in vulnerable places</p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* movement: 1_______  more unpredictably",
            "options": [],
            "answerKey": "spread",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* size of fires: 2_______  greater on average than two decades ago",
            "options": [],
            "answerKey": "10 times",
            "acceptedAnswers": [
              "ten times"
            ]
          },
          {
            "number": 3,
            "prompt": "* * rainfall: 3_______  average",
            "options": [],
            "answerKey": "below",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* more brush to act as 4_______ ",
            "options": [],
            "answerKey": "fuel",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* extended fire 5_______ ",
            "options": [],
            "answerKey": "seasons",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "* more building of 6_______  in vulnerable places",
            "options": [],
            "answerKey": "homes",
            "acceptedAnswers": [
              "homes/ housing"
            ]
          }
        ]
      },
      {
        "section": 1,
        "from": 7,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 7–13</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 7,
            "prompt": "The amount of open space in California has diminished over the last ten years.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Many experts believe California has made little progress in readying itself to fight fires.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "Personnel in the past have been criticised for mishandling fire containment.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "California has replaced a range of firefighting tools.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "More firefighters have been hired to improve fire-fighting capacity.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Citizens and government groups disapprove of the efforts of different states and agencies working together.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Randy Jacobs believes that loss of life from fires will continue at the same levels, despite changes made.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 18,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 14–18</h3><p>Complete the summary below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Psychologists have traditionally believed that a personality 14_______  was impossible and that by a 15_______  a person’s character tends to be fixed. This is not true according to positive psychologists, who say that our personal qualities can be seen as habitual behaviour. One of the easiest qualities to acquire is 16_______ .</p><p>However, regardless of the quality, it is necessary to learn a wide variety of different 17_______  in order for a new quality to develop; for example, a person must understand and feel some 18_______  in order to increase their happiness.</p>",
        "questions": [
          {
            "number": 14,
            "prompt": "Psychologists have traditionally believed that a personality 14_______  was impossible and that by a 15_______  a person’s character tends to be fixed. This is not true according to positive psychologists, who say that our personal qualities can be seen as habitual behaviour. One of the easiest qualities to acquire is 16_______ .",
            "options": [],
            "answerKey": "transformation",
            "acceptedAnswers": [
              "transformation/ change"
            ]
          },
          {
            "number": 15,
            "prompt": "Psychologists have traditionally believed that a personality 14_______  was impossible and that by a 15_______  a person’s character tends to be fixed. This is not true according to positive psychologists, who say that our personal qualities can be seen as habitual behaviour. One of the easiest qualities to acquire is 16_______ .",
            "options": [],
            "answerKey": "young age",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Psychologists have traditionally believed that a personality 14_______  was impossible and that by a 15_______  a person’s character tends to be fixed. This is not true according to positive psychologists, who say that our personal qualities can be seen as habitual behaviour. One of the easiest qualities to acquire is 16_______ .",
            "options": [],
            "answerKey": "optimism",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "However, regardless of the quality, it is necessary to learn a wide variety of different 17_______  in order for a new quality to develop; for example, a person must understand and feel some 18_______  in order to increase their happiness.",
            "options": [],
            "answerKey": "skills",
            "acceptedAnswers": [
              "skills/ techniques"
            ]
          },
          {
            "number": 18,
            "prompt": "However, regardless of the quality, it is necessary to learn a wide variety of different 17_______  in order for a new quality to develop; for example, a person must understand and feel some 18_______  in order to increase their happiness.",
            "options": [],
            "answerKey": "negative emotions",
            "acceptedAnswers": [
              "negative emotions/ feelings"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 22,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 19–22</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person, A-G.</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "featureOptions": [
            "Christopher Peterson",
            "David Fajgenbaum",
            "Suzanne Segerstrom",
            "Tanya Streeter",
            "Todd Kashdan",
            "Kenneth Pedeleose",
            "Cynthia Pury"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 19,
            "prompt": "People must accept that they do not know much when first trying something new.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "It is important for people to actively notice when good things happen.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "Courage can be learned once its origins in a sense of responsibility are understood.",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "It is possible to overcome shyness when faced with the need to speak in public.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 26,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 23–26</h3><p>The Reading Passage has eight sections, A-H.</p><p>Which section contains the following information?</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "a mention of how rational thinking enabled someone to achieve physical goals",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "an account of how someone overcame a sad experience",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "a description of how someone decided to rethink their academic career path",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "an example of how someone risked his career out of a sense of duty",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "When discussing the theory developed by Louis Dollo, the writer says that",
            "options": [
              "it was immediately referred to as Dollo’s law.",
              "it supported the possibility of evolutionary throwbacks.",
              "it was modified by biologists in the early twentieth century.",
              "it was based on many years of research."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "The humpback whale caught off Vancouver Island is mentioned because of",
            "options": [
              "the exceptional size of its body.",
              "the way it exemplifies Dollo’s law.",
              "the amount of local controversy it caused.",
              "the reason given for its unusual features."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "What is said about ‘silent genes’?",
            "options": [
              "Their numbers vary according to species.",
              "Raff disagreed with the use of the term.",
              "They could lead to the re-emergence of certain characteristics.",
              "They can have an unlimited life span."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "The writer mentions the mole salamander because",
            "options": [
              "it exemplifies what happens in the development of most amphibians.",
              "it suggests that Raff’s theory is correct.",
              "it has lost and regained more than one ability.",
              "its ancestors have become the subject of extensive research."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Which of the following does Wagner claim?",
            "options": [
              "Members of the Bachia lizard family have lost and regained certain features several times.",
              "Evidence shows that the evolution of the Bachia lizard is due to the environment.",
              "His research into South American lizards supports Raff’s assertions.",
              "His findings will apply to other species of South American lizards."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 36,
        "type": "matching",
        "displayType": "sentence-ending",
        "instructionHtml": "<h3>Questions 32–36</h3><p>Complete each sentence with the correct ending, A-G, below.</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "sentenceEndings": [
            "the question of how certain long-lost traits could reappear.",
            "the occurrence of a particular feature in different species.",
            "parallels drawn between behaviour and appearance.",
            "the continued existence of certain genetic information.",
            "the doubts felt about evolutionary throwbacks.",
            "the possibility of evolution being reversible.",
            "Dollo’s findings and the convictions held by Lombroso."
          ]
        },
        "questionHtml": "<p>• For a long time biologists rejected 32_______ </p><p>• Opposing views on evolutionary throwbacks are represented by 33_______ </p><p>• Examples of evolutionary throwbacks have led to 34_______ </p><p>• The shark and killer whale are mentioned to exemplify 35_______ </p><p>• One explanation for the findings of Wagner’s research is 36_______ </p>",
        "questions": [
          {
            "number": 32,
            "prompt": "• For a long time biologists rejected 32_______ ",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "• Opposing views on evolutionary throwbacks are represented by 33_______ ",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "• Examples of evolutionary throwbacks have led to 34_______ ",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "• The shark and killer whale are mentioned to exemplify 35_______ ",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "• One explanation for the findings of Wagner’s research is 36_______ ",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 37,
        "to": 40,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "Wagner was the first person to do research on South American lizards.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "Wagner believes that Bachia lizards with toes had toeless ancestors.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "The temporary occurrence of long-lost traits in embryos is rare.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Evolutionary throwbacks might be caused by developmental problems in the womb.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-11-1",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-11-academic-reading-test-1/",
    "sections": [
      {
        "section": 1,
        "title": "Crop-growing skyscrapers",
        "contentHtml": "<h2>Crop-growing skyscrapers</h2><p>By the year 2050, nearly 80% of the Earth’s population will live in urban centres. Applying the most conservative estimates to current demographic trends, the human population will increase by about three billion people by then. An estimated 109 hectares of new land (about 20% larger than Brazil) will be needed to grow enough food to feed them, if traditional farming methods continue as they are practised today.</p><p>At present, throughout the world, over 80% of the land that is suitable for raising crops is in use. Historically, some 15% of that has been laid waste by poor management practices. What can be done to ensure enough food for the world’s population to live on?</p><p>The concept of indoor farming is not new, since hothouse production of tomatoes and other produce has been in vogue for some time. What is new is the urgent need to scale up this technology to accommodate another three billion people. Many believe an entirely new approach to indoor farming is required, employing cutting-edge technologies. One such proposal is for the ‘Vertical Farm’. The concept is of multi-storey buildings in which food crops are grown in environmentally controlled conditions.</p><p>Situated in the heart of urban centres, they would drastically reduce the amount of transportation required to bring food to consumers. Vertical farms would need to be efficient, cheap to construct and safe to operate. If successfully implemented, proponents claim, vertical farms offer the promise of urban renewal, sustainable production of a safe and varied food supply (through year-round production of all crops), and the eventual repair of ecosystems that have been sacrificed for horizontal farming.</p><p>It took humans 10,000 years to learn how to grow most of the crops we now take for granted. Along the way, we despoiled most of the land we worked, often turning verdant, natural ecozones into semi-arid deserts. Within that same time frame, we evolved into an urban species, in which 60% of the human population now lives vertically in cities.</p><p>This means that, for the majority, we humans have shelter from the elements, yet we subject our food-bearing plants to the rigours of the great outdoors and can do no more than hope for a good weather year. However, more often than not now, due to a rapidly changing climate, that is not what happens. Massive floods, long droughts, hurricanes and severe monsoons take their toll each year, destroying millions of tons of valuable crops.</p><p>The supporters of vertical farming claim many potential advantages for the system. For instance, crops would be produced all year round, as they would be kept in artificially controlled, optimum growing conditions. There would be no weather-related crop failures due to droughts, floods or pests. All the food could be grown organically, eliminating the need for herbicides, pesticides and fertilisers.</p><p>The system would greatly reduce the incidence of many infectious diseases that are acquired at the agricultural interface. Although the system would consume energy, it would return energy to the grid via methane generation from composting nonedible parts of plants. It would also dramatically reduce fossil fuel use, by cutting out the need for tractors, ploughs and shipping.</p><p>A major drawback of vertical farming, however, is that the plants would require artificial light. Without it, those plants nearest the windows would be exposed to more sunlight and grow more quickly, reducing the efficiency of the system. Single-storey greenhouses have the benefit of natural overhead light; even so, many still need artificial lighting.</p><p>A multi-storey facility with no natural overhead light would require far more. Generating enough light could be prohibitively expensive, unless cheap, renewable energy is available, and this appears to be rather a future aspiration than a likelihood for the near future.</p><p>One variation on vertical farming that has been developed is to grow plants in stacked trays that move on rails. Moving the trays allows the plants to get enough sunlight. This system is already in operation, and works well within a single-storey greenhouse with light reaching it from above: it Is not certain, however, that it can be made to work without that overhead natural light.</p><p>Vertical farming is an attempt to address the undoubted problems that we face in producing enough food for a growing population. At the moment, though, more needs to be done to reduce the detrimental impact it would have on the environment, particularly as regards the use of energy. While it is possible that much of our food will be grown in skyscrapers in future, most experts currently believe it is far more likely that we will simply use the space available on urban rooftops.</p>"
      },
      {
        "section": 2,
        "title": "The Falkirk Wheel",
        "contentHtml": "<h2>The Falkirk Wheel</h2><p>A unique engineering achievement</p><p>The Falkirk Wheel in Scotland is the world’s first and only rotating boat lift. Opened in 2002, it is central to the ambitious £84.5m Millennium Link project to restore navigability across Scotland by reconnecting the historic waterways of the Forth &amp; Clyde and Union Canals.</p><p>The major challenge of the project lays in the fact that the Forth &amp; Clyde Canal is situated 35 metres below the level of the Union Canal. Historically, the two canals had been joined near the town of Falkirk by a sequence of 11 locks – enclosed sections of canal in which the water level could be raised or lowered – that stepped down across a distance of 1.5 km. This had been dismantled in 1933, thereby breaking the link.</p><p>When the project was launched in 1994, the British Waterways authority were keen to create a dramatic twenty-first-century landmark which would not only be a fitting commemoration of the Millennium, but also a lasting symbol of the economic regeneration of the region.</p><p>Numerous ideas were submitted for the project, including concepts ranging from rolling eggs to tilting tanks, from giant seesaws to overhead monorails. The eventual winner was a plan for the huge rotating steel boat lift which was to become The Falkirk Wheel. The unique shape of the structure is claimed to have been inspired by various sources, both manmade and natural, most notably a Celtic double headed axe, but also the vast turning propeller of a ship, the ribcage of a whale or the spine of a fish.</p><p>The various parts of The Falkirk Wheel were all constructed and assembled, like one giant toy building set, at Butterley Engineering’s Steelworks in Derbyshire, some 400 km from Falkirk. A team there carefully assembled the 1,200 tonnes of steel, painstakingly fitting the pieces together to an accuracy of just 10 mm to ensure a perfect final fit.</p><p>In the summer of 2001, the structure was then dismantled and transported on 35 lorries to Falkirk, before all being bolted back together again on the ground, and finally lifted into position in five large sections by crane. The Wheel would need to withstand immense and constantly changing stresses as it rotated, so to make the structure more robust, the steel sections were bolted rather than welded together. Over 45,000 bolt holes were matched with their bolts, and each bolt was hand-tightened.</p><p>The Wheel consists of two sets of opposing axe-shaped arms, attached about 25 metres apart to a fixed central spine. Two diametrically opposed water-filled ‘gondolas’, each with a capacity of 360,000 litres, are fitted between the ends of the arms. These gondolas always weigh the same, whether or not they are carrying boats. This is because, according to Archimedes’ principle of displacement, floating objects displace their own weight in water.</p><p>So when a boat enters a gondola, the amount of water leaving the gondola weighs exactly the same as the boat. This keeps the Wheel balanced and so, despite its enormous mass, it rotates through 180° in five and a half minutes while using very little power. It takes just 1.5 kilowatt-hours (5.4 MJ) of energy to rotate the Wheel -roughly the same as boiling eight small domestic kettles of water.</p><p>Boats needing to be lifted up enter the canal basin at the level of the Forth &amp; Clyde Canal and then enter the lower gondola of the Wheel. Two hydraulic steel gates are raised, so as to seal the gondola off from the water in the canal basin. The water between the gates is then pumped out. A hydraulic clamp, which prevents the arms of the Wheel moving while the gondola is docked, is removed, allowing the Wheel to turn.</p><p>In the central machine room an array of ten hydraulic motors then begins to rotate the central axle. The axle connects to the outer arms of the Wheel, which begin to rotate at a speed of 1/8 of a revolution per minute. As the wheel rotates, the gondolas are kept in the upright position by a simple gearing system.</p><p>Two eight-metre-wide cogs orbit a fixed inner cog of the same width, connected by two smaller cogs travelling in the opposite direction to the outer cogs – so ensuring that the gondolas always remain level. When the gondola reaches the top, the boat passes straight onto the aqueduct situated 24 metres above the canal basin.</p><p>The remaining 11 metres of lift needed to reach the Union Canal is achieved by means of a pair of locks. The Wheel could not be constructed to elevate boats over the full 35-metre difference between the two canals, owing to the presence of the historically important Antonine Wall, which was built by the Romans in the second century AD. Boats travel under this wall via a tunnel, then through the locks, and finally on to the Union Canal.</p>"
      },
      {
        "section": 3,
        "title": "Reducing the Effects of Climate Change",
        "contentHtml": "<h2>Reducing the Effects of Climate Change</h2><p>Mark Rowe reports on the increasingly ambitious geo-engineering projects being explored by scientists</p><p><strong>A</strong> Such is our dependence on fossil fuels, and such is the volume of carbon dioxide already released into the atmosphere, that many experts agree that significant global warming is now inevitable. They believe that the best we can do is keep it at a reasonable level, and at present the only serious option for doing this is cutting back on our carbon emissions.</p><p>But while a few countries are making major strides in this regard, the majority are having great difficulty even stemming the rate of increase, let alone reversing it. Consequently, an increasing number of scientists are beginning to explore the alternative of geo-engineering — a term which generally refers to the intentional large-scale manipulation of the environment.</p><p>According to its proponents, geo-engineering is the equivalent of a backup generator: if Plan A – reducing our dependency on fossil fuels – fails, we require a Plan B, employing grand schemes to slow down or reverse the process of global warming.</p><p><strong>B</strong> Geo-engineering; has been shown to work, at least on a small localised scale. For decades, MayDay parades in Moscow have taken place under clear blue skies, aircraft having deposited dry ice, silver iodide and cement powder to disperse clouds. Many of the schemes now suggested look to do the opposite, and reduce the amount of sunlight reaching the planet. The most eye-catching idea of all is suggested by Professor Roger Angel of the University of Arizona.</p><p>His scheme would employ up to 16 trillion minute spacecraft, each weighing about one gram, to form a transparent, sunlight-refracting sunshade in an orbit 1.5 million km above the Earth. This could, argues Angel, reduce the amount of light reaching the Earth by two per cent.</p><p><strong>C</strong> The majority of geo-engineering projects so far carried out — which include planting forests in deserts and depositing iron in the ocean to stimulate the growth of algae – have focused on achieving a general cooling of the Earth. But some look specifically at reversing the melting at the poles, particularly the Arctic.</p><p>The reasoning is that if you replenish the ice sheets and frozen waters of the high latitudes, more light will be reflected back into space, so reducing the warming of the oceans and atmosphere.</p><p><strong>D</strong> The concept of releasing aerosol sprays into the stratosphere above the Arctic has been proposed by several scientists. This would involve using sulphur or hydrogen sulphide aerosols so that sulphur dioxide would form clouds, which would, in turn, lead to a global dimming. The idea is modelled on historic volcanic explosions, such as that of Mount Pinatubo in the Philippines in 1991, which led to a short-term cooling of global temperatures by 0.5 °C.</p><p>Scientists have also scrutinised whether it’s possible to preserve the ice sheets of Greenland with reinforced high-tension cables, preventing icebergs from moving into the sea. Meanwhile in the Russian Arctic, geo-engineering plans include the planting of millions of birch trees. Whereas the regions native evergreen pines shade the snow an absorb radiation, birches would shed their leaves in winter, thus enabling radiation to be reflected by the snow.</p><p>Re-routing Russian rivers to increase cold water flow to ice-forming areas could also be used to slow down warming, say some climate scientists.</p><p><strong>E</strong> But will such schemes ever be implemented? Generally speaking, those who are most cautious about geo-engineering are the scientists involved in the research. Angel says that his plan is ‘no substitute for developing renewable energy: the only permanent solution’.</p><p>And Dr Phil Rasch of the US-based Pacific Northwest National Laboratory is equally guarded about the role of geo-engineering: ‘I think all of us agree that if we were to end geo-engineering on a given day, then the planet would return to its pre-engineered condition very rapidly, and probably within ten to twenty years. That’s certainly something to worry about.’</p><p><strong>F</strong> The US National Center for Atmospheric Research has already suggested that the proposal to inject sulphur into the atmosphere might affect rainfall patterns across the tropics and the Southern Ocean. ‘Geo-engineering plans to inject stratospheric aerosols or to seed clouds would act to cool the planet, and act to increase the extent of sea ice,’ says Rasch. ‘But all the models suggest some impact on the distribution of precipitation.’</p><p><strong>G</strong> ‘A further risk with geo-engineering projects is that you can “overshoot”,’ says Dr Dan Lunt, from the University of Bristol’s School of Geophysical Sciences, who has studied the likely impacts of the sunshade and aerosol schemes on the climate.</p><p>‘You may bring global temperatures back to pre-industrial levels, but the risk is that the poles will still be warmer than they should be and the tropics will be cooler than before industrialisation.’ To avoid such a scenario,” Hunt says, “Angel’s project would have to operate at half strength; all of which reinforces his view that the best option is to avoid the need for geo-engineering altogether.”</p><p><strong>H</strong> The main reason why geo-engineering is supported by many in the scientific community is that most researchers have little faith in the ability of politicians to agree – and then bring in — the necessary carbon cuts. Even leading conservation organisations see the value of investigating the potential of geo-engineering.</p><p>According to Dr Martin Sommerkorn, climate change advisor for the World Wildlife Fund’s International Arctic Programme, ‘Human-induced climate change has brought humanity to a position where we shouldn’t exclude thinking thoroughly about this topic and its possibilities.’</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 7,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 1–7</h3><p>Complete the sentences below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Indoor farming</p><p>• Some food plants, including 1_______  are already grown indoors.</p><p>• Vertical farms would be located in 2_______ , meaning that there would be less need to take them long distances to customers.</p><p>• Vertical farms could use methane from plants and animals to produce 3_______ </p><p>• The consumption of 4_______  would be cut because agricultural vehicles would be unnecessary.</p><p>• The fact that vertical farms would need 5_______  light is a disadvantage.</p><p>• One form of vertical farming involves planting in 6_______  which are not fixed.</p><p>• The most probable development is that food will be grown on 7_______  in towns and cities.</p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* Some food plants, including 1_______  are already grown indoors.",
            "options": [],
            "answerKey": "tomatoes",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* Vertical farms would be located in 2_______ , meaning that there would be less need to take them long distances to customers.",
            "options": [],
            "answerKey": "urban centres",
            "acceptedAnswers": [
              "urban centres/ centers"
            ]
          },
          {
            "number": 3,
            "prompt": "* Vertical farms could use methane from plants and animals to produce 3_______ ",
            "options": [],
            "answerKey": "energy",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* The consumption of 4_______  would be cut because agricultural vehicles would be unnecessary.",
            "options": [],
            "answerKey": "fossil fuel",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* The fact that vertical farms would need 5_______  light is a disadvantage.",
            "options": [],
            "answerKey": "artificial",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "* One form of vertical farming involves planting in 6_______  which are not fixed.",
            "options": [],
            "answerKey": "stacked trays",
            "acceptedAnswers": [
              "(stacked) trays"
            ]
          },
          {
            "number": 7,
            "prompt": "* The most probable development is that food will be grown on 7_______  in towns and cities.",
            "options": [],
            "answerKey": "urban rooftops",
            "acceptedAnswers": [
              "(urban) rooftops"
            ]
          }
        ]
      },
      {
        "section": 1,
        "from": 8,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 8–13</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 8,
            "prompt": "Methods for predicting the Earth’s population have recently changed.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "Human beings are responsible for some of the destruction to food-producing land.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "The crops produced in vertical farms will depend on the season.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Some damage to food crops is caused by climate change.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Fertilisers will be needed for certain crops in vertical farms.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Vertical farming will make plants less likely to be affected by infectious diseases.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 19,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 14–19</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "The Falkirk Wheel has linked the Forth & Clyde Canal with the Union Canal for the first time in their history.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "There was some opposition to the design of the Falkirk Wheel at first.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "The Falkirk Wheel was initially put together at the location where its components were manufactured.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "The Falkirk Wheel is the only boat lift in the world which has steel sections bolted together by hand.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "The weight of the gondolas varies according to the size of boat being carried.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "The construction of the Falkirk Wheel site took into account the presence of a nearby ancient monument.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 20,
        "to": 26,
        "type": "fill",
        "displayType": "fill-blank",
        "instructionHtml": "<h3>Questions 20–26</h3><p>Label the diagram below.</p><p>Choose ONE WORD from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p style=\"text-align:center;margin:12px 0\"><img src=\"https://pub-c71988294a9b45099e83dad66bb73426.r2.dev/images/migrated/ielts-website/blog/vbqphrvushiwtwxxkdvi.webp\" style=\"max-width:100%;height:auto;border-radius:6px\" alt=\"diagram\" /></p><ul><li>A pair of 20_______ are lifted in order to shut out water from canal basin.</li><li>A 21_______  is taken out, enabling Wheel to rotate.</li></ul><p>Hydraulic motors drive 22_______.</p><ul><li>A range of different-sized 23_______ ensures boat keeps upright</li><li>Boat reaches top Wheel, then moves directly onto  24_______.</li><li>Boat travels through tunnel beneath Roman 25_______.</li><li>26_______ raise boat 11m to level of Union Canal.</li></ul>",
        "questions": [
          {
            "number": 20,
            "prompt": "20. _________",
            "options": [],
            "answerKey": "gates",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "21. _________",
            "options": [],
            "answerKey": "clamp",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "22. _________",
            "options": [],
            "answerKey": "axle",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "23. _________",
            "options": [],
            "answerKey": "cogs",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "24. _________",
            "options": [],
            "answerKey": "aqueduct",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "25. _________",
            "options": [],
            "answerKey": "wall",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "26. _________",
            "options": [],
            "answerKey": "locks",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 29,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 27–29</h3><p>The Reading Passage has eight paragraphs A-H</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "mention of a geo-engineering project based on an earlier natural phenomenon",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "an example of a successful use of geo-engineering",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "a common definition of geo-engineering",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 30,
        "to": 36,
        "type": "fill",
        "displayType": "table-completion",
        "instructionHtml": "<h3>Questions 30–36</h3><p>Complete the table below.</p><p>Choose ONE WORD from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>GEO-ENGINEERING PROJECTS</p><table><tbody><tr><td>Procedure</td><td>Aim</td></tr><tr><td>put a large number of tiny spacecraft into orbit far above Earth</td><td>to create a 30_______  that would reduce the amount of light reaching Earth</td></tr><tr><td>place 31_______  in the sea</td><td>to encourage 32_______  to form</td></tr><tr><td>release aerosol sprays into the stratosphere</td><td>to create 33_______  that would reduce the amount of light reaching Earth</td></tr><tr><td>fix strong 34_______  to Greenland ice sheets</td><td>to prevent icebergs moving into the sea</td></tr><tr><td>plant trees in Russian Arctic that would lose their leaves in winter</td><td>to allow the 35_______  to reflect radiation</td></tr><tr><td>change the direction of 36_______</td><td>to bring more cold water into ice-forming areas</td></tr></tbody></table>",
        "questions": [
          {
            "number": 30,
            "prompt": "put a large number of tiny spacecraft into orbit far above Earth | to create a 30_______  that would reduce the amount of light reaching Earth",
            "options": [],
            "answerKey": "sunshade",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "place 31_______  in the sea | to encourage 32_______  to form",
            "options": [],
            "answerKey": "iron",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "place 31_______  in the sea | to encourage 32_______  to form",
            "options": [],
            "answerKey": "algae",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "release aerosol sprays into the stratosphere | to create 33_______  that would reduce the amount of light reaching Earth",
            "options": [],
            "answerKey": "clouds",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "fix strong 34_______  to Greenland ice sheets | to prevent icebergs moving into the sea",
            "options": [],
            "answerKey": "cables",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "plant trees in Russian Arctic that would lose their leaves in winter | to allow the 35_______  to reflect radiation",
            "options": [],
            "answerKey": "snow",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "change the direction of 36_______  | to bring more cold water into ice-forming areas",
            "options": [],
            "answerKey": "rivers",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 37,
        "to": 40,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Look at the following statements and the list of scientists below.</p><p>Match each statement with the correct scientist, A-D.</p><p>Write the correct letter, A-D, in boxes on your answer sheet.</p>",
        "config": {
          "featureOptions": [
            "Roger Angel",
            "Phil Rasch",
            "Dan Lunt",
            "Martin Sommerkorn"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "The effects of geo-engineering may not be long-lasting.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "Geo-engineering is a topic worth exploring.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "It may be necessary to limit the effectiveness of geo-engineering projects.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Research into non-fossil-based fuels cannot be replaced by geo-engineering.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-11-2",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-11-academic-reading-test-2/",
    "sections": [
      {
        "section": 1,
        "title": "Raising the Mary Rose",
        "contentHtml": "<h2>Raising the Mary Rose</h2><p>How a sixteenth-century warship was recovered from the seabed</p><p>On 19 July 1545, English and French fleets were engaged in a sea battle off the coast of southern England in the area of water called the Solent, between Portsmouth and the Isle of Wight. Among the English vessels was a warship by the name of Mary Rose. Built in Portsmouth some 35 years earlier, she had had a long and successful fighting career, and was a favourite of King Henry VIII.</p><p>Accounts of what happened to the ship vary: while witnesses agree that she was not hit by the French, some maintain that she was outdated, overladen and sailing too low in the water, others that she was mishandled by undisciplined crew. What is undisputed, however, is that the Mary Rose sank into the Solent that day, taking at least 500 men with her. After the battle, attempts were made to recover the ship, but these failed.</p><p>The Mary Rose came to rest on the seabed, lying on her starboard (right) side at an angle of approximately 60 degrees. The hull (the body of the ship) acted as a trap for the sand and mud carried by Solent currents. As a result, the starboard side filled rapidly, leaving the exposed port (left) side to be eroded by marine organisms and mechanical degradation. Because of the way the ship sank, nearly all of the starboard half survived intact.</p><p>During the seventeenth and eighteenth centuries, the entire site became covered with a layer of hard grey clay, which minimised further erosion.</p><p>Then, on 16 June 1836, some fishermen in the Solent found that their equipment was caught on an underwater obstruction, which turned out to be the Mary Rose. Diver John Deane happened to be exploring another sunken ship nearby, and the fishermen approached him, asking him to free their gear. Deane dived down, and found the equipment caught on a timber protruding slightly from the seabed. Exploring further, he uncovered several other timbers and a bronze gun.</p><p>Deane continued diving on the site intermittently until 1840, recovering several more guns, two bows, various timbers, part of a pump and various other small finds.</p><p>The Mary Rose then faded into obscurity for another hundred years. But in 1965, military historian and amateur diver Alexander McKee, in conjunction with the British Sub-Aqua Club, initiated a project called ‘Solent Ships’. While on paper this was a plan to examine a number of known wrecks in the Solent, what McKee really hoped for was to find the Mary Rose. Ordinary search techniques proved unsatisfactory, so McKee entered into collaboration with Harold E.</p><p>Edgerton, professor of electrical engineering at the Massachusetts Institute of Technology. In 1967, Edgerton’s side-scan sonar systems revealed a large, unusually shaped object, which McKee believed was the Mary Rose.</p><p>Further excavations revealed stray pieces of timber and an iron gun. But the climax to the operation came when, on 5 May 1971, part of the ship’s frame was uncovered. McKee and his team now knew for certain that they had found the wreck, but were as yet unaware that it also housed a treasure trove of beautifully preserved artefacts. Interest ^ in the project grew, and in 1979, The Mary Rose Trust was formed, with Prince Charles as its President and Dr Margaret Rule its Archaeological Director.</p><p>The decision whether or not to salvage the wreck was not an easy one, although an excavation in 1978 had shown that it might be possible to raise the hull. While the original aim was to raise the hull if at all feasible, the operation was not given the go-ahead until January 1982, when all the necessary information was available.</p><p>An important factor in trying to salvage the Mary Rose was that the remaining hull was an open shell. This led to an important decision being taken: namely to carry out the lifting operation in three very distinct stages. The hull was attached to a lifting frame via a network of bolts and lifting wires. The problem of the hull being sucked back downwards into the mud was overcome by using 12 hydraulic jacks.</p><p>These raised it a few centimetres over a period of several days, as the lifting frame rose slowly up its four legs. It was only when the hull was hanging freely from the lifting frame, clear of the seabed and the suction effect of the surrounding mud, that the salvage operation progressed to the second stage. In this stage, the lifting frame was fixed to a hook attached to a crane, and the hull was lifted completely clear of the seabed and transferred underwater into the lifting cradle.</p><p>This required precise positioning to locate the legs into the stabbing guides’ of the lifting cradle. The lifting cradle was designed to fit the hull using archaeological survey drawings, and was fitted with air bags to provide additional cushioning for the hull’s delicate timber framework. The third and final stage was to lift the entire structure into the air, by which time the hull was also supported from below.</p><p>Finally, on 11 October 1982, millions of people around the world held their breath as the timber skeleton of the Mary Rose was lifted clear of the water, ready to be returned home to Portsmouth.</p>"
      },
      {
        "section": 2,
        "title": "What destroyed the civilisation of Easter Island?",
        "contentHtml": "<h2>What destroyed the civilisation of Easter Island?</h2><p><strong>A</strong> Easter Island, or Rapu Nui as it is known locally, is home to several hundred ancient human statues – the moai. After this remote Pacific island was settled by the Polynesians, it remained isolated for centuries. All the energy and resources that went into the moai – some of which are ten metres tall and weigh over 7,000 kilos – came from the island itself. Yet when Dutch explorers landed in 1722, they met a Stone Age culture.</p><p>The moai were carved with stone tools, then transported for many kilometres, without the use of animals or wheels, to massive stone platforms. The identity of the moai builders was in doubt until well into the twentieth century. Thor Heyerdahl, the Norwegian ethnographer and adventurer, thought the statues had been created by pre-Inca peoples from Peru. Bestselling Swiss author Erich von Daniken believed they were built by stranded extraterrestrials.</p><p>Modern science – linguistic, archaeological and genetic evidence – has definitively proved the moai builders were Polynesians, but not how they moved their creations. Local folklore maintains that the statues walked, while researchers have tended to assume the ancestors dragged the statues somehow, using ropes and logs.</p><p><strong>B</strong> When the Europeans arrived, Rapa Nui was grassland, with only a few scrawny trees. In the 1970s and 1980s, though, researchers found pollen preserved in lake sediments, which proved the island had been covered in lush palm forests for thousands of years. Only after the Polynesians arrived did those forests disappear. US scientist Jared Diamond believes that the Rapanui people – descendants of Polynesian settlers – wrecked their own environment.</p><p>They had unfortunately settled on an extremely fragile island – dry, cool, and too remote to be properly fertilised by windblown volcanic ash. When the islanders cleared the forests for firewood and farming, the forests didn’t grow back. As trees became scarce and they could no longer construct wooden canoes for fishing, they ate birds. Soil erosion decreased their crop yields. Before Europeans arrived, the Rapanui had descended into civil war and cannibalism, he maintains.</p><p>The collapse of their isolated civilisation, Diamond writes, is a ’worst-case scenario for what may lie ahead of us in our own future’.</p><p><strong>C</strong> The moai, he thinks, accelerated the self-destruction. Diamond interprets them as power displays by rival chieftains who, trapped on a remote little island, lacked other ways of asserting their dominance. They competed by building ever bigger figures. Diamond thinks they laid the moai on wooden sledges, hauled over log rails, but that required both a lot of wood and a lot of people. To feed the people, even more land had to be cleared.</p><p>When the wood was gone and civil war began, the islanders began toppling the moai. By the nineteenth century none were standing.</p><p><strong>D</strong> Archaeologists Terry Hunt of the University of Hawaii and Carl Lipo of California State University agree that Easter Island lost its lush forests and that it was an ‘ecological catastrophe’ – but they believe the islanders themselves weren’t to blame. And the moai certainly weren’t. Archaeological excavations indicate that the Rapanui went to heroic efforts to protect the resources of their wind-lashed, infertile fields.</p><p>They built thousands of circular stone windbreaks and gardened inside them, and used broken volcanic rocks to keep the soil moist. In short, Hunt and Lipo argue, the prehistoric Rapanui were pioneers of sustainable farming.</p><p><strong>E</strong> Hunt and Lipo contend that moai-building was an activity that helped keep the peace between islanders. They also believe that moving the moai required few people and no wood, because they were walked upright. On that issue, Hunt and Lipo say, archaeological evidence backs up Rapanui folklore. Recent experiments indicate that as few as 18 people could, with three strong ropes and a bit of practice, easily manoeuvre a 1,000 kg moai replica a few hundred metres.</p><p>The figures’ fat bellies tilted them forward, and a D-shaped base allowed handlers to roll and rock them side to side.</p><p><strong>F</strong> Moreover, Hunt and Lipo are convinced that the settlers were not wholly responsible for the loss of the island’s trees. Archaeological finds of nuts from the extinct Easter Island palm show tiny grooves, made by the teeth of Polynesian rats. The rats arrived along with the settlers, and in just a few years, Hunt and Lipo calculate, they would have overrun the island.</p><p>They would have prevented the reseeding of the slow-growing palm trees and thereby doomed Rapa Nui’s forest, even without the settlers’ campaign of deforestation. No doubt the rats ate birds’ eggs too. Hunt and Lipo also see no evidence that Rapanui civilisation collapsed when the palm forest did. They think its population grew rapidly and then remained more or less stable until the arrival of the Europeans, who introduced deadly diseases to which islanders had no immunity.</p><p>Then in the nineteenth century slave traders decimated the population, which shrivelled to 111 people by 1877.</p><p><strong>G</strong> Hunt and Lipo’s vision, therefore, is one of an island populated by peaceful and ingenious moai builders and careful stewards of the land, rather than by reckless destroyers ruining their own environment and society. ‘Rather than a case of abject failure, Rapu Nui is an unlikely story of success’, they claim. Whichever is the case, there are surely some valuable lessons which the world at large can learn from the story of Rapa Nui.</p>"
      },
      {
        "section": 3,
        "title": "Neuroaesthetics",
        "contentHtml": "<h2>Neuroaesthetics</h2><p>An emerging discipline called neuroaesthetics is seeking to bring scientific objectivity to the study of art, and has already given us a better understanding of many masterpieces. The blurred imagery of Impressionist paintings seems to stimulate the brain’s amygdala, for instance. Since the amygdala plays a crucial role in our feelings, that finding might explain why many people find these pieces so moving.</p><p>Could the same approach also shed light on abstract twentieth-century pieces, from Mondrian’s geometrical blocks of colour, to Pollock’s seemingly haphazard arrangements of splashed paint on canvas? Sceptics believe that people claim to like such works simply because they are famous. We certainly do have an inclination to follow the crowd.</p><p>When asked to make simple perceptual decisions such as matching a shape to its rotated image, for example, people often choose a definitively wrong answer if they see others doing the same. It is easy to imagine that this mentality would have even more impact on a fuzzy concept like art appreciation, where there is no right or wrong answer.</p><p>Angelina Hawley-Dolan, of Boston College, Massachusetts, responded to this debate by asking volunteers to view pairs of paintings – either the creations of famous abstract artists or the doodles of infants, chimps and elephants. They then had to judge which they preferred. A third of the paintings were given no captions, while many were labelled incorrectly -volunteers might think they were viewing a chimp’s messy brushstrokes when they were actually seeing an acclaimed masterpiece.</p><p>In each set of trials, volunteers generally preferred the work of renowned artists, even when they believed it was by an animal or a child. It seems that the viewer can sense the artist’s vision in paintings, even if they can’t explain why.</p><p>Robert Pepperell, an artist based at Cardiff University, creates ambiguous works that are neither entirely abstract nor clearly representational. In one study, Pepperell and his collaborators asked volunteers to decide how’powerful’they considered an artwork to be, and whether they saw anything familiar in the piece. The longer they took to answer these questions, the more highly they rated the piece under scrutiny, and the greater their neural activity.</p><p>It would seem that the brain sees these images as puzzles, and the harder it is to decipher the meaning, the more rewarding is the moment of recognition.</p><p>And what about artists such as Mondrian, whose paintings consist exclusively of horizontal and vertical lines encasing blocks of colour? Mondrian’s works are deceptively simple, but eye-tracking studies confirm that they are meticulously composed, and that simply rotating a piece radically changes the way we view it. With the originals, volunteers’eyes tended to stay longer on certain places in the image, but with the altered versions they would flit across a piece more rapidly.</p><p>As a result, the volunteers considered the altered versions less pleasurable when they later rated the work.</p><p>In a similar study, Oshin Vartanian of Toronto University asked volunteers to compare original paintings with ones which he had altered by moving objects around within the frame. He found that almost everyone preferred the original, whether it was a Van Gogh still life or an abstract by Miro. Vartanian also found that changing the composition of the paintings reduced activation in those brain areas linked with meaning and interpretation.</p><p>In another experiment, Alex Forsythe of the University of Liverpool analysed the visual intricacy of different pieces of art, and her results suggest that many artists use a key level of detail to please the brain. Too little and the work is boring, but too much results in a kind of ‘perceptual overload’, according to Forsythe.</p><p>What’s more, appealing pieces both abstract and representational, show signs of ‘fractals’ – repeated motifs recurring in different scales, fractals are common throughout nature, for example in the shapes of mountain peaks or the branches of trees. It is possible that our visual system, which evolved in the great outdoors, finds it easier to process such patterns.</p><p>It is also intriguing that the brain appears to process movement when we see a handwritten letter, as if we are replaying the writer’s moment of creation. This has led some to wonder whether Pollock’s works feel so dynamic because the brain reconstructs the energetic actions the artist used as he painted. This may be down to our brain’s ‘mirror neurons’, which are known to mimic others’ actions. The hypothesis will need to be thoroughly tested, however.</p><p>It might even be the case that we could use neuroaesthetic studies to understand the longevity of some pieces of artwork. While the fashions of the time might shape what is currently popular, works that are best adapted to our visual system may be the most likely to linger once the trends of previous generations have been forgotten.</p><p>It’s still early days for the field of neuroaesthetics – and these studies are probably only a taste of what is to come. It would, however, be foolish to reduce art appreciation to a set of scientific laws. We shouldn’t underestimate the importance of the style of a particular artist, their place in history and the artistic environment of their time. Abstract art offers both a challenge and the freedom to play with different interpretations.</p><p>In some ways, it’s not so different to science, where we are constantly looking for systems and decoding meaning so that we can view and appreciate the world in a new way.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 4,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–4</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "There is some doubt about what caused the Mary Rose to sink.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "The Mary Rose was the only ship to sink in the battle of 19 July 1545.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Most of one side of the Mary Rose lay undamaged under the sea.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Alexander McKee knew that the wreck would contain many valuable historical objects.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 5,
        "to": 8,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 5–8</h3><p>Look at the following statements and the list of dates below.</p><p>Match each statement with the correct date, A-G.</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "featureOptions": [
            "1836",
            "1840",
            "1965",
            "1967",
            "1971",
            "1979",
            "1982"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 5,
            "prompt": "A search for the Mary Rose was launched.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "One person’s exploration of the Mary Rose site stopped.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "It was agreed that the hull of the Mary Rose should be raised.",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "The site of the Mary Rose was found by chance.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 13,
        "type": "fill",
        "displayType": "fill-blank",
        "instructionHtml": "<h3>Questions 9–13</h3><p>Label the diagram below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p style=\"text-align:center;margin:12px 0\"><img src=\"https://pub-c71988294a9b45099e83dad66bb73426.r2.dev/images/migrated/ielts-website/blog/l2jdrogds0rmhzdsonsz.webp\" style=\"max-width:100%;height:auto;border-radius:6px\" alt=\"diagram\" /></p><ul><li>9_______ attached to hull by wires</li><li>10_______ to prevent hull being sucked into mud</li><li>legs are placed into 11_______</li><li>hull is lowered into 12_______</li><li>13_______ used as extra protection for the hull</li></ul>",
        "questions": [
          {
            "number": 9,
            "prompt": "9. _________attached to hull by wires",
            "options": [],
            "answerKey": "Lifting frame",
            "acceptedAnswers": [
              "(lifting) frame"
            ]
          },
          {
            "number": 10,
            "prompt": "10. _________  to prevent hull being sucked into mud",
            "options": [],
            "answerKey": "Hydraulic jacks",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "legs are placed into 11. _________",
            "options": [],
            "answerKey": "Stabbing guides",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "hull is lowered into  12. _________",
            "options": [],
            "answerKey": "Lifting cradle",
            "acceptedAnswers": [
              "(lifting) cradle"
            ]
          },
          {
            "number": 13,
            "prompt": "13. _________ used as extra protection for the hull",
            "options": [],
            "answerKey": "Air bags",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 20,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 14–20</h3><p>The Reading Passage has seven paragraphs, A-G.</p><p>Choose the correct heading for each paragraph from the list of headings below.</p><p>Write the correct number, i-ix, in boxes on your answer sheet.</p>",
        "config": {
          "headings": [
            "Evidence of innovative environment management practices",
            "An undisputed answer to a question about the moai",
            "The future of the moai statues",
            "A theory which supports a local belief",
            "The future of Easter Island",
            "Two opposing views about the Rapanui people",
            "Destruction outside the inhabitants’ control",
            "How the statues made a situation worse",
            "Diminishing food resources"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "ii",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "ix",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "viii",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "vii",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "Paragraph G",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 21,
        "to": 24,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 21–24</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Jared Diamond’s View</p><p>Diamond believes that the Polynesian settlers on Rapa Nui destroyed its forests, cutting down its trees for fuel and clearing land for 21_______ . Twentieth-century discoveries of pollen prove that Rapu Nui had once been covered in palm forests, which had turned into grassland by the time the Europeans arrived on the island. When the islanders were no longer able to build the 22_______  they needed to go fishing, they began using the island’s 23_______  as a food source, according to Diamond.</p><p>Diamond also claims that the moai were built to show the power of the island’s chieftains, and that the methods of transporting the statues needed not only a great number of people, but also a great deal of 24_______ .</p>",
        "questions": [
          {
            "number": 21,
            "prompt": "Diamond believes that the Polynesian settlers on Rapa Nui destroyed its forests, cutting down its trees for fuel and clearing land for 21_______ . Twentieth-century discoveries of pollen prove that Rapu Nui had once been covered in palm forests, which had turned into grassland by the time the Europeans arrived on the island. When the islanders were no longer able to build the 22_______  they needed to go fishing, they began using the island’s 23_______  as a food source, according to Diamond.",
            "options": [],
            "answerKey": "farming",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Diamond believes that the Polynesian settlers on Rapa Nui destroyed its forests, cutting down its trees for fuel and clearing land for 21_______ . Twentieth-century discoveries of pollen prove that Rapu Nui had once been covered in palm forests, which had turned into grassland by the time the Europeans arrived on the island. When the islanders were no longer able to build the 22_______  they needed to go fishing, they began using the island’s 23_______  as a food source, according to Diamond.",
            "options": [],
            "answerKey": "canoes",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "Diamond believes that the Polynesian settlers on Rapa Nui destroyed its forests, cutting down its trees for fuel and clearing land for 21_______ . Twentieth-century discoveries of pollen prove that Rapu Nui had once been covered in palm forests, which had turned into grassland by the time the Europeans arrived on the island. When the islanders were no longer able to build the 22_______  they needed to go fishing, they began using the island’s 23_______  as a food source, according to Diamond.",
            "options": [],
            "answerKey": "birds",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "Diamond also claims that the moai were built to show the power of the island’s chieftains, and that the methods of transporting the statues needed not only a great number of people, but also a great deal of 24_______ .",
            "options": [],
            "answerKey": "wood",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 25,
        "to": 26,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 25–26</h3><p>Choose TWO letters, A-E.</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 25,
            "prompt": "On what points do Hunt and Lipo disagree with Diamond?",
            "options": [
              "the period when the moai were created",
              "how the moai were transported",
              "the impact of the moai on Rapanui society",
              "how the moai were carved",
              "the origins of the people who made the moai"
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "C"
            ]
          },
          {
            "number": 26,
            "prompt": "On what points do Hunt and Lipo disagree with Diamond?",
            "options": [
              "the period when the moai were created",
              "how the moai were transported",
              "the impact of the moai on Rapanui society",
              "how the moai were carved",
              "the origins of the people who made the moai"
            ],
            "answerKey": "C",
            "acceptedAnswers": [
              "B"
            ]
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 30,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 27–30</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "In the second paragraph, the writer refers to a shape-matching test in order to illustrate",
            "options": [
              "the subjective nature of art appreciation.",
              "the reliance of modern art on abstract forms.",
              "our tendency to be influenced by the opinions of others.",
              "a common problem encountered when processing visual data."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Angelina Hawley-Dolan’s findings indicate that people",
            "options": [
              "mostly favour works of art which they know well.",
              "hold fixed ideas about what makes a good work of art.",
              "are often misled by their initial expectations of a work of art.",
              "have the ability to perceive the intention behind works of art."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Results of studies involving Robert Pepperell’s pieces suggest that people",
            "options": [
              "can appreciate a painting without fully understanding it.",
              "find it satisfying to work out what a painting represents.",
              "vary widely in the time they spend looking at paintings.",
              "generally prefer representational art to abstract art."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "What do the experiments described in the fifth paragraph suggest about the paintings of Mondrian?",
            "options": [
              "They are more carefully put together than they appear.",
              "They can be interpreted in a number of different ways.",
              "They challenge our assumptions about shape and colour.",
              "They are easier to appreciate than many other abstract works."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 31,
        "to": 33,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 31–33</h3><p>Complete the summary using the list of words, A-H, below.</p><p>Write the correct letters, A-H, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "interpretation",
            "complexity",
            "emotions",
            "movements",
            "skill",
            "layout",
            "concern",
            "images"
          ]
        },
        "questionHtml": "<p>Art and the Brain</p><p>The discipline of neuroaesthetics aims to bring scientific objectivity to the study of art. Neurological studies of the brain, for example, demonstrate the impact which Impressionist paintings have on our 31_______ . Alex Forsythe of the University of Liverpool believes many artists give their works the precise degree of 32_______  which most appeals to the viewer’s brain.</p><p>She also observes that pleasing works of art often contain certain repeated 33_______  which occur frequently in the natural world.</p>",
        "questions": [
          {
            "number": 31,
            "prompt": "The discipline of neuroaesthetics aims to bring scientific objectivity to the study of art. Neurological studies of the brain, for example, demonstrate the impact which Impressionist paintings have on our 31_______ . Alex Forsythe of the University of Liverpool believes many artists give their works the precise degree of 32_______  which most appeals to the viewer’s brain.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "The discipline of neuroaesthetics aims to bring scientific objectivity to the study of art. Neurological studies of the brain, for example, demonstrate the impact which Impressionist paintings have on our 31_______ . Alex Forsythe of the University of Liverpool believes many artists give their works the precise degree of 32_______  which most appeals to the viewer’s brain.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "She also observes that pleasing works of art often contain certain repeated 33_______  which occur frequently in the natural world.",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 34,
        "to": 39,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 34–39</h3><p>Do the following statements agree with the views of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the views of the writer</p><p>NO if the statement contradicts the views of the writer</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 34,
            "prompt": "Forsythe’s findings contradicted previous beliefs on the function of ‘fractals’ in art.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Certain ideas regarding the link between ‘mirror neurons’ and art appreciation require further verification.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "People’s taste in paintings depends entirely on the current artistic trends of the period.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Scientists should seek to define the precise rules which govern people’s reactions to works of art.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "Art appreciation should always involve taking into consideration the cultural context in which an artist worked.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "It is easier to find meaning in the field of science than in that of art.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 40,
        "to": 40,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 40</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in box on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 40,
            "prompt": "What would be the most appropriate subtitle for the article?",
            "options": [
              "Some scientific insights into how the brain responds to abstract art",
              "Recent studies focusing on the neural activity of abstract artists",
              "A comparison of the neurological bases of abstract and representational art",
              "How brain research has altered public opinion about abstract art"
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-11-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-11-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "The story of silk",
        "contentHtml": "<h2>The story of silk</h2><p>The history of the world’s most luxurious fabric, from ancient China to the present day</p><p>Silk is a fine, smooth material produced from the cocoons – soft protective shells – that are made by mulberry silkworms (insect larvae). Legend has it that it was Lei Tzu, wife of the Yellow Emperor, ruler of China in about 3000 BC, who discovered silkworms. One account of the story goes that as she was taking a walk in her husband’s gardens, she discovered that silkworms were responsible for the destruction of several mulberry trees. She collected a number of cocoons and sat down to have a rest.</p><p>It just so happened that while she was sipping some tea, one of the cocoons that she had collected landed in the hot tea and started to unravel into a fine thread. Lei Tzu found that she could wind this thread around her fingers. Subsequently, she persuaded her husband to allow her to rear silkworms on a grove of mulberry trees. She also devised a special reel to draw the fibres from the cocoon into a single thread so that they would be strong enough to be woven into fabric.</p><p>While it is unknown just how much of this is true, it is certainly known that silk cultivation has existed in China for several millennia.</p><p>Originally, silkworm farming was solely restricted to women, and it was they who were responsible for the growing, harvesting and weaving. Silk quickly grew into a symbol of status, and originally, only royalty were entitled to have clothes made of silk. The rules were gradually relaxed over the years until finally during the Qing Dynasty (1644—1911 AD), even peasants, the lowest caste, were also entitled to wear silk.</p><p>Sometime during the Han Dynasty (206 BC-220 AD), silk was so prized that it was also used as a unit of currency. Government officials were paid their salary in silk, and farmers paid their taxes in grain and silk. Silk was also used as diplomatic gifts by the emperor. Fishing lines, bowstrings, musical instruments and paper were all made using silk. The earliest indication of silk paper being used was discovered in the tomb of a noble who is estimated to have died around 168 AD.</p><p>Demand for this exotic fabric eventually created the lucrative trade route now known as the Silk Road, taking silk westward and bringing gold, silver and wool to the East. It was named the Silk Road after its most precious commodity, which was considered to be worth more than gold.</p><p>The Silk Road stretched over 6,000 kilometres from Eastern China to the Mediterranean Sea, following the Great Wall of China, climbing the Pamir mountain range, crossing modern-day Afghanistan and going on to the Middle East, with a major trading market in Damascus. From there, the merchandise was shipped across the Mediterranean Sea. Few merchants travelled the entire route; goods were handled mostly by a series of middlemen.</p><p>With the mulberry silkworm being native to China, the country was the world’s sole producer of silk for many hundreds of years. The secret of silk-making eventually reached the rest of the world via the Byzantine Empire, which ruled over the Mediterranean region of southern Europe, North Africa and the Middle East during the period 330—1453 AD.</p><p>According to another legend, monks working for the Byzantine emperor Justinian smuggle silkworm eggs to Constantinople (Istanbul in modern-day Turkey) in 550 AD, concealed inside hollow bamboo walking canes. The Byzantines were as secretive as the Chinese, however, and for many centuries the weaving and trading of silk fabric was a strict imperial monopoly. Then in the seventh century, the Arabs conquered Persia, capturing their magnificent silks in the process.</p><p>Silk production thus spread through Africa, Sicily and Spain as the Arabs swept, through these lands. Andalusia in southern Spain was Europe’s main silk-producing centre in the tenth century. By the thirteenth century, however, Italy had become Europe’s leader in silk production and export. Venetian merchants traded extensively in silk and encouraged silk growers to settle in Italy. Even now, silk processed in the province of Como in northern Italy enjoys an esteemed reputation.</p><p>The nineteenth century and industrialisation saw the downfall of the European silk industry. Cheaper Japanese silk, trade in which was greatly facilitated by the opening of the Suez Canal, was one of the many factors driving the trend. Then in the twentieth century, new manmade fibres, such as nylon, started to be used in what had traditionally been silk products, such as stockings and parachutes.</p><p>The two world wars, which interrupted the supply of raw material from Japan, also stifled the European silk industry. After the Second World War, Japan’s silk production was restored, with improved production and quality of raw silk. Japan was to remain the world’s biggest producer of raw silk, and practically the only major exporter of raw silk, until the 1970s.</p><p>However, in more recent decades, China has gradually recaptured its position as the world’s biggest producer and exporter of raw silk and silk yarn. Today, around 125,000 metric tons of silk are produced in the world, and almost two thirds of that production takes place in China.</p>"
      },
      {
        "section": 2,
        "title": "Great Migrations",
        "contentHtml": "<h2>Great Migrations</h2><p>Animal migration, however it is defined, is far more than just the movement of animals. It can loosely be described as travel that takes place at regular intervals – often in an annual cycle – that may involve many members of a species, and is rewarded only after a long journey. It suggests inherited instinct. The biologist Hugh Dingle has identified five characteristics that apply, in varying degrees and combinations, to all migrations.</p><p>They are prolonged movements that carry animals outside familiar habitats; they tend to be linear, not zigzaggy; they involve special behaviours concerning preparation (such as overfeeding) and arrival; they demand special allocations of energy. And one more: migrating animals maintain an intense attentiveness to the greater mission, which keeps them undistracted by temptations and undeterred by challenges that would turn other animals aside.</p><p>An arctic tern, on its 20,000 km flight from the extreme south of South America to the Arctic circle, will take no notice of a nice smelly herring offered from a bird-watcher’s boat along the way. While local gulls will dive voraciously for such handouts, the tern flies on. Why? The arctic tern resists distraction because it is driven at that moment by an instinctive sense of something we humans find admirable: larger purpose. In other words, it is determined to reach its destination.</p><p>The bird senses that it can eat, rest and mate later. Right now it is totally focused on the journey; its undivided intent is arrival.</p><p>Reaching some gravelly coastline in the Arctic, upon which other arctic terns have converged, will serve its larger purpose as shaped by evolution: finding a place, a time, and a set of circumstances in which it can successfully hatch and rear offspring.</p><p>But migration is a complex issue, and biologists define it differently, depending in part on what sorts of animals they study. Joel Berger, of the University of Montana, who works on the American pronghorn and other large terrestrial mammals, prefers what he calls a simple, practical definition suited to his beasts: ‘movements from a seasonal home area away to another home area and back again’.</p><p>Generally the reason for such seasonal back-and-forth movement is to seek resources that aren’t available within a single area year-round.</p><p>But daily vertical movements by zooplankton in the ocean – upward by night to seek food, downward by day to escape predators – can also be considered migration. So can the movement of aphids when, having depleted the young leaves on one food plant, their offspring then fly onward to a different host plant, with no one aphid ever returning to where it started.</p><p>Dingle is an evolutionary biologist who studies insects. His definition is more intricate than Berger’s, citing those five features that distinguish migration from other forms of movement. They allow for the fact that, for example, aphids will become sensitive to blue light (from the sky) when it’s time for takeoff on their big journey, and sensitive to yellow light (reflected from tender young leaves) when it’s appropriate to land.</p><p>Birds will fatten themselves with heavy feeding in advance of a long migrational flight. The value of his definition, Dingle argues, is that it focuses attention on what the phenomenon of wildebeest migration shares with the phenomenon of the aphids, and therefore helps guide researchers towards understanding how evolution has produced them all.</p><p>Human behaviour, however, is having a detrimental impact on animal migration. The pronghorn, which resembles an antelope, though they are unrelated, is the fastest land mammal of the New World. One population, which spends the summer in the mountainous Grand Teton National Park of the western USA, follows a narrow route from its summer range in the mountains, across a river, and down onto the plains. Here they wait out the frozen months, feeding mainly on sagebrush blown clear of snow.</p><p>These pronghorn are notable for the invariance of their migration route and the severity of its constriction at three bottlenecks. If they can’t pass through each of the three during their spring migration, they can’t reach their bounty of summer grazing; if they can’t pass through again in autumn, escaping south onto those windblown plains, they are likely to die trying to overwinter in the deep snow.</p><p>Pronghorn, dependent on distance vision and speed to keep safe from predators, traverse high, open shoulders of land, where they can see and run. At one of the bottlenecks, forested hills rise to form a V, leaving a corridor of open ground only about 150 metres wide, filled with private homes. Increasing development is leading toward a crisis for the pronghorn, threatening to choke off their passageway.</p><p>Conservation scientists, along with some biologists and land managers within the USA’s National Park Service and other agencies, are now working to preserve migrational behaviours, not just species and habitats. A National Forest has recognised the path of the pronghorn, much of which passes across its land, as a protected migration corridor. But neither the Forest Service nor the Park Service can control what happens on private land at a bottleneck.</p><p>And with certain other migrating species, the challenge is complicated further – by vastly greater distances traversed, more jurisdictions, more borders, more dangers along the way. We will require wisdom and resoluteness to ensure that migrating species can continue their journeying a while longer.</p>"
      },
      {
        "section": 3,
        "title": "Preface to ‘How the other half thinks: Adventures in mathematical reasoning’",
        "contentHtml": "<h2>Preface to ‘How the other half thinks: Adventures in mathematical reasoning’</h2><p><strong>A</strong> Occasionally, in some difficult musical compositions, there are beautiful, but easy parts – parts so simple a beginner could play them. So it is with mathematics as well. There are some discoveries in advanced mathematics that do not depend on specialized knowledge, not even on algebra, geometry, or trigonometry. Instead they may involve, at most, a little arithmetic, such as ‘the sum of two odd numbers is even’, and common sense. Each of the eight chapters in this book illustrates this phenomenon.</p><p>Anyone can understand every step in the reasoning.</p><p>The thinking in each chapter uses at most only elementary arithmetic, and sometimes not even that. Thus all readers will have the chance to participate in a mathematical experience, to appreciate the beauty of mathematics, and to become familiar with its logical, yet intuitive, style of thinking.</p><p><strong>B</strong> One of my purposes in writing this book is to give readers who haven’t had the opportunity to see and enjoy real mathematics the chance to appreciate the mathematical way of thinking. I want to reveal not only some of the fascinating discoveries, but, more importantly, the reasoning behind them.</p><p>In that respect, this book differs from most books on mathematics written for the general public. Some present the lives of colorful mathematicians. Others describe important applications of mathematics. Yet others go into mathematical procedures, but assume that the reader is adept in using algebra.</p><p><strong>C</strong> I hope this book will help bridge that notorious gap that separates the two cultures: the humanities and the sciences, or should I say the right brain (intuitive) and the left brain (analytical, numerical). As the chapters will illustrate, mathematics is not restricted to the analytical and numerical; intuition plays a significant role. The alleged gap can be narrowed or completely overcome by anyone, in part because each of us is far from using the full capacity of either side of the brain.</p><p>To illustrate our human potential, I cite a structural engineer who is an artist, an electrical engineer who is an opera singer, an opera singer who published mathematical research, and a mathematician who publishes short stories.</p><p><strong>D</strong> Other scientists have written books to explain their fields to non-scientists, but have necessarily had to omit the mathematics, although it provides the foundation of their theories. The reader must remain a tantalized spectator rather than an involved participant, since the appropriate language for describing the details in much of science is mathematics, whether the subject is expanding universe, subatomic particles, or chromosomes.</p><p>Though the broad outline of a scientific theory can be sketched intuitively, when a part of the physical universe is finally understood, its description often looks like a page in a mathematics text.</p><p><strong>E</strong> Still, the non-mathematical reader can go far in understanding mathematical reasoning. This book presents the details that illustrate the mathematical style of thinking, which involves sustained, step-by-step analysis, experiments, and insights. You will turn these pages much more slowly than when reading a novel or a newspaper. It may help to have a pencil and paper ready to check claims and carry out experiments.</p><p><strong>F</strong> As I wrote, I kept in mind two types of readers: those who enjoyed mathematics until they were turned off by an unpleasant episode, usually around fifth grade, and mathematics aficionados, who will find much that is new throughout the book.</p><p>This book also serves readers who simply want to sharpen their analytical skills. Many careers, such as law and medicine, require extended, precise analysis. Each chapter offers practice in following a sustained and closely argued line of thought. That mathematics can develop this skill is shown by these two testimonials:</p><p><strong>G</strong> A physician wrote, ‘The discipline of analytical thought processes [in mathematics] prepared me extremely well for medical school. In medicine one is faced with a problem which must be thoroughly analyzed before a solution can be found. The process is similar to doing mathematics.’</p><p>A lawyer made the same point, “Although I had no background in law – not even one political science course — I did well at one of the best law schools. I attribute much of my success there to having learned, through the study of mathematics, and, in particular, theorems, how to analyze complicated principles. Lawyers who have studied mathematics can master the legal principles in a way that most others cannot.’</p><p>I hope you will share my delight in watching as simple, even naive, questions lead to remarkable solutions and purely theoretical discoveries find unanticipated applications.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 9,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–9</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>THE STORY OF SILK</p><p>Early silk production in China</p><p>• Around 3000 BC, according to legend:</p><p>• * silkworm cocoon fell into emperor’s wife’s 1_______ </p><p>• emperor’s wife invented a 2_______  to pull out silk fibres</p><p>• Only 3_______  were allowed to produce silk</p><p>• Only 4_______  were allowed to wear silk</p><p>• Silk used as a form of 5_______ </p><p>• * e.g. farmers’ taxes consisted partly of silk</p><p>• Silk used for many purposes</p><p>• * e.g. evidence found of 6_______  made from silk around 168 AD</p><p>Silk reaches rest of world</p><p>• Merchants use Silk Road to take silk westward and bring back 7_______  and precious metals</p><p>• 550 AD: 8_______  hide silkworm eggs in canes and take them to Constantinople</p><p>• Silk production spreads across Middle East and Europe</p><p>• 20th century: 9_______  and other manmade fibres cause decline in silk production</p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* * silkworm cocoon fell into emperor’s wife’s 1_______ ",
            "options": [],
            "answerKey": "tea",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* emperor’s wife invented a 2_______  to pull out silk fibres",
            "options": [],
            "answerKey": "reel",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "* Only 3_______  were allowed to produce silk",
            "options": [],
            "answerKey": "women",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* Only 4_______  were allowed to wear silk",
            "options": [],
            "answerKey": "royalty",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* Silk used as a form of 5_______ ",
            "options": [],
            "answerKey": "currency",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "* * e.g. evidence found of 6_______  made from silk around 168 AD",
            "options": [],
            "answerKey": "paper",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "* Merchants use Silk Road to take silk westward and bring back 7_______  and precious metals",
            "options": [],
            "answerKey": "wool",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "* 550 AD: 8_______  hide silkworm eggs in canes and take them to Constantinople",
            "options": [],
            "answerKey": "monks",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "* 20th century: 9_______  and other manmade fibres cause decline in silk production",
            "options": [],
            "answerKey": "nylon",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 10,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 10–13</h3><p>Do the following statements agree with the information in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 10,
            "prompt": "Gold was the most valuable material transported along the Silk Road.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Most tradesmen only went along certain sections of the Silk Road.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "The Byzantines spread the practice of silk production across the West.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Silk yarn makes up the majority of silk currently exported from China.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 18,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 14–18</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "Local gulls and migrating arctic terns behave in the same way when offered food.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "Experts’ definitions of migration tend to vary according to their area of study.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Very few experts agree that the movement of aphids can be considered migration.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "Aphids’ journeys are affected by changes in the light that they perceive.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "Dingles aim is to distinguish between the migratory behaviours of different species.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 22,
        "type": "matching",
        "displayType": "sentence-ending",
        "instructionHtml": "<h3>Questions 19–22</h3><p>Complete each sentence with the correct ending, A-G, below.</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "sentenceEndings": [
            "be discouraged by difficulties.",
            "travel on open land where they can look out for predators.",
            "eat more than they need for immediate purposes.",
            "be repeated daily.",
            "ignore distractions.",
            "be governed by the availability of water.",
            "follow a straight line."
          ]
        },
        "questionHtml": "<p>• According to Dingle, migratory routes are likely to 19_______ </p><p>• To prepare for migration, animals are likely to 20_______ </p><p>• During migration, animals are unlikely to 21_______ </p><p>• Arctic terns illustrate migrating animals’ ability to 22_______ </p>",
        "questions": [
          {
            "number": 19,
            "prompt": "• According to Dingle, migratory routes are likely to 19_______ ",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "• To prepare for migration, animals are likely to 20_______ ",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "• During migration, animals are unlikely to 21_______ ",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "• Arctic terns illustrate migrating animals’ ability to 22_______ ",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 26,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 23–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The migration of pronghorns</p><p>Pronghorns rely on their eyesight and 23_______  to avoid predators. One particular population’s summer habitat is a national park, and their winter home is on the 24_______  where they go to avoid the danger presented by the snow at that time of year. However, their route between these two areas contains three 25_______ . One problem is the construction of new homes in a narrow 26_______  of land on the pronghorns’ route.</p>",
        "questions": [
          {
            "number": 23,
            "prompt": "Pronghorns rely on their eyesight and 23_______  to avoid predators. One particular population’s summer habitat is a national park, and their winter home is on the 24_______  where they go to avoid the danger presented by the snow at that time of year. However, their route between these two areas contains three 25_______ . One problem is the construction of new homes in a narrow 26_______  of land on the pronghorns’ route.",
            "options": [],
            "answerKey": "speed",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "Pronghorns rely on their eyesight and 23_______  to avoid predators. One particular population’s summer habitat is a national park, and their winter home is on the 24_______  where they go to avoid the danger presented by the snow at that time of year. However, their route between these two areas contains three 25_______ . One problem is the construction of new homes in a narrow 26_______  of land on the pronghorns’ route.",
            "options": [],
            "answerKey": "plains",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "Pronghorns rely on their eyesight and 23_______  to avoid predators. One particular population’s summer habitat is a national park, and their winter home is on the 24_______  where they go to avoid the danger presented by the snow at that time of year. However, their route between these two areas contains three 25_______ . One problem is the construction of new homes in a narrow 26_______  of land on the pronghorns’ route.",
            "options": [],
            "answerKey": "bottlenecks",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "Pronghorns rely on their eyesight and 23_______  to avoid predators. One particular population’s summer habitat is a national park, and their winter home is on the 24_______  where they go to avoid the danger presented by the snow at that time of year. However, their route between these two areas contains three 25_______ . One problem is the construction of new homes in a narrow 26_______  of land on the pronghorns’ route.",
            "options": [],
            "answerKey": "corridor",
            "acceptedAnswers": [
              "corridor/ passageway"
            ]
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 34,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 27–34</h3><p>The Reading Passage has seven sections, A-G.</p><p>Which section contains the following information?</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "a reference to books that assume a lack of mathematical knowledge",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "the way in which this is not a typical book about mathematics",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "personal examples of being helped by mathematics",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "examples of people who each had abilities that seemed incompatible",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "mention of different focuses of books about mathematics",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "a contrast between reading this book and reading other kinds of publication",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "a claim that the whole of the book is accessible to everybody",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "a reference to different categories of intended readers of this book",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 35,
        "to": 40,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 35–40</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• Some areas of both music and mathematics are suitable for someone who is a 35_______ </p><p>• It is sometimes possible to understand advanced mathematics using no more than a limited knowledge of 36_______ </p><p>• The writer intends to show that mathematics requires 37_______  thinking, as well as analytical skills.</p><p>• Some books written by 38_______  have had to leave out the mathematics that is central to their theories.</p><p>• The writer advises non-mathematical readers to perform 39_______  while reading</p><p>• A lawyer found that studying 40_______  helped even more than other areas of mathematics in the study of law.</p>",
        "questions": [
          {
            "number": 35,
            "prompt": "* Some areas of both music and mathematics are suitable for someone who is a 35_______ ",
            "options": [],
            "answerKey": "beginner",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "* It is sometimes possible to understand advanced mathematics using no more than a limited knowledge of 36_______ ",
            "options": [],
            "answerKey": "arithmetic",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "* The writer intends to show that mathematics requires 37_______  thinking, as well as analytical skills.",
            "options": [],
            "answerKey": "intuitive",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "* Some books written by 38_______  have had to leave out the mathematics that is central to their theories.",
            "options": [],
            "answerKey": "scientists",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "* The writer advises non-mathematical readers to perform 39_______  while reading",
            "options": [],
            "answerKey": "experiments",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "* A lawyer found that studying 40_______  helped even more than other areas of mathematics in the study of law.",
            "options": [],
            "answerKey": "theorems",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-11-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-11-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "Research using twins",
        "contentHtml": "<h2>Research using twins</h2><p>To biomedical researchers all over the world, twins offer a precious opportunity to untangle the influence of genes and the environment – of nature and nurture. Because identical twins come from a single fertilized egg that splits into two, they share virtually the same genetic code. Any differences between them -one twin having younger looking skin, for example – must be due to environmental factors such as less time spent in the sun.</p><p>Alternatively, by comparing the experiences of identical twins with those of fraternal twins, who come from separate eggs and share on average half their DNA, researchers can quantify the extent to which our genes affect our lives. If identical twins are more similar to each other with respect to an ailment than fraternal twins are, then vulnerability to the disease must be rooted at least in part in heredity.</p><p>These two lines of research – studying the differences between identical twins to pinpoint the influence of environment, and comparing identical twins with fraternal ones to measure the role of inheritance – have been crucial to understanding the interplay of nature and nurture in determining our personalities, behavior, and vulnerability to disease.</p><p>The idea of using twins to measure the influence of heredity dates back to 1875, when the English scientist Francis Galton first suggested the approach (and coined the phrase ‘nature and nurture’). But twin studies took a surprising twist in the 1980s, with the arrival of studies into identical twins who had been separated at birth and reunited as adults. Over two decades 137 sets of twins eventually visited Thomas Bouchard’s lab in what became known as the Minnesota Study of Twins Reared Apart.</p><p>Numerous tests were carried out on the twins, and they were each asked more than 15,000 questions.</p><p>Bouchard and his colleagues used this mountain of data to identify how far twins were affected by their genetic makeup. The key to their approach was a statistical concept called heritability. In broad terms, the heritability of a trait measures the extent to which differences among members of a population can be explained by differences in their genetics. And wherever Bouchard and other scientists looked, it seemed, they found the invisible hand of genetic influence helping to shape our lives.</p><p>Lately, however, twin studies have helped lead scientists to a radical new conclusion: that nature and nurture are not the only elemental forces at work. According to a recent field called epigenetics, there is a third factor also in play, one that in some cases serves as a bridge between the environment and our genes, and in others operates on its own to shape who we are.</p><p>Epigenetic processes are chemical reactions tied to neither nature nor nurture but representing what researchers have called a ‘third component’. These reactions influence how our genetic code is expressed: how each gene is strengthened or weakened, even turned on or off, to build our bones, brains and all the other parts of our bodies.</p><p>If you think of our DNA as an immense piano keyboard and our genes as the keys – each key symbolizing a segment of DNA responsible for a particular note, or trait, and all the keys combining to make us who we are – then epigenetic processes determine when and how each key can be struck, changing the tune being played.</p><p>One way the study of epigenetics is revolutionizing our understanding of biology is by revealing a mechanism by which the environment directly impacts on genes. Studies of animals, for example, have shown that when a rat experiences stress during pregnancy, it can cause epigenetic changes in a fetus that lead to behavioral problems as the rodent grows up.</p><p>Other epigenetic processes appear to occur randomly, while others are normal, such as those that guide embryonic cells as they become heart, brain, or liver cells, for example.</p><p>Geneticist Danielle Reed has worked with many twins over the years and thought deeply about what twin studies have taught us. ‘It’s very clear when you look at twins that much of what they share is hardwired,’ she says. ‘Many things about them are absolutely the same and unalterable. But it’s also clear, when you get to know them, that other things about them are different. Epigenetics is the origin of a lot of those differences, in my view.’</p><p>Reed credits Thomas Bouchard’s work for today’s surge in twin studies. ‘He was the trailblazer,’ she says. ‘We forget that 50 years ago things like heart disease were thought to be caused entirely by lifestyle. Schizophrenia was thought to be due to poor mothering. Twin studies have allowed us to be more reflective about what people are actually born with and what’s caused by experience.’</p><p>Having said that, Reed adds, the latest work in epigenetics promises to take our understanding even further. ‘What I like to say is that nature writes some things in pencil and some things in pen,’ she says. ‘Things written in pen you can’t change. That’s DNA. But things written in pencil you can. That’s epigenetics. Now that we’re actually able to look at the DNA and see where the pencil writings are, it’s sort of a whole new world.’</p>"
      },
      {
        "section": 2,
        "title": "An Introduction to Film Sound",
        "contentHtml": "<h2>An Introduction to Film Sound</h2><p>Though we might think of film as an essentially visual experience, we really cannot afford to underestimate the importance of film sound. A meaningful sound track is often as complicated as the image on the screen, and is ultimately just as much the responsibility of the director. The entire sound track consists of three essential ingredients: the human voice, sound effects and music. These three tracks must be mixed and balanced so as to produce the necessary emphases which in turn create desired effects.</p><p>Topics which essentially refer to the three previously mentioned tracks are discussed below. They include dialogue, synchronous and asynchronous sound effects, and music.</p><p>Let us start with dialogue. As is the case with stage drama, dialogue serves to tell the story and expresses feelings and motivations of characters as well. Often with film characterization the audience perceives little or no difference between the character and the actor. Thus, for example, the actor Humphrey Bogart is the character Sam Spade; film personality and life personality seem to merge. Perhaps this is because the very texture of a performer’s voice supplies an element of character.</p><p>When voice textures fit the performer’s physiognomy and gestures, a whole and very realistic persona emerges. The viewer sees not an actor working at his craft, but another human being struggling with life. It is interesting to note that how dialogue is used and the very amount of dialogue used varies widely among films. For example, in the highly successful science-fiction film 2001, little dialogue was evident, and most of it was banal and of little intrinsic interest.</p><p>In this way the film-maker was able to portray what Thomas Sobochack and Vivian Sobochack call, in An Introduction to Film, the ‘inadequacy of human responses when compared with the magnificent technology created by man and the visual beauties of the universe’.</p><p>The comedy Bringing Up Baby, on the other hand, presents practically non-stop dialogue delivered at breakneck speed. This use of dialogue underscores not only the dizzy quality of the character played by Katherine Hepburn, but also the absurdity of the film itself and thus its humor. The audience is bounced from gag to gag and conversation to conversation; there is no time for audience reflection. The audience is caught up in a whirlwind of activity in simply managing to follow the plot.</p><p>This film presents pure escapism – largely due to its frenetic dialogue.</p><p>Synchronous sound effects are those sounds which are synchronized or matched with what is viewed. For example, if the film portrays a character playing the piano, the sounds of the piano are projected. Synchronous sounds contribute to the realism of film and also help to create a particular atmosphere. For example, the ‘click’ of a door being opened may simply serve to convince the audience that the image portrayed is real, and the audience may only subconsciously note the expected sound.</p><p>However, if the ‘click’ of an opening door is part of an ominous action such as a burglary, the sound mixer may call attention to the ‘click’ with an increase in volume; this helps to engage the audience in a moment of suspense.</p><p>Asynchronous sound effects, on the other hand, are not matched with a visible source of the sound on screen. Such sounds are included so as to provide an appropriate emotional nuance, and they may also add to the realism of the film. For example, a film-maker might opt to include the background sound of an ambulance’s siren while the foreground sound and image portrays an arguing couple.</p><p>The asynchronous ambulance siren underscores the psychic injury incurred in the argument; at the same time the noise of the siren adds to the realism of the film by acknowledging the film’s city setting.</p><p>We are probably all familiar with background music in films, which has become so ubiquitous as to be noticeable in its absence. We are aware that it is used to add emotion and rhythm. Usually not meant to be noticeable, it often provides a tone or an emotional attitude toward the story and /or the characters depicted. In addition, background music often foreshadows a change in mood. For example, dissonant music may be used in film to indicate an approaching (but not yet visible) menace or disaster.</p><p>Background music may aid viewer understanding by linking scenes. For example, a particular musical theme associated with an individual character or situation may be repeated at various points in a film in order to remind the audience of salient motifs or ideas.</p><p>Film sound comprises conventions and innovations. We have come to expect an acceleration of music during car chases and creaky doors in horror films. Yet, it is important to note as well that sound is often brilliantly conceived. The effects of sound are often largely subtle and often are noted by only our subconscious minds. We need to foster an awareness of film sound as well as film space so as to truly appreciate an art form that sprang to life during the twentieth century – the modern film.</p>"
      },
      {
        "section": 3,
        "title": "‘This Marvellous Invention’",
        "contentHtml": "<h2>‘This Marvellous Invention’</h2><p><strong>A</strong> Of all mankind’s manifold creations, language must take pride of place. Other inventions -the wheel, agriculture, sliced bread – may have transformed our material existence, but the advent of language is what made us human. Compared to language, all other inventions pale in significance, since everything we have ever achieved depends on language and originates from it. Without language, we could never have embarked on our ascent to unparalleled power over all other animals, and even over nature itself.</p><p><strong>B</strong> But language is foremost not just because it came first.</p><p>In its own right it is a tool of extraordinary sophistication, yet based on an idea of ingenious simplicity: ‘this marvellous invention of composing out of twenty-five or thirty sounds that infinite variety of expressions which, whilst having in themselves no likeness to what is in our mind, allow us to disclose to others its whole secret, and to make known to those who cannot penetrate it all that we imagine, and all the various stirrings of our soul’ This was how, in 1660, the renowned French grammarians of the Port-Royal abbey near Versailles distilled the essence of language, and no one since has celebrated more eloquently the magnitude of its achievement.</p><p>Even so, there is just one flaw in all these hymns of praise, for the homage to languages unique accomplishment conceals a simple yet critical incongruity. Language is mankind's greatest invention – except, of course, that it was never invented. This apparent paradox is at the core of our fascination with language, and it holds many of its secrets.</p><p><strong>C</strong> Language often seems so skillfully drafted that one can hardly imagine it as anything other than the perfected handiwork of a master craftsman. How else could this instrument make so much out of barely three dozen measly morsels of sound? In themselves, these configurations of mouth p,f,b,v,t,d,k,g,sh,a,e and so on – amount to nothing more than a few haphazard spits and splutters, random noises with no meaning, no ability to express, no power to explain.</p><p>But run them through the cogs and wheels of the language machine, let it arrange them in some very special orders, and there is nothing that these meaningless streams of air cannot do: from sighing the interminable boredom of existence to unravelling the fundamental order of the universe.</p><p><strong>D</strong> The most extraordinary thing about language, however, is that one doesn’t have to be a genius to set its wheels in motion. The language machine allows just about everybody from pre-modern foragers in the subtropical savannah, to post-modern philosophers in the suburban sprawl – to tie these meaningless sounds together into an infinite variety of subtle senses, and all apparently without the slightest exertion.</p><p>Yet it is precisely this deceptive ease which makes language a victim of its own success, since in everyday life its triumphs are usually taken for granted. The wheels of language run so smoothly that one rarely bothers to stop and think about all the resourcefulness and expertise that must have gone into making it tick. Language conceals art.</p><p><strong>E</strong> Often, it is only the estrangement of foreign tongues, with their many exotic and outlandish features, that brings home the wonder of languages design. One of the showiest stunts that some languages can pull off is an ability to build up words of breath-breaking length, and thus express in one word what English takes a whole sentence to say. The Turkish word çehirliliçtiremediklerimizdensiniz, to take one example, means nothing less than ‘you are one of those whom we can’t turn into a town-dweller’.</p><p>(In case you were wondering, this monstrosity really is one word, not merely many different words squashed together – most of its components cannot even stand up on their own.)</p><p><strong>F</strong> And if that sounds like some one-off freak, then consider Sumerian, the language spoken on the banks of the Euphrates some 5,000 years ago by the people who invented writing and thus enabled the documentation of history. A Sumerian word like munintuma’a (‘when he had made it suitable for her’) might seem rather trim compared to the Turkish colossus above. What is so impressive about it, however, is not its lengthiness but rather the reverse – the thrifty compactness of its construction.</p><p>The word is made up of different slots, each corresponding to a particular portion of meaning. This sleek design allows single sounds to convey useful information, and in fact even the absence of a sound has been enlisted to express something specific. If you were to ask which bit in the Sumerian word corresponds to the pronoun ‘it’ in the English translation ‘when he had made it suitable for her’, then the answer would have to be nothing.</p><p>Mind you, a very particular kind of nothing: the nothing that stands in the empty slot in the middle. The technology is so fine-tuned then that even a non-sound, when carefully placed in a particular position, has been invested with a specific function. Who could possibly have come up with such a nifty contraption?</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 4,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–4</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "There may be genetic causes for the differences in how young the skin of identical twins looks.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Twins are at greater risk of developing certain illnesses than non-twins.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Bouchard advertised in newspapers for twins who had been separated at birth.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Epigenetic processes are different from both genetic and environmental processes.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 5,
        "to": 9,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 5–9</h3><p>Look at the following statements and the list of researchers below.</p><p>Match each statement with the correct researcher, A, B or C.</p><p>Write the correct letter, A, B or C, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Francis Galton",
            "Thomas Bouchard",
            "Danielie Reed"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 5,
            "prompt": "invented a term used to distinguish two factors affecting human characteristics",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "expressed the view that the study of epigenetics will increase our knowledge",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "developed a mathematical method of measuring genetic influences",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "pioneered research into genetics using twins",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "carried out research into twins who had lived apart",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 10,
        "to": 13,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 10–13</h3><p>Complete the summary using the list of words, A-F, below.</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "nurture",
            "organs",
            "code",
            "chemicals",
            "environment",
            "behaviour/behavior"
          ]
        },
        "questionHtml": "<p>Epigenetic processes</p><p>In epigenetic processes, 10_______  influence the activity of our genes, for example in creating our internal 11_______ . The study of epigenetic processes is uncovering a way in which our genes can be affected by our 12_______ . One example is that if a pregnant rat suffers stress, the new-born rat may later show problems in its 13_______ </p>",
        "questions": [
          {
            "number": 10,
            "prompt": "In epigenetic processes, 10_______  influence the activity of our genes, for example in creating our internal 11_______ . The study of epigenetic processes is uncovering a way in which our genes can be affected by our 12_______ . One example is that if a pregnant rat suffers stress, the new-born rat may later show problems in its 13_______ ",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "In epigenetic processes, 10_______  influence the activity of our genes, for example in creating our internal 11_______ . The study of epigenetic processes is uncovering a way in which our genes can be affected by our 12_______ . One example is that if a pregnant rat suffers stress, the new-born rat may later show problems in its 13_______ ",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "In epigenetic processes, 10_______  influence the activity of our genes, for example in creating our internal 11_______ . The study of epigenetic processes is uncovering a way in which our genes can be affected by our 12_______ . One example is that if a pregnant rat suffers stress, the new-born rat may later show problems in its 13_______ ",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "In epigenetic processes, 10_______  influence the activity of our genes, for example in creating our internal 11_______ . The study of epigenetic processes is uncovering a way in which our genes can be affected by our 12_______ . One example is that if a pregnant rat suffers stress, the new-born rat may later show problems in its 13_______ ",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 18,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 14–18</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "In the first paragraph, the writer makes a point that",
            "options": [
              "the director should plan the sound track at an early stage in filming.",
              "it would be wrong to overlook the contribution of sound to the artistry of films.",
              "the music industry can have a beneficial influence on sound in film.",
              "it is important for those working on the sound in a film to have sole responsibility for it."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "One reason that the writer refers to Humphrey Bogart is to exemplify",
            "options": [
              "the importance of the actor and the character appearing to have similar personalities.",
              "the audience’s wish that actors are visually appropriate for their roles.",
              "the value of the actor having had similar feelings to the character.",
              "the audience’s preference for dialogue to be as authentic as possible."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "In the third paragraph, the writer suggests that",
            "options": [
              "audiences are likely to be critical of film dialogue that does not reflect their own experience.",
              "film dialogue that appears to be dull may have a specific purpose.",
              "filmmakers vary considerably in the skill with which they handle dialogue.",
              "the most successful films are those with dialogue of a high Quality."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "What does the writer suggest about Bringing Up",
            "options": [
              "The plot suffers from the filmmaker’s wish to focus on humorous dialogue.",
              "The dialogue helps to make it one of the best comedy films ever produced.",
              "There is a mismatch between the speed of the dialogue and the speed of actions.",
              "The nature of the dialogue emphasises key elements of the film."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "The writer refers to the ‘click’ of a door to make the point that realistic sounds",
            "options": [
              "are often used to give the audience a false impression of events in the film.",
              "may be interpreted in different ways by different members of the audience.",
              "may be modified in order to manipulate the audience’s response to the film.",
              "tend to be more significant in films presenting realistic situations."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 23,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 19–23</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 19,
            "prompt": "Audiences are likely to be surprised if a film lacks background music.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "Background music may anticipate a development in a film.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "Background music has more effect on some people than on others.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Background music may help the audience to make certain connections within the film.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "Audiences tend to be aware of how the background music is affecting them.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 24,
        "to": 26,
        "type": "matching",
        "displayType": "sentence-ending",
        "instructionHtml": "<h3>Questions 24–26</h3><p>Complete each sentence with the correct letter below.</p><p>Write the correct letter, A-E, in boxeson your answer sheet.</p>",
        "config": {
          "sentenceEndings": [
            "when the audience listens to the dialogue.",
            "if the film reflects the audience’s own concerns.",
            "if voice, sound and music are combined appropriately.",
            "when the director is aware of how the audience will respond.",
            "when the actor s appearance, voice and moves are consistent with each other."
          ]
        },
        "questionHtml": "<p>• The audience’s response to different parts of a film can be controlled 24_______ </p><p>• The feelings and motivations of characters become clear 25_______ </p><p>• A character seems to be a real person rather than an actor 26_______ </p>",
        "questions": [
          {
            "number": 24,
            "prompt": "• The audience’s response to different parts of a film can be controlled 24_______ ",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "• The feelings and motivations of characters become clear 25_______ ",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "• A character seems to be a real person rather than an actor 26_______ ",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 32,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 27–32</h3><p>The Reading Passage has six paragraphs, A-F.</p><p>Choose the correct heading for paragraphs A-F from the list of headings below.</p><p>Write the correct number, i-vii, in boxes on your answer sheet.</p>",
        "config": {
          "headings": [
            "Differences between languages highlight their impressiveness",
            "The way in which a few sounds are organised to convey a huge range of meaning",
            "Why the sounds used in different languages are not identical",
            "Apparently incompatible characteristics of language",
            "Even silence can be meaningful",
            "Why language is the most important invention of all",
            "The universal ability to use language"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "ii",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "vii",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "v",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 33,
        "to": 36,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 33–36</h3><p>Complete the summary using the list of words, A-G, below.</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "difficult",
            "complex",
            "original",
            "admired",
            "material",
            "easy",
            "fundamental"
          ]
        },
        "questionHtml": "<p>The importance of language</p><p>The wheel is one invention that has had a major impact on 33_______  aspects of life, but no impact has been as 34_______  as that of language. Language is very 35_______ , yet composed of just a small number of sounds.</p><p>Language appears to be 36_______  to use. However, its sophistication is often overlooked.</p>",
        "questions": [
          {
            "number": 33,
            "prompt": "The wheel is one invention that has had a major impact on 33_______  aspects of life, but no impact has been as 34_______  as that of language. Language is very 35_______ , yet composed of just a small number of sounds.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "The wheel is one invention that has had a major impact on 33_______  aspects of life, but no impact has been as 34_______  as that of language. Language is very 35_______ , yet composed of just a small number of sounds.",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "The wheel is one invention that has had a major impact on 33_______  aspects of life, but no impact has been as 34_______  as that of language. Language is very 35_______ , yet composed of just a small number of sounds.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Language appears to be 36_______  to use. However, its sophistication is often overlooked.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 37,
        "to": 40,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Do the following statements agree with the views of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the views of the writer</p><p>NO if the statement contradicts the views of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "Human beings might have achieved their present position without language.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "The Port-Royal grammarians did justice to the nature of language.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "A complex idea can be explained more clearly in a sentence than in a single word.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "The Sumerians were responsible for starting the recording of events.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-12-1",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-12-academic-reading-test-1/",
    "sections": [
      {
        "section": 1,
        "title": "Cork",
        "contentHtml": "<h2>Cork</h2><p>Cork – the thick bark of the cork oak tree (Quercus suber) – is a remarkable material. It is tough, elastic, buoyant, and fire-resistant, and suitable for a wide range of purposes. It has also been used for millennia: the ancient Egyptians sealed their sarcophagi (stone coffins) with cork, while the ancient Greeks and Romans used it for anything from beehives to sandals.</p><p>And the cork oak itself is an extraordinary tree. Its bark grows up to 20 cm in thickness, insulating the tree like a coat wrapped around the trunk and branches and keeping the inside at a constant 20^{o}C all year round. Developed most probably as a defence against forest fires, the bark of the cork oak has a particular cellular structure – with about 40 million cells per cubic centimetre – that technology has never succeeded in replicating. The cells are filled with air, which is why cork is so buoyant.</p><p>It also has an elasticity that means you can squash it and watch it spring back to its original size and shape when you release the pressure.</p><p>Cork oaks grow in a number of Mediterranean countries, including Portugal, Spain, Italy, Greece and Morocco. They flourish in warm, sunny climates where there is a minimum of 400 millimetres of rain per year, and not more than 800 millimetres. Like grape vines, the trees thrive in poor soil, putting down deep roots in search of moisture and nutrients.</p><p>Southern Portugal’s Alentejo region meets all of these requirements, which explains why, by the early 20th century, this region had become the world’s largest producer of cork, and why today it accounts for roughly half of all cork production around the world.</p><p>Most cork forests are family-owned. Many of these family businesses, and indeed many of the trees themselves, are around 200 years old. Cork production is, above all, an exercise in patience. From the planting of a cork sapling to the first harvest takes 25 years, and a gap of approximately a decade must separate harvests from an individual tree. And for top-quality cork, it’s necessary to wait a further 15 or 20 years. You even have to wait for the right kind of summer’s day to harvest cork.</p><p>If the bark is stripped on a day when it’s too cold – or when the air is damp – the tree will be damaged.</p><p>Cork harvesting is a very specialised profession. No mechanical means of stripping cork bark has been invented, so the job is done by teams of highly skilled workers. First, they make vertical cuts down the bark using small sharp axes, then lever it away in pieces as large as they can manage. The most skilful cork-strippers prise away a semi-circular husk that runs the length of the trunk from just above ground level to the first branches.</p><p>It is then dried on the ground for about four months, before being taken to factories, where it is boiled to kill any insects that might remain in the cork. Over 60% of cork then goes on to be made into traditional bottle stoppers, with most of the remainder being used in the construction trade. Corkboard and cork tiles are ideal for thermal and acoustic insulation, while granules of cork are used in the manufacture of concrete.</p><p>Recent years have seen the end of the virtual monopoly of cork as the material for bottle stoppers, due to concerns about the effect it may have on the contents of the bottle. This is caused by a chemical compound called 2,4,6-trichloroanisole (TCA), which forms through the interaction of plant phenols, chlorine and mould. The tiniest concentrations – as little as three or four parts to a trillion – can spoil the taste of the product contained in the bottle.</p><p>The result has been a gradual yet steady move first towards plastic stoppers and, more recently, to aluminium screw caps. These substitutes are cheaper to manufacture and, in the case of screw caps, move convenient for the user.</p><p>The classic cork stopper does have several advantages, however. Firstly, its traditional image is more in keeping with that of the type of high quality goods with which it has long been associated. Secondly – and very importantly – cork is a sustainable product that can be recycled without difficulty. Moreover, cork forests are a resource which support local biodiversity, and prevent desertification in the regions where they are planted.</p><p>So, given the current concerns about environmental issues, the future of this ancient material once again looks promising.</p>"
      },
      {
        "section": 2,
        "title": "COLLECTING AS A HOBBY",
        "contentHtml": "<h2>COLLECTING AS A HOBBY</h2><p>Collecting must be one of the most varied of human activities, and it’s one that many of us psychologists find fascinating. Many forms of collecting have been dignified with a technical name: an archtophilist collects teddy bears, a philatelist collects postage stamps, and a deltiologist collects postcards. Amassing hundreds or even thousands of postcards, chocolate wrappers or whatever, takes time, energy and money that could surely be put to much more productive use.</p><p>And yet there are millions of collectors around the world. Why do they do it?</p><p>There are the people who collect because they want to make money – this could be called an instrumental reason for collecting; that is, collecting as a means to an end. They’ll look for, say, antiques that they can buy cheaply and expect to be able to sell at a profit. But there may well be a psychological element, too – buying cheap and selling dear can give the collector a sense of triumph. And as selling online is so easy, more and more people are joining in.</p><p>Many collectors collect to develop their social life, attending meetings of a group of collectors and exchanging information on items. This is a variant on joining a bridge club or a gym, and similarly brings them into contact with like-minded people.</p><p>Another motive for collecting is the desire to find something special, or a particular example of the collected item, such as a rare early recording by a particular singer. Some may spend their whole lives in a hunt for this. Psychologically, this can give a purpose to a life that otherwise feels aimless.</p><p>There is a danger, though, that if the individual is ever lucky enough to find what they’re looking for, rather than celebrating their success, they may feel empty, now that the goal that drove them on has gone.</p><p>If you think about collecting postage stamps, another potential reason for it – or, perhaps, a result of collecting – is its educational value. Stamp collecting opens a window to other countries, and to the plants, animals, or famous people shown on their stamps. Similarly, in the 19th century, many collectors amassed fossils, animals and plants from around the globe, and their collections provided a vast amount of information about the natural world.</p><p>Without those collections, our understanding would be greatly inferior to what it is.</p><p>In the past – and nowadays, too, though to a lesser extent – a popular form of collecting, particularly among boys and men, was trainspotting. This might involve trying to see every locomotive of a particular type, using published data that identifies each one, and ticking off each engine as it is seen. Trainspotters exchange information, these days often by mobile phone, so they can work out where to go to, to see a particular engine.</p><p>As a by-product, many practitioners of the hobby become very knowledgeable about railway operations, or the technical specifications of different engine types.</p><p>Similarly, people who collect dolls may go beyond simply enlarging their collection, and develop an interest in the way that dolls are made, or the materials that are used. These have changed over the centuries from the wood that was standard in 16th century Europe, through the wax and porcelain of later centuries, to the plastics of today’s dolls. Or collectors might be inspired to study how dolls reflect notions of what children like, or ought to like.</p><p>Not all collectors are interested in learning from their hobby, though, so what we might call a psychological reason for collecting is the need for a sense of control, perhaps as a way of dealing with insecurity. Stamps collectors, for instance, arrange their stamps in albums, usually very neatly, organising their collection according to certain commonplace principles – perhaps by country in alphabetical order, or grouping stamps by what they depict – people, birds, maps, and so on.</p><p>One reason, conscious or not, for what someone chooses to collect is to show the collector’s individualism. Someone who decides to collect something as unexpected as dog collars, for instance, may be conveying their belief that they must be interesting themselves. And believe it or not, there is at least one dog collar museum in existence, and it grew out of a personal collection.</p><p>Of course, all hobbies give pleasure, but the common factor in collecting is usually passion: pleasure is putting it far too mildly. More than most other hobbies, collecting can be totally engrossing, and can give a strong sense of personal fulfilment. To non-collectors it may appear an eccentric, if harmless, way of spending time, but potentially, collecting has a lot going for it.</p>"
      },
      {
        "section": 3,
        "title": "What’s the purpose of gaining knowledge?",
        "contentHtml": "<h2>What’s the purpose of gaining knowledge?</h2><p><strong>A</strong> ‘I would found an institution where any person can find instruction in any subject.’ That was the founder’s motto for Cornell University, and it seems an apt characterization of the different university, also in the USA, where I currently teach philosophy. A student can prepare for a career in resort management, engineering, interior design, accounting, music, law enforcement, you name it.</p><p>But what would the founders of these two institutions have thought of a course called ‘Arson for Profit’? I kid you not: we have it on the books. Any undergraduates who have met the academic requirements can sign up for the course in our program in ‘fire science’.</p><p><strong>B</strong> Naturally, the course is intended for prospective arson investigators, who can learn all the tricks of the trade for detecting whether a fire was deliberately set, discovering who did it, and establishing a chain of evidence for effective prosecution in a court of law.</p><p>But wouldn’t this also be the perfect course for prospective arsonists to sign up for? My point is not to criticize academic programs in fire science: they are highly welcome as part of the increasing professionalization of this and many other occupations. However, it’s not unknown for a firefighter to torch a building. This example suggests how dishonest and illegal behavior, with the help of higher education, can creep into every aspect of public and business life.</p><p><strong>C</strong> I realized this anew when I was invited to speak before a class in marketing, which is another of our degree programs. The regular instructor is a colleague who appreciates the kind of ethical perspective. I can bring as a philosopher. There are endless ways I could have approached this assignment, but I took my cue from the title of the course: ‘Principles of Marketing’.</p><p>It made me think to ask the students, ‘Is marketing principled?’ After all, a subject matter can have principles in the sense of being codified, having rules, as with football or chess, without being principled in the sense of being ethical. Many of the students immediately assumed that the answer to my question about marketing principles was obvious: no. Just look at the ways in which everything under the sun has been marketed; obviously it need not to be done in a principled (=ethical) fashion.</p><p><strong>D</strong> Is that obvious? I made the suggestion, which may sound downright crazy in light of the evidence, that perhaps marketing is by definition principled. My inspiration for this judgement is the philosopher Immanuel Kant, who argued that any body of knowledge consists of an end (or purpose) and a means.</p><p><strong>E</strong> Let us apply both the terms ‘means’ and ‘end’ to marketing. The students have signed up for a course in order to learn how to market effectively. But to what end? There seem to be two main attitudes toward that question. One is that the answer is obvious: the purpose of marketing is to sell things and to make money.</p><p>The other attitude is that the purpose of marketing is irrelevant: Each person comes to the program and course with his or her own plans, and these need not even concern the acquisition of marketing expertise as such. My proposal, which I believe would also be Kant’s, is that neither of these attitudes captures the significance of the end to the means for marketing. A field of knowledge or a professional endeavor is defined by both the means and the end; hence both deserve scrutiny.</p><p>Students need to study both how to achieve X, and also what X is.</p><p><strong>F</strong> It is at this point that ‘Arson for Profit’ becomes supremely relevant. That course is presumably all about means: how to detect and prosecute criminal activity. It is therefore assumed that the end is good in an ethical sense. When I ask fire science students to articulate the end, or purpose, of their field, they eventually generalize to something like, ‘The safety and welfare of society,’ which seems right.</p><p>As we have seen, someone could use the very same knowledge of means to achieve a much less noble end such as personal profit via destructive, dangerous, reckless activity. But we would not call that firefighting. We have a separate word for it: arson. Similarly, if you employed the ‘principles of marketing’ is an unprincipled way, you would not be doing marketing. We have another term for it: fraud.</p><p>Kant gives the example of a doctor and a poisoner, who use the identical knowledge to achieve their divergent ends. We would say that one is practicing medicine, the other, murder.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 5,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–5</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "The cork oak has the thickest bark of any living tree.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Scientists have developed a synthetic cork with the same cellular structures as natural cork.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Individual cork oak trees must be left for 25 years between the first and second harvest.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Cork bark should be stripped in dry atmospheric conditions.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "The only way to remove the bark from cork oak trees is by hand.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 6,
        "to": 13,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 6–13</h3><p>Complete the notes bolow.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Comparison of aluminium screw caps and cork bottle stoppers</p><p>Advantages of aluminium screw caps</p><p>• do not affect the 6_______  of the bottle contents</p><p>• are 7_______  to produce</p><p>• are 8_______  to use</p><p>Advantages of cork bottle stoppers</p><p>• suit the 9_______  of quality products</p><p>• made from a 10_______  material</p><p>• easily 11_______ </p><p>• cork forests aid 12_______ </p><p>• cork forests stop 13_______  happening</p>",
        "questions": [
          {
            "number": 6,
            "prompt": "* do not affect the 6_______  of the bottle contents",
            "options": [],
            "answerKey": "taste",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "* are 7_______  to produce",
            "options": [],
            "answerKey": "cheaper",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "* are 8_______  to use",
            "options": [],
            "answerKey": "convenient",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "* suit the 9_______  of quality products",
            "options": [],
            "answerKey": "image",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "* made from a 10_______  material",
            "options": [],
            "answerKey": "sustainable",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "* easily 11_______ ",
            "options": [],
            "answerKey": "recycled",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "* cork forests aid 12_______ ",
            "options": [],
            "answerKey": "biodiversity",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "* cork forests stop 13_______  happening",
            "options": [],
            "answerKey": "desertification",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 21,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 14–21</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• The writer mentions collecting 14_______  as an example of collecting in order to make money.</p><p>• Collectors may get a feeling of 15_______  from buying and selling items.</p><p>• Collectors’ clubs provide opportunities to share 16_______ </p><p>• Collectors’ clubs offer 17_______  with people who have similar interests.</p><p>• Collecting sometimes involves a life-long 18_______  for a special item.</p><p>• Searching for something particular may prevent people from feeling their life is completely 19_______ </p><p>• Stamp collecting may be 20_______  because it provides facts about different countries.</p><p>• 21_______  tends to be mostly a male hobby.</p>",
        "questions": [
          {
            "number": 14,
            "prompt": "* The writer mentions collecting 14_______  as an example of collecting in order to make money.",
            "options": [],
            "answerKey": "antiques",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "* Collectors may get a feeling of 15_______  from buying and selling items.",
            "options": [],
            "answerKey": "triumph",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "* Collectors’ clubs provide opportunities to share 16_______ ",
            "options": [],
            "answerKey": "information",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "* Collectors’ clubs offer 17_______  with people who have similar interests.",
            "options": [],
            "answerKey": "contact",
            "acceptedAnswers": [
              "contact/meetings"
            ]
          },
          {
            "number": 18,
            "prompt": "* Collecting sometimes involves a life-long 18_______  for a special item.",
            "options": [],
            "answerKey": "hunt",
            "acceptedAnswers": [
              "hunt/desire"
            ]
          },
          {
            "number": 19,
            "prompt": "* Searching for something particular may prevent people from feeling their life is completely 19_______ ",
            "options": [],
            "answerKey": "aimless",
            "acceptedAnswers": [
              "aimless/empty"
            ]
          },
          {
            "number": 20,
            "prompt": "* Stamp collecting may be 20_______  because it provides facts about different countries.",
            "options": [],
            "answerKey": "educational",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "* 21_______  tends to be mostly a male hobby.",
            "options": [],
            "answerKey": "trainspotting",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 22,
        "to": 26,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 22–26</h3><p>Do the following statements agree with the information given in the passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 22,
            "prompt": "The number of people buying dolls has grown over the centuries.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "Sixteenth century European dolls were normally made of wax and porcelain.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "Arranging a stamp collection by the size of the stamps is less common than other methods.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "Someone who collects unusual objects may want others to think he or she is also unusual.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "Collecting gives a feeling that other hobbies are unlikely to inspire.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 32,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 27–32</h3><p>The Reading Passage has six sections, A-F.</p><p>Choose the correct heading for each section from the list of headings below.</p><p>Write the correct number, i-viii, in boxes on your answer sheet.</p>",
        "config": {
          "headings": [
            "Courses that require a high level of commitment",
            "A course title with two meanings",
            "The equal importance of two key issues",
            "Applying a theory in an unexpected context",
            "The financial benefits of studying",
            "A surprising course title",
            "Different names for different outcomes",
            "The possibility of attracting the wrong kind of student"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "viii",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "ii",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "iii",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "vii",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 33,
        "to": 36,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 33–36</h3><p>Complete the summary below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The ‘Arson for Profit’ course</p><p>This is a university course intended for students who are undergraduates and who are studying 33_______ . The expectation is that they will become 34_______  specialising in arson. The course will help them to detect cases of arson and find 35_______  of criminal intent, leading to successful 36_______  in the courts.</p>",
        "questions": [
          {
            "number": 33,
            "prompt": "This is a university course intended for students who are undergraduates and who are studying 33_______ . The expectation is that they will become 34_______  specialising in arson. The course will help them to detect cases of arson and find 35_______  of criminal intent, leading to successful 36_______  in the courts.",
            "options": [],
            "answerKey": "fire science",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "This is a university course intended for students who are undergraduates and who are studying 33_______ . The expectation is that they will become 34_______  specialising in arson. The course will help them to detect cases of arson and find 35_______  of criminal intent, leading to successful 36_______  in the courts.",
            "options": [],
            "answerKey": "investigators",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "This is a university course intended for students who are undergraduates and who are studying 33_______ . The expectation is that they will become 34_______  specialising in arson. The course will help them to detect cases of arson and find 35_______  of criminal intent, leading to successful 36_______  in the courts.",
            "options": [],
            "answerKey": "evidence",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "This is a university course intended for students who are undergraduates and who are studying 33_______ . The expectation is that they will become 34_______  specialising in arson. The course will help them to detect cases of arson and find 35_______  of criminal intent, leading to successful 36_______  in the courts.",
            "options": [],
            "answerKey": "prosecution",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 37,
        "to": 40,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Do the following statements agree with the views of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the views of the writer</p><p>NO if the statement contradicts the views of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "It is difficult to attract students onto courses that do not focus on a career.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "The ‘Arson for Profit’ course would be useful for people intending to set fire to buildings.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Fire science courses are too academic to help people to be good at the job of firefighting.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "The writer’s fire science students provided a detailed definition of the purpose of their studies.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-12-2",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-12-academic-reading-test-2/",
    "sections": [
      {
        "section": 1,
        "title": "The risks agriculture faces in developing countries",
        "contentHtml": "<h2>The risks agriculture faces in developing countries</h2><p>Synthesis of an online debate*</p><p><strong>A</strong> Two things distinguish food production from all other productive activities: first, every single person needs food each day and has a right to it; and second, it is hugely dependent on nature. These two unique aspects, one political, the other natural, make food production highly vulnerable and different from any other business. At the same time, cultural values are highly entrenched in food and agricultural systems worldwide.</p><p><strong>B</strong> Farmers everywhere face major risks, including extreme weather, long-term climate change, and price volatility in input and product markets. However, smallholder farmers in developing countries must in addition deal with adverse environments, both natural, in terms of soil quality, rainfall, etc., and human, in terms of infrastructure, financial systems, markets, knowledge and technology. Counter-intuitively, hunger is prevalent among many smallholder farmers in the developing world.</p><p><strong>C</strong> Participants in the online debate argued that our biggest challenge is to address the underlying causes of the agricultural system’s inability to ensure sufficient food for all, and they identified as drivers of this problem our dependency on fossil fuels and unsupportive government policies.</p><p><strong>D</strong> On the question of mitigating the risks farmers face, most essayists called for greater state intervention. In his essay, Kanayo F. Nwanze, President of the International Fund for Agricultural Development, argued that governments can significantly reduce risks for farmers by providing basic services like roads to get produce more efficiently to markets, or water and food storage facilities to reduce losses.</p><p>Sophia Murphy, senior advisor to the Institute for Agriculture and Trade Policy, suggested that the procurement and holding of stocks by governments can also help mitigate wild swings in food prices by alleviating uncertainties about market supply.</p><p><strong>E</strong> Shenggen Fan, Director General of the International Food Policy Research Institute, held up social safety nets and public welfare programmes in Ethiopia, Brazil and Mexico as valuable ways to address poverty among farming families and reduce their vulnerability to agriculture shocks. However, some commentators responded that cash transfers to poor families do not necessarily translate into increased food security, as these programmes do not always strengthen food production or raise incomes.</p><p>Regarding state subsidies for agriculture, Rokeya Kabir, Executive Director of Bangladesh Nari Progati Sangha, commented in her essay that these ‘have not compensated for the stranglehold exercised by private traders. In fact, studies show that sixty percent of beneficiaries of subsidies are not poor, but rich landowners and non-farmer traders.’</p><p><strong>F</strong> Nwanze, Murphy and Fan argued that private risk management tools, like private insurance, commodity futures markets, and rural finance can help small-scale producers mitigate risk and allow for investment in improvements. Kabir warned that financial support schemes often encourage the adoption of high-input agricultural practices, which in the medium term may raise production costs beyond the value of their harvests.</p><p>Murphy noted that when futures markets become excessively financialised they can contribute to short-term price volatility, which increases farmers’ food insecurity. Many participants and commentators emphasised that greater transparency in markets is needed to mitigate the impact of volatility, and make evident whether adequate stocks and supplies are available. Others contended that agribusiness companies should be held responsible for paying for negative side effects.</p><p><strong>G</strong> Many essayists mentioned climate change and its consequences for small-scale agriculture. Fan explained that ‘in addition to reducing crop yields, climate change increases the magnitude and frequency of extreme weather events, which increase smallholder vulnerability.’ The growing unpredictability of weather patterns increases farmers’ difficulty in managing weather-related risks.</p><p>According to this author, one solution would be to develop crop varieties that are more resilient to new climate trends and extreme weather patterns. Accordingly, Pat Mooney, co-founder and executive director of the ETC Group, suggested that ‘if we are to survive climate change, we must adopt policies that let peasants diversify the plant and animal species and varieties/breeds that make up our menus.’</p><p><strong>H</strong> Some participating authors and commentators argued in favour of community-based and autonomous risk management strategies through collective action groups, co-operatives or producers’ groups. Such groups enhance market opportunities for small-scale producers, reduce marketing costs and synchronise buying and selling with seasonal price conditions.</p><p>According to Murphy, ‘collective action offers an important way for farmers to strengthen their political and economic bargaining power, and to reduce their business risks.’ One commentator, Giel Ton, warned that collective action does not come as a free good. It takes time, effort and money to organise, build trust and to experiment.</p><p>Others, like Marcel Vernooij and Marcel Beukeboom, suggested that in order to ‘apply what we already know’, all stakeholders, including business, government, scientists and civil society, must work together, starting at the beginning of the value chain.</p><p><strong>I</strong> Some participants explained that market price volatility is often worsened by the presence of intermediary purchasers who, taking advantage of farmers’ vulnerability, dictate prices. One commentator suggested farmers can gain greater control over prices and minimise price volatility by selling directly to consumers.</p><p>Similarly, Sonali Bisht, founder and advisor to the Institute of Himalayan Environmental Research and Education (INHERE), India, wrote that community-supported agriculture, where consumers invest in local farmers by subscription and guarantee producers a fair price, is a risk-sharing model worth more attention. Direct food distribution systems not only encourage small-scale agriculture but also give consumers more control over the food they consume, she wrote.</p><p>* The personal names in the text refer to the authors of written contributions to the online debate</p>"
      },
      {
        "section": 2,
        "title": "The Lost City",
        "contentHtml": "<h2>The Lost City</h2><p>An explorer’s encounter with the ruined city of Machu Picchu, the most famous icon of the Inca civilisation</p><p><strong>A</strong> When the US explorer and academic Hiram Bingham arrived in South America in 1911, he was ready for what was to be the greatest achievement of his life: the exploration of the remote hinterland to the west of Cusco, the old capital of the Inca empire in the Andes mountains of Peru. His goal was to locate the remains of a city called Vitcos, the last capital of the Inca civilisation.</p><p>Cusco lies on a high plateau at an elevation of more than 3,000 metres, and Bingham’s plan was to descend from this plateau along the valley of the Urubamba river, which takes a circuitous route down to the Amazon and passes through an area of dramatic canyons and mountain ranges.</p><p><strong>B</strong> When Bingham and his team set off down the Urubamba in late July, they had an advantage over travelers who had preceded them: a track had recently been blasted down the valley canyon to enable rubber to be brought up by mules from the jungle. Almost all previous travelers had left the river at Ollantaytambo and taken a high pass across the mountains to rejoin the river lower down, thereby cutting a substantial corner, but also therefore never passing through the area around Machu Picchu.</p><p><strong>C</strong> On 24 July they were a few days into their descent of the valley. The day began slowly, with Bingham trying to arrange sufficient mules for the next stage of the trek. His companions showed no interest in accompanying him up the nearby hill to see some ruins that a local farmer, Melchor Arteaga, had told them about the night before. The morning was dull and damp, and Bingham also seems to have been less than keen on the prospect of climbing the hill.</p><p>In his book Lost City of the Incas, he relates that he made the ascent without having the least expectation that he would find anything at the top.</p><p><strong>D</strong> Bingham writes about the approach in vivid style in his book. First, as he climbs up the hill, he describes the ever-present possibility of deadly snakes, ‘capable of making considerable springs when in pursuit of their prey’; not that he sees any. Then there’s a sense of mounting discovery as he comes across great sweeps of terraces, then a mausoleum, followed by monumental staircases and, finally, the grand ceremonial buildings of Machu Picchu.</p><p>‘It seemed like an unbelievable dream … the sight held me spellbound …’ he wrote.</p><p><strong>E</strong> We should remember, however, that Lost City of the Incas is a work of hindsight, not written until 1948, many years after his journey. His journal entries of the time reveal a much more gradual appreciation of his achievement. He spent the afternoon at the ruins noting down the dimensions of some of the buildings, then descended and rejoined his companions, to whom he seems to have said little about his discovery.</p><p>At this stage, Bingham didn’t realise the extent or the importance of the site, nor did he realise what use he could make of the discovery.</p><p><strong>F</strong> However, soon after returning it occurred to him that he could make a name for himself from this discovery. When he came to write the National Geographic magazine article that broke the story to the world in April 1913, he knew he had to produce a big idea. He wondered whether it could have been the birthplace of the very first Inca, Manco the Great, and whether it could also have been what chroniclers described as ‘the last city of the Incas’.</p><p>This term refers to Vilcabamba, the settlement where the Incas had fled from Spanish invaders in the 1530s. Bingham made desperate attempts to prove this belief for nearly 40 years. Sadly, his vision of the site as both the beginning and end of the Inca civilisation, while a magnificent one, is inaccurate. We now know that Vilcabamba actually lies 65 kilometres away in the depths of the jungle.</p><p><strong>G</strong> One question that has perplexed visitors, historians and archaeologists alike ever since Bingham, is why the site seems to have been abandoned before the Spanish Conquest. There are no references to it by any of the Spanish chroniclers – and if they had known of its existence so close to Cusco they would certainly have come in search of gold.</p><p>An idea which has gained wide acceptance over the past few years is that Machu Picchu was a moya, a country estate built by an Inca emperor to escape the cold winters of Cusco, where the elite could enjoy monumental architecture and spectacular views. Furthermore, the particular architecture of Machu Picchu suggests that it was constructed at the time of the greatest of all the Incas, the emperor Pachacuti (c. 1438-71).</p><p>By custom, Pachacuti’s descendants built other similar estates for their own use, and so Machu Picchu would have been abandoned after his death, some 50 years before the Spanish Conquest.</p>"
      },
      {
        "section": 3,
        "title": "The Benefits of Being Bilingual",
        "contentHtml": "<h2>The Benefits of Being Bilingual</h2><p><strong>A</strong> According to the latest figures, the majority of the world’s population is now bilingual or multilingual, having grown up speaking two or more languages. In the past, such children were considered to be at a disadvantage compared with their monolingual peers.</p><p>Over the past few decades, however, technological advances have allowed researchers to look more deeply at how bilingualism interacts with and changes the cognitive and neurological systems, thereby identifying several clear benefits of being bilingual.</p><p><strong>B</strong> Research shows that when a bilingual person uses one language, the other is active at the same time. When we hear a word, we don’t hear the entire word all at once: the sounds arrive in sequential order. Long before the word is finished, the brain’s language system begins to guess what that word might be. If you hear ‘can’, you will likely activate words like ‘candy’ and ‘candle’ as well, at least during the earlier stages of word recognition.</p><p>For bilingual people, this activation is not limited to a single language; auditory input activates corresponding words regardless of the language to which they belong. Some of the most compelling evidence for this phenomenon, called ‘language co-activation’, comes from studying eye movements.</p><p>A Russian-English bilingual asked to ‘pick up a marker’ from a set of objects would look more at a stamp than someone who doesn’t know Russian, because the Russian word for ‘stamp’, marka, sounds like the English word he or she heard, ‘marker’. In cases like this, language co-activation occurs because what the listener hears could map onto words in either language.</p><p><strong>C</strong> Having to deal with this persistent linguistic competition can result in difficulties, however. For instance, knowing more than one language can cause speakers to name pictures more slowly, and can increase ‘tip-of-the-tongue states’, when you can almost, but not quite, bring a word to mind. As a result, the constant juggling of two languages creates a need to control how much a person accesses a language at any given time.</p><p>For this reason, bilingual people often perform better on tasks that require conflict management. In the classic Stroop Task, people see a word and are asked to name the colour of the word’s font. When the colour and the word match (i.e., the word ‘red’ printed in red), people correctly name the colour more quickly than when the colour and the word don’t match (i.e., the word ‘red’ printed in blue). This occurs because the word itself (‘red’) and its font colour (blue) conflict.</p><p>Bilingual people often excel at tasks such as this, which tap into the ability to ignore competing perceptual information and focus on the relevant aspects of the input. Bilinguals are also better at switching between two tasks; for example, when bilinguals have to switch from categorizing objects by colour (red or green) to categorizing them by shape (circle or triangle), they do so more quickly than monolingual people, reflecting better cognitive control when having to make rapid changes of strategy.</p><p><strong>D</strong> It also seems that the neurological roots of the bilingual advantage extend to brain areas more traditionally associated with sensory processing. When monolingual and bilingual adolescents listen to simple speech sounds without any intervening background noise, they show highly similar brain stem responses.</p><p>When researchers play the same sound to both groups in the presence of background noise, however, the bilingual listeners’ neural response is considerably larger, reflecting better encoding of the sound’s fundamental frequency, a feature of sound closely related to pitch perception.</p><p><strong>E</strong> Such improvements in cognitive and sensory processing may help a bilingual person to process information in the environment, and help explain why bilingual adults acquire a third language better than monolingual adults master a second language. This advantage may be rooted in the skill of focussing on information about the new language while reducing interference from the languages they already know.</p><p><strong>F</strong> Research also indicates that bilingual experience may help to keep the cognitive mechanisms sharp by recruiting alternate brain networks to compensate for those that become damaged during aging. Older bilinguals enjoy improved memory relative to monolingual people, which can lead to real-world health benefits.</p><p>In a study of over 200 patients with Alzheimer’s disease, a degenerative brain disease, bilingual patients reported showing initial symptoms of the disease an average of five years later than monolingual patients. In a follow-up study, researchers compared the brains of bilingual and monolingual patients matched on the severity of Alzheimer’s symptoms.</p><p>Surprisingly, the bilinguals’ brains had more physical signs of disease than their monolingual counterparts, even though their outward behaviour and abilities were the same. If the brain is an engine, bilingualism may help it to go farther on the same amount of fuel.</p><p><strong>G</strong> Furthermore, the benefits associated with bilingual experience seem to start very early. In one study, researchers taught seven-month-old babies growing up in monolingual or bilingual homes that when they heard a tinkling sound, a puppet appeared on one side of a screen. Halfway through the study, the puppet began appearing on the opposite side of the screen. In order to get a reward, the infants had to adjust the rule they’d learned; only the bilingual babies were able to successfully learn the new rule.</p><p>This suggests that for very young children, as well as for older people, navigating a multilingual environment imparts advantages that transfer far beyond language.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 3,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 1–3</h3><p>The Reading Passage has nine paragraphs, A-I.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-I, in boxes on your answer sheet.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "a reference to characteristics that only apply to food production",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "a reference to challenges faced only by farmers in certain parts of the world",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "a reference to difficulties in bringing about co-operation between farmers",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 4,
        "to": 9,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 4–9</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person, A-G.</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Kanayo",
            "Sophia Murphy",
            "Shenggen Fan",
            "Rokeya Kabir",
            "Pat Mooney",
            "Giel Ton",
            "Sonali Bisht"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 4,
            "prompt": "Financial assistance from the government does not always go to the farmers who most need it.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Farmers can benefit from collaborating as a group.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Financial assistance from the government can improve the standard of living of farmers.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "Farmers may be helped if there is financial input by the same individuals who buy from them.",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Governments can help to reduce variation in prices.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "Improvements to infrastructure can have a major impact on risk for farmers.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 10,
        "to": 11,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 10–11</h3><p>Choose TWO letters, A-E.</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 10,
            "prompt": "Which TWO problems are mentioned which affect farmers with small farms in developing countries?",
            "options": [
              "lack of demand for locally produced food",
              "lack of irrigation programmes",
              "being unable to get insurance",
              "the effects of changing weather patterns",
              "having to sell their goods to intermediary buyers"
            ],
            "answerKey": "D",
            "acceptedAnswers": [
              "E"
            ]
          },
          {
            "number": 11,
            "prompt": "Which TWO problems are mentioned which affect farmers with small farms in developing countries?",
            "options": [
              "lack of demand for locally produced food",
              "lack of irrigation programmes",
              "being unable to get insurance",
              "the effects of changing weather patterns",
              "having to sell their goods to intermediary buyers"
            ],
            "answerKey": "E",
            "acceptedAnswers": [
              "D"
            ]
          }
        ]
      },
      {
        "section": 1,
        "from": 12,
        "to": 13,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 12–13</h3><p>Choose TWO letters, A-E.</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 12,
            "prompt": "Which TWO actions are recommended for improving conditions for farmers?",
            "options": [
              "reducing the size of food stocks",
              "attempting to ensure that prices rise at certain times of the year",
              "organising co-operation between a wide range of interested parties",
              "encouraging consumers to take a financial stake in farming",
              "making customers aware of the reasons for changing food prices"
            ],
            "answerKey": "C",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 13,
            "prompt": "Which TWO actions are recommended for improving conditions for farmers?",
            "options": [
              "reducing the size of food stocks",
              "attempting to ensure that prices rise at certain times of the year",
              "organising co-operation between a wide range of interested parties",
              "encouraging consumers to take a financial stake in farming",
              "making customers aware of the reasons for changing food prices"
            ],
            "answerKey": "D",
            "acceptedAnswers": [
              "C"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 20,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 14–20</h3><p>The Reading Passage has seven paragraphs, A-G.</p><p>Choose the correct heading for each paragraph from the list of headings below.</p><p>Write the correct number, i-viii, in boxes on your answer sheet.</p>",
        "config": {
          "headings": [
            "Different accounts of the same journey",
            "Bingham gains support",
            "A common belief",
            "The aim of the trip",
            "A dramatic description",
            "A new route",
            "Bingham publishes his theory",
            "Bingham’s lack of enthusiasm"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "viii",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "v",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "vii",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "Paragraph G",
            "options": [],
            "answerKey": "iii",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 21,
        "to": 24,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 21–24</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 21,
            "prompt": "Bingham went to South America in search of an Inca city.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Bingham chose a particular route down the Urubamba valley because it was the most common route used by travellers.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "Bingham understood the significance of Machu Picchu as soon as he saw it.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "Bingham returned to Machu Picchu in order to find evidence to support his theory.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 25,
        "to": 26,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 25–26</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• The track that took Bingham down the Urubamba valley had been created for the transportation of 25_______ </p><p>• Bingham found out about the ruins of Machu Picchu from a 26_______  it the Urubamba valley.</p>",
        "questions": [
          {
            "number": 25,
            "prompt": "* The track that took Bingham down the Urubamba valley had been created for the transportation of 25_______ ",
            "options": [],
            "answerKey": "rubber",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "* Bingham found out about the ruins of Machu Picchu from a 26_______  it the Urubamba valley.",
            "options": [],
            "answerKey": "farmer",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "fill",
        "displayType": "table-completion",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Complete the table below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<table><tbody><tr><td>Test</td><td>Findings</td></tr><tr><td>Observing the 27_______  of Russian-English bilingual people when asked to select certain objects</td><td>Bilingual people engage both languages simultaneously: a mechanism known as 28_______</td></tr><tr><td>A test called the 29_______ , focusing on naming colours</td><td>Bilingual people are more able to handle tasks involving a skill called 30_______</td></tr><tr><td>A test involving switching between tasks</td><td>When changing strategies, bilingual people have superior 31_______</td></tr></tbody></table>",
        "questions": [
          {
            "number": 27,
            "prompt": "Observing the 27_______  of Russian-English bilingual people when asked to select certain objects | Bilingual people engage both languages simultaneously: a mechanism known as 28_______ ",
            "options": [],
            "answerKey": "eye movements",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Observing the 27_______  of Russian-English bilingual people when asked to select certain objects | Bilingual people engage both languages simultaneously: a mechanism known as 28_______ ",
            "options": [],
            "answerKey": "language co-activation",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "A test called the 29_______ , focusing on naming colours | Bilingual people are more able to handle tasks involving a skill called 30_______ ",
            "options": [],
            "answerKey": "Stroop Task",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "A test called the 29_______ , focusing on naming colours | Bilingual people are more able to handle tasks involving a skill called 30_______ ",
            "options": [],
            "answerKey": "conflict management",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "A test involving switching between tasks | When changing strategies, bilingual people have superior 31_______ ",
            "options": [],
            "answerKey": "cognitive control",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 36,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 32–36</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 32,
            "prompt": "Attitudes towards bilingualism have changed in recent years.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Bilingual people are better than monolingual people at guessing correctly what words are before they are finished.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Bilingual people consistently name images faster than monolingual people.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Bilingual people’s brains process single sounds more efficiently than monolingual people in all situations.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Fewer bilingual people than monolingual people suffer from brain disease in old age.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 37,
        "to": 40,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 37–40</h3><p>The Reading Passage has seven paragraphs, A-G.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "an example of how bilingual and monolingual people’s brains respond differently to a certain type of non-verbal auditory input",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "a demonstration of how a bilingual upbringing has benefits even before we learn to speak",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "a description of the process by which people identify words that they hear",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "reference to some negative consequences of being bilingual",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-12-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-12-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "Flying tortoises",
        "contentHtml": "<h2>Flying tortoises</h2><p>An airborne reintroduction programme has helped conservationists take significant steps to protect the endangered Galápagos tortoise.</p><p><strong>A</strong> Forests of spiny cacti cover much of the uneven lava plains that separate the interior of the Galápagos island of Isabela from the Pacific Ocean. With its five distinct volcanoes, the island resembles a lunar landscape. Only the thick vegetation at the skirt of the often cloud-covered peak of Sierra Negra offers respite from the barren terrain below. This inhospitable environment is home to the giant Galápagos tortoise.</p><p>Some time after the Galápagos’s birth, around five million years ago, the islands were colonised by one or more tortoises from mainland South America. As these ancestral tortoises settled on the individual islands, the different populations adapted to their unique environments, giving rise to at least 14 different subspecies. Island life agreed with them.</p><p>In the absence of significant predators, they grew to become the largest and longest-living tortoises on the planet, weighing more than 400 kilograms, occasionally exceeding 1.8 metres in length and living for more than a century.</p><p><strong>B</strong> Before human arrival, the archipelago’s tortoises numbered in the hundreds of thousands. From the 17th century onwards, pirates took a few on board for food, but the arrival of whaling ships in the 1790s saw this exploitation grow exponentially. Relatively immobile and capable of surviving for months without food or water, the tortoises were taken on board these ships to act as food supplies during long ocean passages. Sometimes, their bodies were processed into high-grade oil.</p><p>In total, an estimated 200,000 animals were taken from the archipelago before the 20th century. This historical exploitation was then exacerbated when settlers came to the islands. They hunted the tortoises and destroyed their habitat to clear land for agriculture. They also introduced alien species – ranging from cattle, pigs, goats, rats and dogs to plants and ants – that either prey on the eggs and young tortoises or damage or destroy their habitat.</p><p><strong>C</strong> Today, only 11 of the original subspecies survive and of these, several are highly endangered. In 1989, work began on a tortoise-breeding centre just outside the town of Puerto Villamil on Isabela, dedicated to protecting the island’s tortoise populations. The centre’s captive-breeding programme proved to be extremely successful, and it eventually had to deal with an overpopulation problem.</p><p><strong>D</strong> The problem was also a pressing one. Captive-bred tortoises can’t be reintroduced into the wild until they’re at least five years old and weigh at least 4.5 kilograms, at which point their size and weight – and their hardened shells – are sufficient to protect them from predators. But if people wait too long after that point, the tortoises eventually become too large to transport.</p><p><strong>E</strong> For years, repatriation efforts were carried out in small numbers, with the tortoises carried on the backs of men over weeks of long, treacherous hikes along narrow trails. But in November 2010, the environmentalist and Galápagos National Park liaison officer Godfrey Merlin, a visiting private motor yacht captain and a helicopter pilot gathered around a table in a small café in Puerto Ayora on the island of Santa Cruz to work out more ambitious reintroduction.</p><p>The aim was to use a helicopter to move 300 of the breeding centre’s tortoises to various locations close to Sierra Negra.</p><p><strong>F</strong> This unprecedented effort was made possible by the owners of the 67-metre yacht While Cloud, who provided the Galápagos National Park with free use of their helicopter and its experienced pilot, as well as the logistical support of the yacht, its captain and crew. Originally an air ambulance, the yacht’s helicopter has a rear double door and a large internal space that’s well suited for cargo, so a custom crate was designed to hold up to 33 tortoises with a total weight of about 150 kilograms.</p><p>This weight, together with that of the fuel, pilot and four crew, approached the helicopter’s maximum payload, and there were times when it was clearly right on the edge of the helicopter’s capabilities. During a period of three days, a group of volunteers from the breeding centre worked around the clock to prepare the young tortoises for transport. Meanwhile, park wardens, dropped off ahead of time in remote locations, cleared landing sites within the thick brush, cacti and lava rocks.</p><p><strong>G</strong> Upon their release, the juvenile tortoises quickly spread out over their ancestral territory, investigating their new surroundings and feeding on the vegetation. Eventually, one tiny tortoise came across a fully grown giant who had been lumbering around the island for around a hundred years. The two stood side by side, a powerful symbol of the regeneration of an ancient species.</p>"
      },
      {
        "section": 2,
        "title": "The Intersection of Health Sciences and Geography",
        "contentHtml": "<h2>The Intersection of Health Sciences and Geography</h2><p><strong>A</strong> While many diseases that affect humans have been eradicated due to improvements in vaccinations and the availability of healthcare, there are still areas around the world where certain health issues are more prevalent. In a world that is far more globalised than ever before, people come into contact with one another through travel and living closer and closer to each other. As a result, super-viruses and other infections resistant to antibiotics are becoming more and more common.</p><p><strong>B</strong> Geography can often play a very large role in the health concerns of certain populations. For instance, depending on where you live, you will not have the same health concerns as someone who lives in a different geographical region. Perhaps one of the most obvious examples of this idea is malaria-prone areas, which are usually tropical regions that foster a warm and damp environment in which the mosquitos that can give people this disease can grow.</p><p>Malaria is much less of a problem in high-altitude deserts, for instance.</p><p><strong>C</strong> In some countries, geographical factors influence the health and well-being of the population in very obvious ways. In many large cities, the wind is not strong enough to clear the air of the massive amounts of smog and pollution that cause asthma, lung problems, eyesight issues and more in the people who live there. Part of the problem is, of course, the massive number of cars being driven, in addition to factories that run on coal power.</p><p>The rapid industrialisation of some countries in recent years has also led to the cutting down of forests to allow for the expansion of big cities, which makes it even harder to fight the pollution with the fresh air that is produced by plants.</p><p><strong>D</strong> It is in situations like these that the field of health geography comes into its own. It is an increasingly important area of study in a world where diseases like polio are re-emerging, respiratory diseases continue to spread, and malaria-prone areas are still fighting to find a better cure.</p><p>Health geography is the combination of, on the one hand, knowledge regarding geography and methods used to analyse and interpret geographical information, and on the other, the study of health, diseases and healthcare practices around the world. The aim of this hybrid science is to create solutions for common geography-based health problems.</p><p>While people will always be prone to illness, the study of how geography affects our health could lead to the eradication of certain illnesses, and the prevention of others in the future. By understanding why and how we get sick, we can change the way we treat illness and disease specific to certain geographical locations.</p><p><strong>E</strong> The geography of disease and ill health analyses the frequency with which certain diseases appear in different parts of the world, and overlays the data with the geography of the region, to see if there could be a correlation between the two. Health geographers also study factors that could make certain individuals or a population more likely to be taken ill with a specific health concern or disease, as compared with the population of another area.</p><p>Health geographers in this field are usually trained as healthcare workers, and have an understanding of basic epidemiology as it relates to the spread of diseases among the population.</p><p><strong>F</strong> Researchers study the interactions between humans and their environment that could lead to illness (such as asthma in places with high levels of pollution) and work to create a clear way of categorizing illnesses, diseases and epidemics into local and global scales. Health geographers can map the spread of illnesses and attempt to identify the reasons behind an increase or decrease in illnesses, as they work to find a way to halt the further spread or re-emergence of diseases in vulnerable populations.</p><p><strong>G</strong> The second subcategory of health geography is the geography of healthcare provision. This group studies the availability (or lack thereof) of healthcare resources to individuals and populations around the world. In both developed and developing nations there is often a very large discrepancy between the options available to people in different social classes, income brackets, and levels of education.</p><p>Individuals working in the area of the geography of healthcare provision attempt to assess the levels of healthcare in the area (for instance, it may be very difficult for people to get medical attention because there is a mountain between their village and the nearest hospital). These researchers are on the frontline of making recommendations regarding policy to international organisations, local government bodies and others.</p><p><strong>H</strong> The field of health geography is often overlooked, but it constitutes a huge area of need in the fields of geography and healthcare. If we can understand how geography affects our health no matter where in the world we are located, we can better treat disease, prevent illness, and keep people safe and well.</p>"
      },
      {
        "section": 3,
        "title": "Music and the emotions",
        "contentHtml": "<h2>Music and the emotions</h2><p>Neuroscientist Jonah Lehrer considers the emotional power of music</p><p>Why does music make us feel? One the one hand, music is a purely abstract art form, devoid of language or explicit ideas. And yet, even though music says little, it still manages to touch us deeply. When listening to our favourite songs, our body betrays all the symptoms of emotional arousal. The pupils in our eyes dilate, our pulse and blood pressure rise, the electrical conductance of our skin is lowered, and the cerebellum, a brain region associated with bodily movement, becomes strangely active.</p><p>Blood is even re-directed to the muscles in our legs. In other words, sound stirs us at our biological roots.</p><p>A recent paper in Nature Neuroscience by a research team in Montreal, Canada, marks an important step in revealing the precise underpinnings of the potent pleasurable stimulus’ that is music. Although the study involves plenty of fancy technology, including functional magnetic resonance imaging (fMRI) and ligand-based positron emission tomography (PET) scanning, the experiment itself was rather straightforward.</p><p>After screening 217 individuals who responded to advertisements requesting people who experience ‘chills’ to instrumental music, the scientists narrowed down the subject pool to ten. They then asked the subjects to bring in their playlist of favourite songs – virtually every genre was represented, from techno to tango – and played them the music while their brain activity was monitored.</p><p>Because the scientists were combining methodologies (PET and fMRI), they were able to obtain an impressively exact and detailed portrait of music in the brain. The first thing they discovered is that music triggers the production of dopamine – a chemical with a key role in setting people’s moods – by the neurons (nerve cells) in both the dorsal and ventral regions of the brain. As these two regions have long been linked with the experience of pleasure, this finding isn’t particularly surprising.</p><p>What is rather more significant is the finding that the dopamine neurons in the caudate – a region of the brain involved in learning stimulus-response associations, and in anticipating food and other ‘reward’ stimuli – were at their most active around 15 seconds before the participants’ favourite moments in the music. The researchers call this the ‘anticipatory phase’ and argue that the purpose of this activity is to help us predict the arrival of our favourite part.</p><p>The question, of course, is what all these dopamine neurons are up to. Why are they so active in the period preceding the acoustic climax? After all, we typically associate surges of dopamine with pleasure, with the processing of actual rewards. And yet, this cluster of cells is most active when the ‘chills’ have yet to arrive, when the melodic pattern is still unresolved.</p><p>One way to answer the question is to look at the music and not the neurons. While music can often seem (at least to the outsider) like a labyrinth of intricate patterns, it turns out that the most important part of every song or symphony is when the patterns break down, when the sound becomes unpredictable. If the music is too obvious, it is annoyingly boring, like an alarm clock. Numerous studies, after all, have demonstrated that dopamine neurons quickly adapt to predictable rewards.</p><p>If we know what’s going to happen next, then we don’t get excited. This is why composers often introduce a key note in the beginning of a song, spend most of the rest of the piece in the studious avoidance of the pattern, and then finally repeat it only at the end. The longer we are denied the pattern we expect, the greater the emotional release when the pattern returns, safe and sound.</p><p>To demonstrate this psychological principle, the musicologist Leonard Meyer, in his classic book Emotion and Meaning in Music (1956), analysed the 5th movement of Beethoven’s String Quartet in C-sharp minor, Op. 131. Meyer wanted to show how music is defined by its flirtation with – but not submission to – our expectations of order.</p><p>Meyer dissected 50 measures (bars) of the masterpiece, showing how Beethoven begins with the clear statement of a rhythmic and harmonic pattern and then, in an ingenious tonal dance, carefully holds off repeating it. What Beethoven does instead is suggest variations of the pattern. He wants to preserve an element of uncertainty in his music, making our brains beg for the one chord he refuses to give us. Beethoven saves that chord for the end.</p><p>According to Meyer, it is the suspenseful tension of music, arising out of our unfulfilled expectations, that is the source of the music’s feeling. While earlier theories of music focused on the way a sound can refer to the real world of images and experiences – its ‘connotative’ meaning – Meyer argued that the emotions we find in music come from the unfolding events of the music itself. This ‘embodied meaning’ arises from the patterns the symphony invokes and then ignores.</p><p>It is this uncertainty that triggers the surge of dopamine in the caudate, as we struggle to figure out what will happen next. We can predict some of the notes, but we can’t predict them all, and that is what keeps us listening, waiting expectantly for our reward, for the pattern to be completed.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 7,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 1–7</h3><p>The Reading Passage has seven paragraphs, A-G.</p><p>Choose the correct heading for each paragraph from the list of headings below.</p><p>Write the correct number, i-viii, in boxes on your answer sheet</p>",
        "config": {
          "headings": [
            "The importance of getting the timing right",
            "Young meets old",
            "Developments to the disadvantage of tortoise populations",
            "Planning a bigger idea",
            "Tortoises populate the islands",
            "Carrying out a carefully prepared operation",
            "Looking for a home for the islands’ tortoises",
            "The start of the conservation project"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "v",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "iii",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "viii",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "Paragraph G",
            "options": [],
            "answerKey": "ii",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 8,
        "to": 13,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 8–13</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet</p>",
        "config": {},
        "questionHtml": "<p>The decline of the Galápagos tortoise</p><p>• Originally from mainland South America</p><p>• Numbers on Galápagos islands increased, due to lack of predators</p><p>• 17th century: small numbers taken onto ships used by 8_______ </p><p>• 1790s: very large numbers taken onto whaling ships, kept for 9_______ , and also used to produce 10_______ </p><p>• Hunted by 11_______  on the islands</p><p>• Habitat destruction: for the establishment of agriculture and by various 12_______  not native to the islands, which also fed on baby tortoises and tortoises’ 13_______ </p>",
        "questions": [
          {
            "number": 8,
            "prompt": "* 17th century: small numbers taken onto ships used by 8_______ ",
            "options": [],
            "answerKey": "pirates",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "* 1790s: very large numbers taken onto whaling ships, kept for 9_______ , and also used to produce 10_______ ",
            "options": [],
            "answerKey": "food",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "* 1790s: very large numbers taken onto whaling ships, kept for 9_______ , and also used to produce 10_______ ",
            "options": [],
            "answerKey": "oil",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "* Hunted by 11_______  on the islands",
            "options": [],
            "answerKey": "settlers",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "* Habitat destruction: for the establishment of agriculture and by various 12_______  not native to the islands, which also fed on baby tortoises and tortoises’ 13_______ ",
            "options": [],
            "answerKey": "species",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "* Habitat destruction: for the establishment of agriculture and by various 12_______  not native to the islands, which also fed on baby tortoises and tortoises’ 13_______ ",
            "options": [],
            "answerKey": "eggs",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 19,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–19</h3><p>The Reading Passage has eight sections, A-H.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "an acceptance that not all diseases can be totally eliminated",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "examples of physical conditions caused by human behaviour",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "a reference to classifying diseases on the basis of how far they extend geographically",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "reasons why the level of access to healthcare can vary within a country",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "a description of health geography as a mixture of different academic fields",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "a description of the type of area where a particular illness is rare",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 20,
        "to": 26,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 20–26</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
        "config": {},
        "questionHtml": "<p>• Certain disease have disappeared, thanks to better 20_______  and healthcare.</p><p>• Because there is more contact between people, 21_______  are losing their usefulness.</p><p>• Disease-causing 22_______  are most likely to be found in hot, damp regions.</p><p>• One cause of pollution is 23_______  that burn a particular fuel.</p><p>• The growth of cities often has an impact on nearby 24_______ </p><p>• 25_______  is one disease that is growing after having been eradicated.</p><p>• A physical barrier such as a 26_______  Can prevent people from reaching a hospital.</p>",
        "questions": [
          {
            "number": 20,
            "prompt": "* Certain disease have disappeared, thanks to better 20_______  and healthcare.",
            "options": [],
            "answerKey": "vaccinations",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "* Because there is more contact between people, 21_______  are losing their usefulness.",
            "options": [],
            "answerKey": "antibiotics",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "* Disease-causing 22_______  are most likely to be found in hot, damp regions.",
            "options": [],
            "answerKey": "mosquitos",
            "acceptedAnswers": [
              "mosquito(e)s"
            ]
          },
          {
            "number": 23,
            "prompt": "* One cause of pollution is 23_______  that burn a particular fuel.",
            "options": [],
            "answerKey": "factories",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "* The growth of cities often has an impact on nearby 24_______ ",
            "options": [],
            "answerKey": "forests",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "* 25_______  is one disease that is growing after having been eradicated.",
            "options": [],
            "answerKey": "Polio",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "* A physical barrier such as a 26_______  Can prevent people from reaching a hospital.",
            "options": [],
            "answerKey": "mountain",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Complete the summary below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The Montreal Study</p><p>Participants, who were recruited for the study through advertisements, had their brain activity monitored while listening to their favourite music. It was noted that the music stimulated the brain’s neurons to release a substance called 27_______  in two of the parts of the brain which are associated with feeling 28_______ .</p><p>Researchers also observed that the neurons in the area of the brain called the 29_______  were particularly active just before the participants’ favourite moments in the music – the period known as the 30_______ . Activity in this part of the brain is associated with the expectation of ‘reward’ stimuli such as 31_______ .</p>",
        "questions": [
          {
            "number": 27,
            "prompt": "Participants, who were recruited for the study through advertisements, had their brain activity monitored while listening to their favourite music. It was noted that the music stimulated the brain’s neurons to release a substance called 27_______  in two of the parts of the brain which are associated with feeling 28_______ .",
            "options": [],
            "answerKey": "dopamine",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Participants, who were recruited for the study through advertisements, had their brain activity monitored while listening to their favourite music. It was noted that the music stimulated the brain’s neurons to release a substance called 27_______  in two of the parts of the brain which are associated with feeling 28_______ .",
            "options": [],
            "answerKey": "pleasure",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Researchers also observed that the neurons in the area of the brain called the 29_______  were particularly active just before the participants’ favourite moments in the music – the period known as the 30_______ . Activity in this part of the brain is associated with the expectation of ‘reward’ stimuli such as 31_______ .",
            "options": [],
            "answerKey": "caudate",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Researchers also observed that the neurons in the area of the brain called the 29_______  were particularly active just before the participants’ favourite moments in the music – the period known as the 30_______ . Activity in this part of the brain is associated with the expectation of ‘reward’ stimuli such as 31_______ .",
            "options": [],
            "answerKey": "anticipatory phase",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Researchers also observed that the neurons in the area of the brain called the 29_______  were particularly active just before the participants’ favourite moments in the music – the period known as the 30_______ . Activity in this part of the brain is associated with the expectation of ‘reward’ stimuli such as 31_______ .",
            "options": [],
            "answerKey": "food",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 36,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 32–36</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 32,
            "prompt": "What point does the writer emphasise in the first paragraph?",
            "options": [
              "how dramatically our reactions to music can vary",
              "how intense our physical responses to music can be",
              "how little we know about the way that music affects us",
              "how much music can tell us about how our brains operate"
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "what view of the Montreal study does the writer express in the second paragraph?",
            "options": [
              "Its aims were innovative.",
              "The approach was too simplistic.",
              "It produced some remarkably precise data.",
              "The technology used was unnecessarily complex."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "What does the writer find interesting about the results of the Montreal study?",
            "options": [
              "the timing of participants’ neural responses to the music",
              "the impact of the music of participants’ emotional state",
              "the section of participants’ brains which was activated by the music",
              "the type of music which had the strongest effect on participants’ brains"
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Why does the writer refer to Meyer’s work on music and emotion?",
            "options": [
              "to propose an original theory about the subject",
              "to offer support for the findings of the Montreal study",
              "to recommend the need for further research into the subject",
              "to present a view which opposes that of the Montreal researchers"
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "According to Leonard Meyer, what causes the listener’s emotional response to music?",
            "options": [
              "the way that the music evokes poignant memories in the listener",
              "the association of certain musical chords with certain feelings",
              "the listener’s sympathy with the composer’s intentions",
              "the internal structure of the musical composition"
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 37,
        "to": 40,
        "type": "matching",
        "displayType": "sentence-ending",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Complete each sentence with the correct ending, A-F, below.</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
        "config": {
          "sentenceEndings": [
            "our response to music depends on our initial emotional state.",
            "neuron activity decreases if outcomes become predictable.",
            "emotive music can bring to mind actual pictures and events.",
            "experiences in our past can influence our emotional reaction to music.",
            "emotive music delays giving listeners what they expect to hear.",
            "neuron activity increases prior to key points in a musical piece."
          ]
        },
        "questionHtml": "<p>• The Montreal researchers discovered that 37_______ </p><p>• Many studies have demonstrated that 38_______ </p><p>• Meyer’s analysis of Beethoven’s music shows that 39_______ </p><p>• Earlier theories of music suggested that 40_______ </p>",
        "questions": [
          {
            "number": 37,
            "prompt": "• The Montreal researchers discovered that 37_______ ",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "• Many studies have demonstrated that 38_______ ",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "• Meyer’s analysis of Beethoven’s music shows that 39_______ ",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "• Earlier theories of music suggested that 40_______ ",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-12-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-12-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "The History of Glass",
        "contentHtml": "<h2>The History of Glass</h2><p>From our earliest origins, man has been making use of glass. Historians have discovered that a type of natural glass – obsidian – formed in places such as the mouth of a volcano as a result of the intense heat of an eruption melting sand – was first used as tips for spears. Archaeologists have even found evidence of man-made glass which dates back to 4000 BC; this took the form of glazes used for coating stone beads.</p><p>It was not until 1500 BC, however, that the first hollow glass container was made by covering a sand core with a layer of molten glass.</p><p>Glass blowing became the most common way to make glass containers from the first century BC. The glass made during this time was highly coloured due to the impurities of the raw material. In the first century AD, methods of creating colourless glass were developed, which was then tinted by the addition of colouring materials. The secret of glass making was taken across Europe by the Romans during this century.</p><p>However, they guarded the skills and technology required to make glass very closely, and it was not until their empire collapsed in 476 AD that glass-making knowledge became widespread throughout Europe and the Middle East. From the 10th century onwards, the Venetians gained a reputation for technical skill and artistic ability in the making of glass bottles, and many of the city’s craftsmen left Italy to set up glassworks throughout Europe.</p><p>A major milestone in the history of glass occurred with the invention of lead crystal glass by the English glass manufacturer George Ravenscroft (1632-1683). He attempted to counter the effect of clouding that sometimes occurred in blown glass by introducing lead to the raw materials used in the process. The new glass he created was softer and easier to decorate, and had a higher refractive index, adding to its brilliance and beauty, and it proved invaluable to the optical industry.</p><p>It is thanks to Ravenscroft’s invention that optical lenses, astronomical telescopes, microscopes and the like became possible.</p><p>In Britain, the modern glass industry only really started to develop after the repeal of the Excise Act in 1845. Before that time, heavy taxes had been placed on the amount of glass melted in a glasshouse, and were levied continuously from 1745 to 1845. Joseph Paxton’s Crystal Palace at London’s Great Exhibition of 1851 marked the beginning of glass as a material used in the building industry. This revolutionary new building encouraged the use of glass in public, domestic and horticultural architecture.</p><p>Glass manufacturing techniques also improved with the advancement of science and the development of better technology.</p><p>From 1887 onwards, glass making developed from traditional mouth-blowing to a semi-automatic process, after factory-owner HM Ashley introduced a machine capable of producing 200 bottles per hour in Castleford, Yorkshire, England – more than three times quicker than any previous production method.</p><p>Then in 1907, the first fully automated machine was developed in the USA by Michael Owens – founder of the Owens Bottle Machine Company (later the major manufacturers Owens-Illinois) – and installed in its factory. Owens’ invention could produce an impressive 2,500 bottles per hour. Other developments followed rapidly, but it was not until the First World War, when Britain became cut off from essential glass suppliers, that glass became part of the scientific sector.</p><p>Previous to this, glass had been as a craft rather than a precise science.</p><p>Today, glass making is big business. It has become a modern, hi-tech industry operating in a fiercely competitive global market where quality, design and service levels are critical to maintaining market share. Modern glass plants are capable of making millions of glass containers a day in many different colours, with green, brown and clear remaining the most popular. Few of us can imagine modern life without glass.</p><p>It features in almost every aspect of our lives – in our homes, our cars and whenever we sit down to eat or drink. Glass packaging is used for many products, many beverages are sold in glass, as are numerous foodstuffs, as well as medicines and cosmetics.</p><p>Glass is an ideal material for recycling, and with growing consumer concern for green issues, glass bottles and jars are becoming ever more popular. Glass recycling is good news for the environment. It saves used glass containers being sent to landfill. As less energy is needed to melt recycled glass than to melt down raw materials, this also saves fuel and production costs. Recycling also reduces the need for raw materials to be quarried, thus saving precious resources.</p>"
      },
      {
        "section": 2,
        "title": "Bring back the big cats",
        "contentHtml": "<h2>Bring back the big cats</h2><p>It’s time to start returning vanished native animals to Britain, says John Vesty</p><p>There is a poem, written around 598 AD, which describes hunting a mystery animal called a llewyn. But what was it? Nothing seemed to fit, until 2006, when an animal bone, dating from around the same period, was found in the Kinsey Cave in northern England. Until this discovery, the lynx – a large spotted cat with tasselled ears – was presumed to have died out in Britain at least 6,000 years ago, before the inhabitants of these islands took up farming.</p><p>But the 2006 find, together with three others in Yorkshire and Scotland, is compelling evidence that the lynx and the mysterious llewyn were in fact one and the same animal. If this is so, it would bring forward the tassel-eared cat’s estimated extinction date by roughly 5,000 years.</p><p>However, this is not quite the last glimpse of the animal in British culture. A 9th-century stone cross from the Isle of Eigg shows, alongside the deer, boar and aurochs pursued by a mounted hunter, a speckled cat with tasselled ears. Were it not for the animal’s backside having worn away with time, we could have been certain, as the lynx’s stubby tail is unmistakable. But even without this key feature, it’s hard to see what else the creature could have been.</p><p>The lynx is now becoming the totemic animal of a movement that is transforming British environmentalism: rewilding.</p><p>Rewilding means the mass restoration of damaged ecosystems. It involves letting trees return to places that have been denuded, allowing parts of the seabed to recover from trawling and dredging, permitting rivers to flow freely again. Above all, it means bringing back missing species. One of the most striking findings of modern ecology is that ecosystems without large predators behave in completely different ways from those that retain them.</p><p>Some of them drive dynamic processes that resonate through the whole food chain, creating niches for hundreds of species that might otherwise struggle to survive. The killers turn out to be bringers of life.</p><p>Such findings present a big challenge to British conservation, which has often selected arbitrary assemblages of plants and animals and sought, at great effort and expense, to prevent them from changing. It has tried to preserve the living world as if it were a jar of pickles, letting nothing in and nothing out, keeping nature in a state of arrested development. But ecosystems are not merely collections of species; they are also the dynamic and ever-shifting relationships between them.</p><p>And this dynamism often depends on large predators.</p><p>At sea the potential is even greater: by protecting large areas from commercial fishing, we could once more see what 18th-century literature describes: vast shoals of fish being chased by fin and sperm whales, within sight of the English shore. This policy would also greatly boost catches in the surrounding seas; the fishing industry’s insistence on scouring every inch of seabed, leaving no breeding reserves, could not be more damaging to its own interests.</p><p>Rewilding is a rare example of an environmental movement in which campaigners articulate what they are for rather than only what they are against. One of the reasons why the enthusiasm for rewilding is spreading so quickly in Britain is that it helps to create a more inspiring vision than the green movement’s usual promise of ‘Follow us and the world will be slightly less awful than it would otherwise have been.’</p><p>The lynx presents no threat to human beings: there is no known instance of one preying on people. It is a specialist predator of roe deer, a species that has exploded in Britain in recent decades, holding back, by intensive browsing, attempts to re-establish forests. It will also winkle out sika deer: an exotic species that is almost impossible for human beings to control, as it hides in impenetrable plantations of young trees.</p><p>The attempt to reintroduce this predator marries well with the aim of bringing forests back to parts of our bare and barren uplands. The lynx requires deep cover, and as such presents little risk to sheep and other livestock, which are supposed, as a condition of farm subsidies, to be kept out of the woods.</p><p>On a recent trip to the Cairngorm Mountains, I heard several conservationists suggest that the lynx could be reintroduced there within 20 years. If trees return to the bare hills elsewhere in Britain, the big cats could soon follow. There is nothing extraordinary about these proposals, seen from the perspective of anywhere else in Europe.</p><p>The lynx has now been reintroduced to the Jura Mountains, the Alps, the Vosges in eastern France and the Harz mountains in Germany, and has re-established itself in many more places. The European population has tripled since 1970 to roughly 10,000.</p><p>As with wolves, bears, beavers, boar, bison, moose and many other species, the lynx has been able to spread as farming has left the hills and people discover that it is more lucrative to protect charismatic wildlife than to hunt it, as tourists will pay for the chance to see it. Large-scale rewilding is happening almost everywhere – except Britain.</p><p>Here, attitudes are just beginning to change. Conservationists are starting to accept that the old preservation-jar model is failing, even on its own terms. Already, projects such as Trees for Life in the Highlands provide a hint of what might be coming. An organisation is being set up that will seek to catalyse the rewilding of land and sea across Britain, its aim being to reintroduce that rarest of species to British ecosystems: hope.</p>"
      },
      {
        "section": 3,
        "title": "UK companies need more effective boards of directors",
        "contentHtml": "<h2>UK companies need more effective boards of directors</h2><p><strong>A</strong> After a number of serious failures of governance (that is, how they are managed at the highest level), companies in Britain, as well as elsewhere, should consider radical changes to their directors’ roles. It is clear that the role of a board director today is not an easy one.</p><p>Following the 2008 financial meltdown, which resulted in a deeper and more prolonged period of economic downturn than anyone expected, the search for explanations in the many post-mortems of the crisis has meant blame has been spread far and wide. Governments, regulators, central banks and auditors have all been in the frame. The role of bank directors and management and their widely publicised failures have been extensively picked over and examined in reports, inquiries and commentaries.</p><p><strong>B</strong> The knock-on effect of this scrutiny has been to make the governance of companies in general an issue of intense public debate and has significantly increased the pressures on, and the responsibilities of, directors. At the simplest and most practical level, the time involved in fulfilling the demands of a board directorship has increased significantly, calling into question the effectiveness of the classic model of corporate governance by part-time, independent non-executive directors.</p><p>Where once a board schedule may have consisted of between eight and ten meetings a year, in many companies the number of events requiring board input and decisions has dramatically risen. Furthermore, the amount of reading and preparation required for each meeting is increasing. Agendas can become overloaded and this can mean the time for constructive debate must necessarily be restricted in favour of getting through the business.</p><p><strong>C</strong> Often, board business is devolved to committees in order to cope with the workload, which may be more efficient but can mean that the board as a whole is less involved in fully addressing some of the most important issues. It is not uncommon for the audit committee meeting to last longer than the main board meeting itself. Process may take the place of discussion and be at the expense of real collaboration, so that boxes are ticked rather than issues tackled.</p><p><strong>D</strong> A radical solution, which may work for some very large companies whose businesses are extensive and complex, is the professional board, whose members would work up to three or four days a week, supported by their own dedicated staff and advisers. There are obvious risks to this and it would be important to establish clear guidelines for such a board to ensure that it did not step on the toes of management by becoming too engaged in the day-to-day running of the company.</p><p>Problems of recruitment, remuneration and independence could also arise and this structure would not be appropriate for all companies. However, more professional and better-informed boards would have been particularly appropriate for banks where the executives had access to information that part-time non-executive directors lacked, leaving the latter unable to comprehend or anticipate the 2008 crash.</p><p><strong>E</strong> One of the main criticisms of boards and their directors is that they do not focus sufficiently on longer-term matters of strategy, sustainability and governance, but instead concentrate too much on short-term financial metrics. Regulatory requirements and the structure of the market encourage this behaviour. The tyranny of quarterly reporting can distort board decision-making, as directors have to ‘make the numbers’ every four months to meet the insatiable appetite of the market for more date.</p><p>This serves to encourage the trading methodology of a certain kind of investor who moves in and out of a stock without engaging in constructive dialogue with the company about strategy or performance, and is simply seeking a short-term financial gain. This effect has been made worse by the changing profile of investors due to the globalisation of capital and the increasing use of automated trading systems. Corporate culture adapts and management teams are largely incentivised to meet financial goals.</p><p><strong>F</strong> Compensation for chief executives has become a combat zone where pitched battles between investors, management and board members are fought, often behind closed doors but increasingly frequently in the full glare of press attention. Many would argue that this is in the interest of transparency and good governance as shareholders use their muscle in the area of pay to pressure boards to remove underperforming chief executives.</p><p>Their powers to vote down executive remuneration policies increased when binding votes came into force. The chair of the remuneration committee can be an exposed and lonely role, as Alison Carnwath, chair of Barclays Bank’s remuneration committee, found when she had to resign, having been roundly criticised for trying to defend the enormous bonus to be paid to the chief executive; the irony being that she was widely understood to have spoken out against it in the privacy of the committee.</p><p><strong>G</strong> The financial crisis stimulated a debate about the role and purpose of the company and a heightened awareness of corporate ethics. Trust in the corporation has been eroded and academics such as Michael Sandel, in his thoughtful and bestselling book What Money Can’t Buy, are questioning the morality of capitalism and the market economy. Boards of companies in all sectors will need to widen their perspective to encompass these issues and this may involve a realignment of corporate goals.</p><p>We live in challenging times.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 8,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–8</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The History of Glass</p><p>• Early humans used a material called 1_______  to make the sharp points of their 2_______ </p><p>• 4000 BC: 3_______  made of stone were covered in a coating of man-made glass.</p><p>• First century BC: glass was coloured because of the 4_______  in the material.</p><p>• Until 476 AD: Only the 5_______  knew how to make glass.</p><p>• From 10th century: Venetians became famous for making bottles out of glass.</p><p>• 17th century: George Ravenscroft developed a process using 6_______  to avoid the occurrence of 7_______  in blown glass.</p><p>• Mid-19th century: British glass production developed after changes to laws concerning 8_______ </p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* Early humans used a material called 1_______  to make the sharp points of their 2_______ ",
            "options": [],
            "answerKey": "obsidian",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* Early humans used a material called 1_______  to make the sharp points of their 2_______ ",
            "options": [],
            "answerKey": "spears",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "* 4000 BC: 3_______  made of stone were covered in a coating of man-made glass.",
            "options": [],
            "answerKey": "beads",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* First century BC: glass was coloured because of the 4_______  in the material.",
            "options": [],
            "answerKey": "impurities",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* Until 476 AD: Only the 5_______  knew how to make glass.",
            "options": [],
            "answerKey": "Romans",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "* 17th century: George Ravenscroft developed a process using 6_______  to avoid the occurrence of 7_______  in blown glass.",
            "options": [],
            "answerKey": "lead",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "* 17th century: George Ravenscroft developed a process using 6_______  to avoid the occurrence of 7_______  in blown glass.",
            "options": [],
            "answerKey": "clouding",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "* Mid-19th century: British glass production developed after changes to laws concerning 8_______ ",
            "options": [],
            "answerKey": "taxes",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 9–13</h3><p>Do the following statements agree with the information given in Reading Passage 1?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 9,
            "prompt": "In 1887, HM Ashley had the fastest bottle-producing machine that existed at the time.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Michael Owens was hired by a large US company to design a fully-automated bottle manufacturing machine for them.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Nowadays, most glass is produced by large international manufacturers.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Concern for the environment is leading to an increased demand for glass containers.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "It is more expensive to produce recycled glass than to manufacture new glass.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 18,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 14–18</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter, A, B, C or D, in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "What did the 2006 discovery of the animal bone reveal about the lynx?",
            "options": [
              "Its physical appearance was very distinctive.",
              "Its extinction was linked to the spread of farming.",
              "It vanished from Britain several thousand years ago.",
              "It survived in Britain longer than was previously thought."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "What point does the writer make about large predators in the third paragraph?",
            "options": [
              "Their presence can increase biodiversity.",
              "They may cause damage to local ecosystems.",
              "Their behaviour can alter according to the environment.",
              "They should be reintroduced only to areas where they were native."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "What does the writer suggest about British conservation in the fourth paragraph?",
            "options": [
              "It has failed to achieve its aims.",
              "It is beginning to change direction.",
              "It has taken a misguided approach.",
              "It has focused on the most widespread species."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "Protecting large areas of the sea from commercial fishing would result in",
            "options": [
              "practical benefits for the fishing industry.",
              "some short-term losses to the fishing industry.",
              "widespread opposition from the fishing industry.",
              "certain changes to techniques within the fishing industry."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "According to the author, what distinguishes rewilding from other environmental campaigns?",
            "options": [
              "Its objective is more achievable.",
              "Its supporters are more articulate.",
              "Its positive message is more appealing.",
              "It is based on sounder scientific principles."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 22,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 19–22</h3><p>Complete the summary using the list of words and phrases A-F below.</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "trees",
            "endangered species",
            "hillsides",
            "wild animals",
            "humans",
            "farm animals"
          ]
        },
        "questionHtml": "<table><tbody><tr><td>A trees</td><td>B endangered species</td><td>C hillsides</td></tr><tr><td>D wild animals</td><td>E humans</td><td>F farm animals</td></tr></tbody></table><p>Reintroducing the lynx to Britain</p><p>There would be many advantages to reintroducing the lynx to Britain. While there is no evidence that the lynx has ever put 19_______  in danger, it would reduce the numbers of certain 20_______  whose populations have increased enormously in recent decades. It would present only a minimal threat to 21_______ , provided these were kept away from lynx habitats.</p><p>Furthermore, the reintroduction programme would also link efficiently with initiatives to return native 22_______  to certain areas of the country.</p>",
        "questions": [
          {
            "number": 19,
            "prompt": "There would be many advantages to reintroducing the lynx to Britain. While there is no evidence that the lynx has ever put 19_______  in danger, it would reduce the numbers of certain 20_______  whose populations have increased enormously in recent decades. It would present only a minimal threat to 21_______ , provided these were kept away from lynx habitats.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "There would be many advantages to reintroducing the lynx to Britain. While there is no evidence that the lynx has ever put 19_______  in danger, it would reduce the numbers of certain 20_______  whose populations have increased enormously in recent decades. It would present only a minimal threat to 21_______ , provided these were kept away from lynx habitats.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "There would be many advantages to reintroducing the lynx to Britain. While there is no evidence that the lynx has ever put 19_______  in danger, it would reduce the numbers of certain 20_______  whose populations have increased enormously in recent decades. It would present only a minimal threat to 21_______ , provided these were kept away from lynx habitats.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Furthermore, the reintroduction programme would also link efficiently with initiatives to return native 22_______  to certain areas of the country.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 26,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 23–26</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "Britain could become the first European country to reintroduce the lynx.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "The large growth in the European lynx population since 1970 has exceeded conservationists’ expectations.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "Changes in agricultural practices have extended the habitat of the lynx in Europe.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "It has become apparent that species reintroduction has commercial advantages.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 33,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 27–33</h3><p>The Reading Passage has seven paragraphs, A-G</p><p>Choose the correct heading for each paragraph from the list of headings below.</p><p>Write the correct number, i-viii, in boxes on your answer sheet.</p>",
        "config": {
          "headings": [
            "Disputes over financial arrangements regarding senior managers",
            "The impact on companies of being subjected to close examination",
            "The possible need for fundamental change in every area of business",
            "Many external bodies being held responsible for problems",
            "The falling number of board members with broad enough experience",
            "A risk that not all directors take part in solving major problems",
            "Broads not looking far enough ahead",
            "A proposal to change the way the board operates"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "ii",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "viii",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "vii",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Paragraph G",
            "options": [],
            "answerKey": "iii",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 34,
        "to": 37,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 34–37</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 34,
            "prompt": "Close scrutiny of the behaviour of boards has increased since the economic downturn.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Banks have been mismanaged to a greater extent than other businesses.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Board meetings normally continue for as long as necessary to debate matters in full.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Using a committee structure would ensure that board members are fully informed about significant issues.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 38,
        "to": 40,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 38–40</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• Before 2008, non-executive directors were at a disadvantage because of their lack of 38_______ </p><p>• Boards tend to place too much emphasis on 39_______  considerations that are only of short-term relevance.</p><p>• On certain matters, such as pay, the board may have to accept the views of 40_______ </p>",
        "questions": [
          {
            "number": 38,
            "prompt": "* Before 2008, non-executive directors were at a disadvantage because of their lack of 38_______ ",
            "options": [],
            "answerKey": "information",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "* Boards tend to place too much emphasis on 39_______  considerations that are only of short-term relevance.",
            "options": [],
            "answerKey": "financial",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "* On certain matters, such as pay, the board may have to accept the views of 40_______ ",
            "options": [],
            "answerKey": "investors",
            "acceptedAnswers": [
              "shareholders/investors"
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-13-1",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-13-academic-reading-test-1/",
    "sections": [
      {
        "section": 1,
        "title": "Case Study: Tourism New Zealand website",
        "contentHtml": "<h2>Case Study: Tourism New Zealand website</h2><p>New Zealand is a small country of four million inhabitants, a long-haul flight from all the major tourist-generating markets of the world. Tourism currently makes up 9% of the country’s gross domestic product, and is the country’s largest export sector. Unlike other export sectors, which make products and then sell them overseas, tourism brings its customers to New Zealand. The product is the country itself – the people, the places and the experiences.</p><p>In 1999, Tourism New Zealand launched a campaign to communicate a new brand position to the world. The campaign focused on New Zealand’s scenic beauty, exhilarating outdoor activities and authentic Maori culture, and it made New Zealand one of the strongest national brands in the world.</p><p>A key feature of the campaign was the website newzealand.com, which provided potential visitors to New Zealand with a single gateway to everything the destination had to offer. The heart of the website was a database of tourism services operators, both those based in New Zealand and those based abroad which offered tourism service to the country. Any tourism-related business could be listed by filling in a simple form.</p><p>This meant that even the smallest bed and breakfast address or specialist activity provider could gain a web presence with access to an audience of long-haul visitors. In addition, because participating businesses were able to update the details they gave on a regular basis, the information provided remained accurate.</p><p>And to maintain and improve standards, Tourism New Zealand organised a scheme whereby organisations appearing on the website underwent an independent evaluation against a set of agreed national standards of quality. As part of this, the effect of each business on the environment was considered.</p><p>To communicate the New Zealand experience, the site also carried features relating to famous people and places. One of the most popular was an interview with former New Zealand All Blacks rugby captain Tana Umaga. Another feature that attracted a lot of attention was an interactive journey through a number of the locations chosen for blockbuster films which had made use of New Zealand’s stunning scenery as a backdrop.</p><p>As the site developed, additional features were added to help independent travelers devise their own customised itineraries. To make it easier to plan motoring holidays, the site catalogued the most popular driving routes in the country, highlighting different routes according to the season and indicating distances and times.</p><p>Later, a Travel Planner feature was added, which allowed visitors to click and ‘bookmark’ places or attractions they were interested in, and then view the results on a map. The Travel Planner offered suggested routes and public transport options between the chosen locations. There were also links to accommodation in the area. By registering with the website, users could save their Travel Plan and return to it later, or print it out to take on the visit.</p><p>The website also had a ‘Your Words’ section where anyone could submit a blog of their New Zealand travels for possible inclusion on the website.</p><p>The Tourism New Zealand website won two Webby awards for online achievement and innovation. More importantly perhaps, the growth of tourism to New Zealand was impressive. Overall tourism expenditure increased by an average of 6.9% per year between 1999 and 2004. From Britain, visits to New Zealand grew at an average annual rate of 13% between 2002 and 2006, compared to a rate of 4% overall for British visits abroad.</p><p>The website was set up to allow both individuals and travel organisations to create itineraries and travel packages to suit their own needs and interests. On the website, visitors can search for activities not solely by geographical location, but also by the particular nature of the activity. This is important as research shows that activities are the key driver of visitor satisfaction, contributing 74% to visitor satisfaction, while transport and accommodation account for the remaining 26%.</p><p>The more activities that visitors undertake, the more satisfied they will be. It has also been found that visitors enjoy cultural activities most when they are interactive, such as visiting a marae (meeting ground) to learn about traditional Maori life. Many long-haul travelers enjoy such learning experiences, which provide them with stories to take home to their friends and family.</p><p>In addition, it appears that visitors to New Zealand don’t want to be ‘one of the crowd’ and find activities that involve only a few people more special and meaningful.</p><p>It could be argued that New Zealand is not a typical destination. New Zealand is a small country with a visitor economy composed mainly of small businesses. It is generally perceived as a safe English-speaking country with a reliable transport infrastructure. Because of the long-haul flight, most visitors stay for longer (average 20 days) and want to see as much of the country as possible on what is often seen as a once-in-a-lifetime visit.</p><p>However, the underlying lessons apply anywhere – the effectiveness of a strong brand, a strategy based on unique experiences and a comprehensive and user-friendly website.</p>"
      },
      {
        "section": 2,
        "title": "Why being bored is stimulating – and useful, too",
        "contentHtml": "<h2>Why being bored is stimulating – and useful, too</h2><p>This most common of emotions is turning out to be more interesting than we thought</p><p><strong>A</strong> We all know how it feels – it’s impossible to keep your mind on anything, time stretches out, and all the things you could do seem equally unlikely to make you feel better. But defining boredom so that it can be studied in the lab has proved difficult. For a start, it can include a lot of other mental states, such as frustration, apathy, depression and indifference.</p><p>There isn’t even agreement over whether boredom is always a low-energy, flat kind of emotion or whether feeling agitated and restless counts as boredom, too. In his book, Boredom: A Lively History, Peter Toohey at the University of Calgary, Canada, compares it to disgust – an emotion that motivates us to stay away from certain situations. ‘If disgust protects humans from infection, boredom may protect them from “infectious” social situations,’ he suggests.</p><p><strong>B</strong> By asking people about their experiences of boredom, Thomas Goetz and his team at the University of Konstanz in Germany have recently identified five distinct types: indifferent, calibrating, searching, reactant and apathetic. These can be plotted on two axes – one running left to right, which measures low to high arousal, and the other from top to bottom, which measures how positive or negative the feeling is.</p><p>Intriguingly, Goetz has found that while people experience all kinds of boredom, they tend to specialise in one. Of the five types, the most damaging is ‘reactant’ boredom with its explosive combination of high arousal and negative emotion. The most useful is what Goetz calls ‘indifferent’ boredom: someone isn’t engaged in anything satisfying but still feels relaxed and calm.</p><p>However, it remains to be seen whether there are any character traits that predict the kind of boredom each of us might be prone to.</p><p><strong>C</strong> Psychologist Sandi Mann at the University of Central Lancashire, UK, goes further. ‘All emotions are there for a reason, including boredom,’ she says. Mann has found that being bored makes us more creative. ‘We’re all afraid of being bored but in actual fact it can lead to all kinds of amazing things,’ she says.</p><p>In experiments published last year, Mann found that people who had been made to feel bored by copying numbers out of the phone book for 15 minutes came up with more creative ideas about how to use a polystyrene cup than a control group. Mann concluded that a passive, boring activity is best for creativity because it allows the mind to wander. In fact, she goes so far as to suggest that we should seek out more boredom in our lives.</p><p><strong>D</strong> Psychologist John Eastwood at York University in Toronto, Canada, isn’t convinced. ‘If you are in a state of mind-wandering you are not bored,’ he says. ‘In my view, by definition boredom is an undesirable state.’ That doesn’t necessarily mean that it isn’t adaptive, he adds. ‘Pain is adaptive – if we didn’t have physical pain, bad things would happen to us. Does that mean that we should actively cause pain? No.</p><p>But even if boredom has evolved to help us survive, it can still be toxic if allowed to fester.’ For Eastwood, the central feature of boredom is a failure to put our ‘attention system’ into gear. This causes an inability to focus on anything, which makes time seem to go painfully slowly. What’s more, your efforts to improve the situation can end up making you feel worse. ‘People try to connect with the world and if they are not successful there’s that frustration and irritability,’ he says.</p><p>Perhaps most worryingly, says Eastwood, repeatedly failing to engage attention can lead to state where we don’t know what to do any more, and no longer care.</p><p><strong>E</strong> Eastwood’s team is now trying to explore why the attention system fails. It’s early days but they think that at least some of it comes down to personality. Boredom proneness has been linked with a variety of traits. People who are motivated by pleasure seem to suffer particularly badly. Other personality traits, such as curiosity, are associated with a high boredom threshold. More evidence that boredom has detrimental effects comes from studies of people who are more or less prone to boredom.</p><p>It seems those who bore easily face poorer prospects in education, their career and even life in general. But of course, boredom itself cannot kill – it’s the things we do to deal with it that may put us in danger. What can we do to alleviate it before it comes to that? Goetz’s group has one suggestion.</p><p>Working with teenagers, they found that those who ‘approach’ a boring situation – in other words, see that it’s boring and get stuck in anyway – report less boredom than those who try to avoid it by using snacks, TV or social media for distraction.</p><p><strong>F</strong> Psychologist Francoise Wemelsfelder speculates that our over-connected lifestyles might even be a new source of boredom. ‘In modern human society there is a lot of overstimulation but still a lot of problems finding meaning,’ she says. So instead of seeking yet more mental stimulation, perhaps we should leave our phones alone, and use boredom to motivate us to engage with the world in a more meaningful way.</p>"
      },
      {
        "section": 3,
        "title": "Artificial artist?",
        "contentHtml": "<h2>Artificial artist?</h2><p>Can computers really create works of art?</p><p>The Painting Fool is one of a growing number of computer programs which, so their makers claim, possess creative talents. Classical music by an artificial composer has had audiences enraptured, and even tricked them into believing a human was behind the score. Artworks painted by a robot have sold for thousands of dollars and been hung in prestigious galleries. And software has been built which creates art that could not have been imagined by the programmer.</p><p>Human beings are the only species to perform sophisticated creative acts regularly. If we can break this process down into computer code, where does that leave human creativity? ‘This is a question at the very core of humanity,’ says Geraint Wiggins, a computational creativity researcher at Goldsmiths, University of London. ‘It scares a lot of people. They are worried that it is taking something special away from what it means to be human.’</p><p>To some extent, we are all familiar with computerised art. The question is: where does the work of the artist stop and the creativity of the computer begin? Consider one of the oldest machine artists, Aaron, a robot that has had paintings exhibited in London’s Tate Modern and the San Francisco Museum of Modern Art. Aaron can pick up a paintbrush and paint on canvas on its own. Impressive perhaps, but it is still little more than a tool to realise the programmer’s own creative ideas.</p><p>Simon Colton, the designer of the Painting Fool, is keen to make sure his creation doesn’t attract the same criticism. Unlike earlier ‘artists’ such as Aaron, the Painting Fool only needs minimal direction and can come up with its own concepts by going online for material. The software runs its own web searches and trawls through social media sites. It is now beginning to display a kind of imagination too, creating pictures from scratch.</p><p>One of its original works is a series of fuzzy landscapes, depicting trees and sky. While some might say they have a mechanical look, Colton argues that such reactions arise from people’s double standards towards software-produced and human-produced art. After all, he says, consider that the Painting Fool painted the landscapes without referring to a photo. ‘If a child painted a new scene from its head, you’d say it has a certain level of imagination,’ he points out.</p><p>‘The same should be true of a machine.’ Software bugs can also lead to unexpected results. Some of the Painting Fool’s paintings of a chair came out in black and white, thanks to a technical glitch. This gives the work an eerie, ghostlike quality. Human artists like the renowned Ellsworth Kelly are lauded for limiting their colour palette – so why should computers be any different?</p><p>Researchers like Colton don’t believe it is right to measure machine creativity directly to that of humans who ‘have had millennia to develop our skills’. Others, though, are fascinated by the prospect that a computer might create something as original and subtle as our best artists. So far, only one has come close. Composer David Cope invented a program called Experiments in Musical Intelligence, or EMI.</p><p>Not only did EMI create compositions in Cope’s style, but also that of the most revered classical composers, including Bach, Chopin and Mozart. Audiences were moved to tears, and EMI even fooled classical music experts into thinking they were hearing genuine Bach. Not everyone was impressed however. Some, such as Wiggins, have blasted Cope’s work as pseudoscience, and condemned him for his deliberately vague explanation of how the software worked.</p><p>Meanwhile, Douglas Hofstadter of Indiana University said EMI created replicas which still rely completely on the original artist’s creative impulses. When audiences found out the truth they were often outraged with Cope, and one music lover even tried to punch him. Amid such controversy, Cope destroyed EMI’s vital databases.</p><p>But why did so many people love the music, yet recoil when they discovered how it was composed? A study by computer scientist David Moffat of Glasgow Caledonian University provides a clue. He asked both expert musicians and non-experts to assess six compositions. The participants weren’t told beforehand whether the tunes were composed by humans or computers, but were asked to guess, and then rate how much they liked each one.</p><p>People who thought the composer was a computer tended to dislike the piece more than those who believed it was human. This was true even among the experts, who might have been expected to be more objective in their analyses.</p><p>Where does this prejudice come from? Paul Bloom of Yale University has a suggestion: he reckons part of the pleasure we get from art stems from the creative process behind the work. This can give it an ‘irresistible essence’, says Bloom. Meanwhile, experiments by Justin Kruger of New York University have shown that people’s enjoyment of an artwork increases if they think more time and effort was needed to create it.</p><p>Similarly, Colton thinks that when people experience art, they wonder what the artist might have been thinking or what the artist is trying to tell them. It seems obvious, therefore, that with computers producing art, this speculation is cut short – there’s nothing to explore. But as technology becomes increasingly complex, finding those greater depths in computer art could become possible.</p><p>This is precisely why Colton asks the Painting Fool to tap into online social networks for its inspiration: hopefully this way it will choose themes that will already be meaningful to us.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 7,
        "type": "fill",
        "displayType": "table-completion",
        "instructionHtml": "<h3>Questions 1–7</h3><p>Complete the table below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<table><tbody><tr><td>Section of website</td><td>Comments</td></tr><tr><td>Database of tourism services</td><td><ul><li>easy for tourism-related businesses to get on the list</li><li>allowed businesses to 1_______ information regularly</li><li>provided a country-wide evaluation of businesses, including their impact on the 2_______</li></ul></td></tr><tr><td>Special features on local topics</td><td>e.g. an interview with a former sports 3_______, and an interactive tour of various locations used in 4_______</td></tr><tr><td>Information on driving routes</td><td>varied depending on the 5_______</td></tr><tr><td>Travel Planner</td><td>included a map showing selected places, details of public transport and local 6_______</td></tr><tr><td>‘Your Words’</td><td>travelers could send a link to their 7_______</td></tr></tbody></table>",
        "questions": [
          {
            "number": 1,
            "prompt": "* allowed businesses to 1_______  information regularly",
            "options": [],
            "answerKey": "update",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* provided a country-wide evaluation of businesses, including their impact on the 2_______ ",
            "options": [],
            "answerKey": "environment",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "* e.g. an interview with a former sports 3_______ , and an interactive tour of various locations used in 4_______ ",
            "options": [],
            "answerKey": "captain",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* e.g. an interview with a former sports 3_______ , and an interactive tour of various locations used in 4_______ ",
            "options": [],
            "answerKey": "films",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* varied depending on the 5_______ ",
            "options": [],
            "answerKey": "season",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "* included a map showing selected places, details of public transport and local 6_______ ",
            "options": [],
            "answerKey": "accommodation",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "* travelers could send a link to their 7_______ ",
            "options": [],
            "answerKey": "blog",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 8,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 8–13</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 8,
            "prompt": "The website www.newzealand.com aimed to provide ready-made itineraries and packages for travel companies and individual tourists.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "It was found that most visitors started searching on the website by geographical location.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "According to research, 26% of visitor satisfaction is related to their accommodation.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Visitors to New Zealand like to become involved in the local culture.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Visitors like staying in small hotels in New Zealand rather than in larger ones.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Many visitors feel it is unlikely that they will return to New Zealand after their visit.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 19,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 14–19</h3><p>The Reading Passage has six paragraphs, A-F</p><p>Choose the correct heading for each paragraph from the list of headings below.</p><p>Write the correct number, i-viii, in boxes on your answer sheet.</p>",
        "config": {
          "headings": [
            "The productive outcomes that may result from boredom",
            "What teachers can do to prevent boredom",
            "A new explanation and a new cure for boredom",
            "Problems with a scientific approach to boredom",
            "A potential danger arising from boredom",
            "Creating a system of classification for feelings of boredom",
            "Age groups most affected by boredom",
            "Identifying those most affected by boredom"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "v",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "viii",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "iii",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 20,
        "to": 23,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 20–23</h3><p>Look at the following people and the list of ideas below.</p><p>Match each person with the correct idea, A-E.</p><p>Write the correct letter, A-E, in boxes on your answer sheet.</p>",
        "config": {
          "featureOptions": [
            "The way we live today may encourage boredom.",
            "One sort of boredom is worse than all the others.",
            "Levels of boredom may fall in the future.",
            "Trying to cope with boredom can increase its negative effects.",
            "Boredom may encourage us to avoid an unpleasant experience."
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 20,
            "prompt": "Peter Toohey",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "Thomas Goetz",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "John Eastwood",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "Francoise Wemelsfelder",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 24,
        "to": 26,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 24–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Responses to boredom</p><p>For John Eastwood, the central feature of boredom is that people cannot 24_______ , due to a failure in what he calls the ‘attention system’, and as a result they become frustrated and irritable. His team suggests that those for whom 25_______  is an important aim in life may have problems in coping with boredom, whereas those who have the characteristic of 26_______  can generally cope with it.</p>",
        "questions": [
          {
            "number": 24,
            "prompt": "For John Eastwood, the central feature of boredom is that people cannot 24_______ , due to a failure in what he calls the ‘attention system’, and as a result they become frustrated and irritable. His team suggests that those for whom 25_______  is an important aim in life may have problems in coping with boredom, whereas those who have the characteristic of 26_______  can generally cope with it.",
            "options": [],
            "answerKey": "focus",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "For John Eastwood, the central feature of boredom is that people cannot 24_______ , due to a failure in what he calls the ‘attention system’, and as a result they become frustrated and irritable. His team suggests that those for whom 25_______  is an important aim in life may have problems in coping with boredom, whereas those who have the characteristic of 26_______  can generally cope with it.",
            "options": [],
            "answerKey": "pleasure",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "For John Eastwood, the central feature of boredom is that people cannot 24_______ , due to a failure in what he calls the ‘attention system’, and as a result they become frustrated and irritable. His team suggests that those for whom 25_______  is an important aim in life may have problems in coping with boredom, whereas those who have the characteristic of 26_______  can generally cope with it.",
            "options": [],
            "answerKey": "curiosity",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "What is the writer suggesting about computer-produced works in the first paragraph?",
            "options": [
              "People’s acceptance of them can vary considerably.",
              "A great deal of progress has already been attained in this field.",
              "They have had more success in some artistic genres than in others.",
              "the advances are not as significant as the public believes them to be."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "According to Geraint Wiggins, why are many people worried by computer art?",
            "options": [
              "It is aesthetically inferior to human art.",
              "It may ultimately supersede human art.",
              "It undermines a fundamental human quality.",
              "It will lead to a deterioration in human ability."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "What is a key difference between Aaron and the Painting Fool?",
            "options": [
              "its programmer’s background",
              "public response to its work",
              "the source of its subject matter",
              "the technical standard of its output"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "What point does Simon Colton make in the fourth paragraph?",
            "options": [
              "Software-produced art is often dismissed as childish and simplistic.",
              "The same concepts of creativity should not be applied to all forms of art.",
              "It is unreasonable to expect a machine to be as imaginative as a human being.",
              "People tend to judge computer art and human art according to different criteria."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "The writer refers to the paintings of a chair as an example of computer art which",
            "options": [
              "achieves a particularly striking effect.",
              "exhibits a certain level of genuine artistic skill.",
              "closely resembles that of a well-known artist.",
              "highlights the technical limitations of the software."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 37,
        "type": "matching",
        "displayType": "sentence-ending",
        "instructionHtml": "<h3>Questions 32–37</h3><p>Complete each sentence with the correct ending, A-G below.</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "sentenceEndings": [
            "generating work that was virtually indistinguishable from that of humans.",
            "knowing whether it was the work of humans or software.",
            "producing work entirely dependent on the imagination of its creator.",
            "comparing the artistic achievements of humans and computers.",
            "revealing the technical details of his program.",
            "persuading the public to appreciate computer art.",
            "discovering that it was the product of a computer program"
          ]
        },
        "questionHtml": "<p>• Simon Colton says it is important to consider the long-term view then 32_______ </p><p>• David Cope’s EMI software surprised people by 33_______ </p><p>• Geraint Wiggins criticized Cope for not 34_______ </p><p>• Douglas Hofstadter claimed that EMI was 35_______ </p><p>• Audiences who had listened to EMI’s music became angry after 36_______ </p><p>• The participants in David Moffat’s study had to assess music without 37_______ </p>",
        "questions": [
          {
            "number": 32,
            "prompt": "• Simon Colton says it is important to consider the long-term view then 32_______ ",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "• David Cope’s EMI software surprised people by 33_______ ",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "• Geraint Wiggins criticized Cope for not 34_______ ",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "• Douglas Hofstadter claimed that EMI was 35_______ ",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "• Audiences who had listened to EMI’s music became angry after 36_______ ",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "• The participants in David Moffat’s study had to assess music without 37_______ ",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 38,
        "to": 40,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 38–40</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 38,
            "prompt": "Moffat’s research may help explain people’s reactions to EMI.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "The non-experts in Moffat’s study all responded in a predictable way.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Justin Kruger’s findings cast doubt on Paul Bloom’s theory about people’s prejudice towards computer art.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-13-2",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-13-academic-reading-test-2/",
    "sections": [
      {
        "section": 1,
        "title": "Bringing cinnamon to Europe",
        "contentHtml": "<h2>Bringing cinnamon to Europe</h2><p>Cinnamon is a sweet, fragrant spice produced from the inner bark of trees of the genus Cinnamomum, which is native to the Indian sub-continent. It was known in biblical times, and is mentioned in several books of the Bible, both as an ingredient that was mixed with oils for anointing people’s bodies, and also as a token indicating friendship among lovers and friends. In ancient Rome, mourners attending funerals burnt cinnamon to create a pleasant scent.</p><p>Most often, however, the spice found its primary use as an additive to food and drink. In the Middle Ages, Europeans who could afford the spice used it to flavor food, particularly meat, and to impress those around them with their ability to purchase an expensive condiment from the ‘exotic’ East. At a banquet, a host would offer guests a plate with various spices piled upon it as a sign of the wealth at his or her disposal.</p><p>Cinnamon was also reported to have health benefits, and was thought to cure various ailments, such as indigestion.</p><p>Toward the end of the Middle Ages, the European middle classes began to desire the lifestyle of the elite, including their consumption of spices. This led to a growth in demand for cinnamon and other spices. At that time, cinnamon was transported by Arab merchants, who closely guarded the secret of the source of the spice from potential rivals. They took it from India, where it was grown, on camels via an overland route to the Mediterranean. Their journey ended when they reached Alexandria.</p><p>European traders sailed there to purchase their supply of cinnamon, then brought it back to Venice. The spice then travelled from that great trading city to markets all around Europe. Because the overland trade route allowed for only small quantities of the spice to reach Europe, and because Venice had a virtual monopoly of the trade, the Venetians could set the price of cinnamon exorbitantly high.</p><p>These prices, coupled with the increasing demand, spurred the search for new routes to Asia by Europeans eager to take part in the spice trade.</p><p>Seeking the high profits promised by the cinnamon market, Portuguese traders arrived on the island of Ceylon in the Indian Ocean toward the end of the 15th century. Before Europeans arrived on the island, the state had organized the cultivation of cinnamon. People belonging to the ethnic group called the Salagama would peel the bark off young shoots of the cinnamon plant in the rainy season, when the wet bark was more pliable.</p><p>During the peeling process, they curled the bark into the ‘stick’ shape still associated with the spice today. The Salagama then gave the finished product to the king as a form of tribute. When the Portuguese arrived, they needed to increase production significantly, and so enslaved many other members of the Ceylonese native population, forcing them to work in cinnamon harvesting.</p><p>In 1518, the Portuguese built a fort on Ceylon, which enabled them to protect the island, so helping them to develop a monopoly in the cinnamon trade and generate very high profits. In the late 16th century, for example, they enjoyed a tenfold profit when shipping cinnamon over a journey of eight days from Ceylon to India.</p><p>When the Dutch arrived off the coast of southern Asia at the very beginning of the 17th century, they set their sights on displacing the Portuguese as kings of cinnamon. The Dutch allied themselves with Kandy, an inland kingdom on Ceylon. In return for payments of elephants and cinnamon, they protected the native king from the Portuguese. By 1649, the Dutch broke the 150-year Portuguese monopoly when they overran and occupied their factories.</p><p>By 1658, they had permanently expelled the Portuguese from the island, thereby gaining control of the lucrative cinnamon trade.</p><p>In order to protect their hold on the market, the Dutch, like the Portuguese before them, treated the native inhabitants harshly. Because of the need to boost production and satisfy Europe’s ever-increasing appetite for cinnamon, the Dutch began to alter the harvesting practices of the Ceylonese. Over time, the supply of cinnamon trees on the island became nearly exhausted, due to systematic stripping of the bark.</p><p>Eventually, the Dutch began cultivating their own cinnamon trees to supplement the diminishing number of wild trees available for use.</p><p>Then, in 1796, the English arrived on Ceylon, thereby displacing the Dutch from their control of the cinnamon monopoly. By the middle of the 19th century, production of cinnamon reached 1,000 tons a year, after a lower grade quality of the spice became acceptable to European tastes. By that time, cinnamon was being grown in other parts of the Indian Ocean region and in the West Indies, Brazil, and Guyana.</p><p>Not only was a monopoly of cinnamon becoming impossible, but the spice trade overall was diminishing in economic potential, and was eventually superseded by the rise of trade in coffee, tea, chocolate, and sugar.</p>"
      },
      {
        "section": 2,
        "title": "Oxytocin",
        "contentHtml": "<h2>Oxytocin</h2><p>The positive and negative effects of the chemical known as the ‘love hormone’</p><p><strong>A</strong> Oxytocin is a chemical, a hormone produced in the pituitary gland in the brain. It was through various studies focusing on animals that scientists first became aware of the influence of oxytocin. They discovered that it helps reinforce the bonds between prairie voles, which mate for life, and triggers the motherly behaviour that sheep show towards their newborn lambs. It is also released by women in childbirth, strengthening the attachment between mother and baby.</p><p>Few chemicals have as positive a reputation as oxytocin, which is sometimes referred to as the ‘love hormone’. One sniff of it can, it is claimed, make a person more trusting, empathetic, generous and cooperative. It is time, however, to revise this wholly optimistic view. A new wave of studies has shown that its effects vary greatly depending on the person and the circumstances, and it can impact on our social interactions for worse as well as for better.</p><p><strong>B</strong> Oxytocin’s role in human behaviour first emerged in 2005. In a groundbreaking experiments, Markus Heinrichs and his colleagues at the University of Freiburg, Germany, asked volunteers to do an activity in which they could invest money with an anonymous person who was not guaranteed to be honest. The team found the participants who had sniffed oxytocin via a nasal spray beforehand invested more money than those who received a placebo instead.</p><p>The study was the start of research into the effects of oxytocin on human interactions. ‘For eight years, it was quite a lonesome field,’ Heinrichs recalls. ‘Now, everyone is interested.’ These follow-up studies have shown that after a sniff of the hormone, people become more charitable, better at reading emotions on others’ faces and at communicating constructively in arguments. Together, the results fuelled the view that oxytocin universally enhanced the positive aspects of our social nature.</p><p><strong>C</strong> Then, after a few years, contrasting findings began to emerge. Simone Shamay-Tsoory at the at the University of Haifa, Israel, found that when volunteers played a competitive game, those who inhaled the hormone showed more pleasure when they beat other players, and felt more envy when others won. What’s more, administering oxytocin also has sharply contrasting outcomes depending on a person’s disposition.</p><p>Jennifer Bartz from Mount Sinai School of Medicine, New York, found that it improves people’s ability to read emotions, but only if they are not very socially adept to begin with. Her research also shows that oxytocin in fact reduces cooperation in subjects who are particularly anxious or sensitive to rejection.</p><p><strong>D</strong> Another discovery is that oxytocin’s effects vary depending on who we are interacting with. Studies conducted by Carolyn DeClerck of the University of Antwerp, Belgium, revealed that people who had received a dose of oxytocin actually became less cooperative when dealing with complete strangers.</p><p>Meanwhile, Carsten De Dreu at the University of Amsterdam in the Netherlands discovered that volunteers given oxytocin showed favouritism: Dutch men became quicker to associate positive words with Dutch names than with foreign ones, for example. According to De Dreu, oxytocin drives people to care for those in their social circles and defend them from outside dangers. So, it appears that oxytocin strengthens biases, rather than promoting general goodwill, as was previously thought.</p><p><strong>E</strong> There were signs of these subtleties from the start. Bartz has recently shown that in almost half of the existing research results, oxytocin influenced only certain individuals or in certain circumstances. Where once researchers took no notice of such findings, now a more nuanced understanding of oxytocin’s effects is propelling investigations down new lines.</p><p>To Bartz, the key to understanding what the hormone does lies in pinpointing its core function rather than in cataloguing its seemingly endless effects. There are several hypotheses which are not mutually exclusive. Oxytocin could help to reduce anxiety and fear. Or it could simply motivate people to seek out social connections.</p><p>She believes that oxytocin acts as a chemical spotlight that shines on social clues – a shift in posture, a flicker of the eyes, a dip in the voice – making people more attuned to their social environment. This would explain why it makes us more likely to look others in the eye and improves our ability to identify emotions. But it could also make things worse for people who are overly sensitive or prone to interpreting social cues in the worst light.</p><p><strong>F</strong> Perhaps we should not be surprised that the oxytocin story has become more perplexing. The hormone is found in everything from octopuses to sheep, and its evolutionary roots stretch back half a billion years. ‘It’s a very simple and ancient molecule that has been co-opted for many different functions,’ says Sue Carter at the University of Illinois, Chicago, USA. ‘It affects primitive parts of the brain like the amygdala, so it’s going to have many effects on just about everything.’ Bartz agrees.</p><p>‘Oxytocin probably does some very basic things, but once you add our higher-order thinking and social situations, these basic processes could manifest in different ways depending on individual differences and context.’</p>"
      },
      {
        "section": 3,
        "title": "MAKING THE MOST OF TRENDS",
        "contentHtml": "<h2>MAKING THE MOST OF TRENDS</h2><p>Experts from Harvard Business School give advice to managers</p><p>Most managers can identify the major trends of the day. But it the course of conducting research in a number of industries and working directly with companies, we have discovered that managers often fail to recognize the less obvious but profound ways these trends are influencing consumers’ aspirations, attitudes, and behaviors. This is especially true of trends that managers view as peripheral to their core markets.</p><p>Many ignore trends in their innovation strategies or adopt a wait-and-see approach and let competitors take the lead. At a minimum, such responses mean missed profit opportunities. At the extreme, they can jeopardize a company by ceding to rivals the opportunity to transform the industry.</p><p>The purpose of this article is twofold: to spur managers to think more expansively about how trends could engender new value propositions in their core markets, and to provide some high-level advice on how to make market research and product development personnel more adept at analyzing and exploiting trends.</p><p>One strategy, known as ‘infuse and augment’, is to design a product or service that retains most of the attributes and functions of existing products in the category but adds others that address the needs and desires unleashed by a major trend. A case in point in the Poppy range of handbags, which the firm Coach created in response to the economic downturn of 2008.</p><p>The Coach brand had been a symbol of opulence and luxury for nearly 70 years, and the most obvious reaction to the downturn would have been to lower prices. However, that would have risked cheapening the brand’s image. Instead, they initiated a consumer-research project which revealed that customers were eager to lift themselves and the country out of tough times.</p><p>Using these insights, Coach launched the lower-priced Poppy handbags, which were in vibrant colors, and looked more youthful and playful than conventional Coach products. Creating the sub-brand allowed Coach to avert an across-the-board price cut. In contrast to the many companies that responded to the recession by cutting prices, Coach saw the new consumer mindset as an opportunity for innovation and renewal.</p><p>A further example of this strategy was supermarket Tesco’s response to consumers’ growing concerns about the environment. With that in mind, Tesco, one of the world’s top five retailers, introduced its Greener Living program, which demonstrates the company’s commitment to protecting the environment by involving consumers in ways that produce tangible results.</p><p>For example, Tesco customers can accumulate points for such activities as reusing bags, recycling cans and printer cartridges, and buying home-insulation materials. Like points earned on regular purchases, these green points can be redeemed for cash. Tesco has not abandoned its traditional retail offering but augmented its business with these innovations, thereby infusing its value proposition with a green streak.</p><p>A more radical strategy is ‘combine and transcend’. This entails combining aspects of the product’s existing value proposition with attributes addressing changes arising from a trend, to create a novel experience – one that may land the company in an entirely new market space. At first glance, spending resources to incorporate elements of a seemingly irrelevant trend into one’s core offerings sounds like it’s hardly worthwhile.</p><p>But consider Nike’s move to integrate the digital revolution into its reputation for high-performance athletic footwear. In 2006, they teamed up with technology company Apple to launch Nike+, a digital sports kit comprising a sensor that attaches to the running shoe and a wireless receiver that connects to the user’s iPod.</p><p>By combining Nike’s original value proposition for amateur athletes with one for digital consumers, the Nike+ sports kit and web interface moved the company from a focus on athletic apparel to a new plane of engagement with its customers.</p><p>A third approach, known as ‘counteract and reaffirm’, involves developing products or services that stress the values traditionally associated with the category in ways that allow consumers to oppose – or at least temporarily escape from – the aspects of trends they view as undesirable. A product that accomplished this is the ME2, a video game created by Canada’s iToys.</p><p>By reaffirming the toy category’s association with physical play, the ME2 counteracted some of the widely perceived negative impacts of digital gaming devices. Like other handheld games, the device featured a host of exciting interactive games, a full-color LCD screen, and advanced 3D graphics.</p><p>What set it apart was that it incorporated the traditional physical component of children’s play: it contained a pedometer, which tracked and awarded points for physical activity (walking, running, biking, skateboarding, climbing stairs). The child could use the points to enhance various virtual skills needed for the video game. The ME2, introduced in mid-2008, catered to kids’ huge desire to play video games while countering the negatives, such as associations with lack of exercise and obesity.</p><p>Once you have gained perspective on how trend-related changes in consumer opinions and behaviors impact on your category, you can determine which of our three innovation strategies to pursue. When your category’s basic value proposition continues to be meaningful for consumers influenced by the trend, the infuse-and-augment strategy will allow you to reinvigorate the category.</p><p>If analysis reveals an increasing disparity between your category and consumers’ new focus, your innovations need to transcend the category to integrate the two worlds. Finally, if aspects of the category clash with undesired outcomes of a trend, such as associations with unhealthy lifestyles, there is an opportunity to counteract those changes by reaffirming the core values of your category.</p><p>Trends – technological, economic, environmental, social, or political – that affect how people perceive the world around them and shape what they expect from products and services present firms with unique opportunities for growth.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 9,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–9</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The Early History of Cinnamon</p><table><tbody><tr><td>Biblical times:</td><td>added to 1_______  used to show 2_______ . Between people</td></tr><tr><td>Ancient Rome:</td><td>used for its sweet smell at 3_______</td></tr><tr><td>Middle Ages:</td><td>added to food, especially meat was an indication of a person’s 4_______  known as a treatment for 5_______  and other health problems grown in 6_______  merchants used 7_______  to bring it to the Mediterranean arrived in the Mediterranean at 8_______  traders took it to 9_______  and sold it to destinations around Europe.</td></tr></tbody></table>",
        "questions": [
          {
            "number": 1,
            "prompt": "Biblical times: | added to 1_______  used to show 2_______ . Between people",
            "options": [],
            "answerKey": "oils",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Biblical times: | added to 1_______  used to show 2_______ . Between people",
            "options": [],
            "answerKey": "friendship",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Ancient Rome: | used for its sweet smell at 3_______ ",
            "options": [],
            "answerKey": "funerals",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Middle Ages: | added to food, especially meat was an indication of a person’s 4_______  known as a treatment for 5_______  and other health problems grown in 6_______  merchants used 7_______  to bring it to the Mediterranean arrived in the Mediterranean at 8_______  traders took it to 9_______  and sold it to destinations around Europe.",
            "options": [],
            "answerKey": "wealth",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Middle Ages: | added to food, especially meat was an indication of a person’s 4_______  known as a treatment for 5_______  and other health problems grown in 6_______  merchants used 7_______  to bring it to the Mediterranean arrived in the Mediterranean at 8_______  traders took it to 9_______  and sold it to destinations around Europe.",
            "options": [],
            "answerKey": "indigestion",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Middle Ages: | added to food, especially meat was an indication of a person’s 4_______  known as a treatment for 5_______  and other health problems grown in 6_______  merchants used 7_______  to bring it to the Mediterranean arrived in the Mediterranean at 8_______  traders took it to 9_______  and sold it to destinations around Europe.",
            "options": [],
            "answerKey": "India",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "Middle Ages: | added to food, especially meat was an indication of a person’s 4_______  known as a treatment for 5_______  and other health problems grown in 6_______  merchants used 7_______  to bring it to the Mediterranean arrived in the Mediterranean at 8_______  traders took it to 9_______  and sold it to destinations around Europe.",
            "options": [],
            "answerKey": "camels",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Middle Ages: | added to food, especially meat was an indication of a person’s 4_______  known as a treatment for 5_______  and other health problems grown in 6_______  merchants used 7_______  to bring it to the Mediterranean arrived in the Mediterranean at 8_______  traders took it to 9_______  and sold it to destinations around Europe.",
            "options": [],
            "answerKey": "Alexandria",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "Middle Ages: | added to food, especially meat was an indication of a person’s 4_______  known as a treatment for 5_______  and other health problems grown in 6_______  merchants used 7_______  to bring it to the Mediterranean arrived in the Mediterranean at 8_______  traders took it to 9_______  and sold it to destinations around Europe.",
            "options": [],
            "answerKey": "Venice",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 10,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 10–13</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 10,
            "prompt": "The Portuguese had control over the cinnamon trade in Ceylon throughout the 16th century.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "The Dutch took over the cinnamon trade from the Portuguese as soon as they arrived in Ceylon.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "The trees planted by the Dutch produced larger quantities of cinnamon than the wild trees.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "The spice trade maintained its economic importance during the 19th century.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 17,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–17</h3><p>The Reading Passage has six section, A-F.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "reference to research showing the beneficial effects of oxytocin on people",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "reasons why the effects of oxytocin are complex",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "mention of a period in which oxytocin attracted little scientific attention",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "reference to people ignoring certain aspects of their research data",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 18,
        "to": 20,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 18–20</h3><p>Look at the following research findings and the list of researchers below.</p><p>Match each research finding with the correct researcher, A-F.</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
        "config": {
          "featureOptions": [
            "Markus Heinrichs",
            "Simone Shamay-Tsoory",
            "Jennifer Bartz",
            "Carolyn DeClerck",
            "Carsten De Dreu",
            "Sue Carter"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 18,
            "prompt": "People are more trusting when affected by oxytocin.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Oxytocin increases people’s feelings of jealousy.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "The effect of oxytocin varies from one type of person to another.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 21,
        "to": 26,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 21–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Oxytocin research</p><p>The earliest findings about oxytocin and bonding came from research involving 21_______ . It was also discovered that humans produce oxytocin during 22_______ . An experiment in 2005, in which participants were given either oxytocin or a 23_______ , reinforced the belief that the hormone had a positive effect.</p><p>However, later research suggests that this is not always the case. A study at the University of Haifa where participants took part in a 24_______  revealed the negative emotions which oxytocin can trigger. A study at the University of Antwerp showed people’s lack of willingness to help 25_______  while under the influence of oxytocin.</p><p>Meanwhile, research at the University of Amsterdam revealed that people who have been given oxytocin consider 26_______  that are familiar to them in their own country to have more positive associations than those from other cultures.</p>",
        "questions": [
          {
            "number": 21,
            "prompt": "The earliest findings about oxytocin and bonding came from research involving 21_______ . It was also discovered that humans produce oxytocin during 22_______ . An experiment in 2005, in which participants were given either oxytocin or a 23_______ , reinforced the belief that the hormone had a positive effect.",
            "options": [],
            "answerKey": "animals",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "The earliest findings about oxytocin and bonding came from research involving 21_______ . It was also discovered that humans produce oxytocin during 22_______ . An experiment in 2005, in which participants were given either oxytocin or a 23_______ , reinforced the belief that the hormone had a positive effect.",
            "options": [],
            "answerKey": "childbirth",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "The earliest findings about oxytocin and bonding came from research involving 21_______ . It was also discovered that humans produce oxytocin during 22_______ . An experiment in 2005, in which participants were given either oxytocin or a 23_______ , reinforced the belief that the hormone had a positive effect.",
            "options": [],
            "answerKey": "placebo",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "However, later research suggests that this is not always the case. A study at the University of Haifa where participants took part in a 24_______  revealed the negative emotions which oxytocin can trigger. A study at the University of Antwerp showed people’s lack of willingness to help 25_______  while under the influence of oxytocin.",
            "options": [],
            "answerKey": "game",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "However, later research suggests that this is not always the case. A study at the University of Haifa where participants took part in a 24_______  revealed the negative emotions which oxytocin can trigger. A study at the University of Antwerp showed people’s lack of willingness to help 25_______  while under the influence of oxytocin.",
            "options": [],
            "answerKey": "strangers",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "Meanwhile, research at the University of Amsterdam revealed that people who have been given oxytocin consider 26_______  that are familiar to them in their own country to have more positive associations than those from other cultures.",
            "options": [],
            "answerKey": "names",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "In the first paragraph, the writer says that most managers",
            "options": [
              "fail to spot the key consumer trends of the moment.",
              "make the mistake of focusing only on the principal consumer trends.",
              "misinterpret market research data relating to current consumer trends.",
              "are unaware of the significant impact that trends have on consumers’ lives."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "According to the third paragraph, Coach was anxious to",
            "options": [
              "follow what some of its competitors were doing.",
              "maintain its prices throughout its range.",
              "safeguard its reputation as a manufacturer of luxury goods.",
              "modify the entire look of its brand to suit the economic climate."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "What point is made about Tesco’s Greener Living programme?",
            "options": [
              "It did not require Tesco to modify its core business activities.",
              "It succeeded in attracting a more eco-conscious slientele.",
              "Its main aim was to raise consumers’ awareness of environmental issues.",
              "It was not the first time that Tesco had implemented such an initiative."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "What does the writer suggest about Nike’s strategy?",
            "options": [
              "It was an extremely risky strategy at the time.",
              "It was a strategy that only a major company could afford to follow.",
              "It was the type of strategy that would not have been possible in the past.",
              "It was the kind of strategy which might appear to have few obvious benefits."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "What was original about the ME2?",
            "options": [
              "It contained technology that had been developed for the sports industry.",
              "It appealed to young people who were keen to improve their physical fitness.",
              "It took advantage of a current trend for video games with colourful 3D graphic.",
              "It was a handheld game that addressed people’s concerns about unhealthy lifestyles."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 37,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 32–37</h3><p>Look at the following statements and the list of companies below.</p><p>Match each statement with the correct company, A, B, C or D.</p><p>Write the correct letter, A, B, C or D, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Coach",
            "Tesco",
            "Nike",
            "iToys"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 32,
            "prompt": "It turned the notion that its products could have harmful effects to its own advantage.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "It extended its offering by collaborating with another manufacturer.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "It implemented an incentive scheme to demonstrate its corporate social responsibility.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "It discovered that customers had a positive attitude towards dealing with difficult circumstances.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "It responded to a growing lifestyle trend in an unrelated product sector.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "It successfully avoided having to charge its customers less for its core products.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 38,
        "to": 40,
        "type": "matching",
        "displayType": "sentence-ending",
        "instructionHtml": "<h3>Questions 38–40</h3><p>Complete each sentence with the correct ending, A, B, C or D below.</p><p>Write the correct letter, A, B, C or D, in boxes on your answer sheet.</p>",
        "config": {
          "sentenceEndings": [
            "employ a combination of strategies to maintain your consumer base.",
            "identify the most appropriate innovation strategy to use.",
            "emphasise your brand’s traditional values with the counteract-and-affirm strategy.",
            "use the combine-and-transcend strategy to integrate the two worlds."
          ]
        },
        "questionHtml": "<p>• If there are any trend-related changes impacting on your category, you should 38_______ </p><p>• If a current trend highlights a negative aspect of your category, you should 39_______ </p><p>• If the consumers’ new focus has an increasing lack of connection with your offering you should 40_______ </p>",
        "questions": [
          {
            "number": 38,
            "prompt": "• If there are any trend-related changes impacting on your category, you should 38_______ ",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "• If a current trend highlights a negative aspect of your category, you should 39_______ ",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "• If the consumers’ new focus has an increasing lack of connection with your offering you should 40_______ ",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-13-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-13-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "The coconut palm",
        "contentHtml": "<h2>The coconut palm</h2><p>For millennia, the coconut has been central to the lives of Polynesian and Asian peoples. In the western world, on the other hand, coconuts have always been exotic and unusual, sometimes rare. The Italian merchant traveller Marco Polo apparently saw coconuts in South Asia in the late 13th century, and among the mid-14th-century travel writings of Sir John Mandeville there is mention of ‘great Notes of Ynde’ (great Nuts of India).</p><p>Today, images of palm-fringed tropical beaches are clichés in the west to sell holidays, chocolate bars, fizzy drinks and even romance.</p><p>Typically, we envisage coconuts as brown cannonballs that, when opened, provide sweet white flesh. But we see only part of the fruit and none of the plant from which they come. The coconut palm has a smooth, slender, grey trunk, up to 30 metres tall. This is an important source of timber for building houses, and is increasingly being used as a replacement for endangered hardwoods in the furniture construction industry.</p><p>The trunk is surmounted by a rosette of leaves, each of which may be up to six metres long. The leaves have hard veins in their centres which, in many parts of the world, are used as brushes after the green part of the leaf has been stripped away. Immature coconut flowers are tightly clustered together among the leaves at the top of the trunk. The flower stems may be tapped for their sap to produce a drink, and the sap can also be reduced by boiling to produce a type of sugar used for cooking.</p><p>Coconut palms produce as many as seventy fruits per year, weighing more than a kilogram each. The wall of the fruit has three layers: a waterproof outer layer, a fibrous middle layer and a hard, inner layer. The thick fibrous middle layer produces coconut fibre, ‘coir’, which has numerous uses and is particularly important in manufacturing ropes. The woody innermost layer, the shell, with its three prominent ‘eyes’, surrounds the seed.</p><p>An important product obtained from the shell is charcoal, which is widely used in various industries as well as in the home as a cooking fuel. When broken in half, the shells are also used as bowls in many parts of Asia.</p><p>Inside the shell are the nutrients (endosperm) needed by the developing seed. Initially, the endosperm is a sweetish liquid, coconut water, which is enjoyed as a drink, but also provides the hormones which encourage other plants to grow more rapidly and produce higher yields. As the fruit matures, the coconut water gradually solidifies to form the brilliant white, fat-rich, edible flesh or meat.</p><p>Dried coconut flesh, ‘copra’, is made into coconut oil and coconut milk, which are widely used in cooking in different parts of the world, as well as in cosmetics. A derivative of coconut fat, glycerine, acquired strategic importance in a quite different sphere, as Alfred Nobel introduced the world to his nitroglycerine-based invention: dynamite.</p><p>Their biology would appear to make coconuts the great maritime voyagers and coastal colonizers of the plant world. The large, energy-rich fruits are able to float in water and tolerate salt, but cannot remain viable indefinitely; studies suggest after about 110 days at sea they are no longer able to germinate. Literally cast onto desert island shores, with little more than sand to grow in and exposed to the full glare of the tropical sun, coconut seeds are able to germinate and root.</p><p>The air pocket in the seed, created as the endosperm solidifies, protects the embryo. In addition, the fibrous fruit wall that helped it to float during the voyage stores moisture that can be taken up by the roots of the coconut seedling as it starts to grow.</p><p>There have been centuries of academic debate over the origins of the coconut. There were no coconut palms in West Africa, the Caribbean or the east coast of the Americans before the voyages of the European explorers Vasco da Gama and Columbus in the late 15th and early 16th centuries.</p><p>16th century trade and human migration patterns reveal that Arab traders and European sailors are likely to have moved coconuts from South and Southeast Asia to Africa and then across the Atlantic to the east coast of America. But the origin of coconuts discovered along the west coast of America by 16th century sailors has been the subject of centuries of discussion. Two diametrically opposed origins have been proposed: that they came from Asia, or that they were native to America.</p><p>Both suggestions have problems. In Asia, there is a large degree of coconut diversity and evidence of millennia of human use – but there are no relatives growing in the wild. In America, there are close coconut relatives, but no evidence that coconuts are indigenous. These problems have led to the intriguing suggestion that coconuts originated on coral islands in the Pacific and were dispersed from there.</p>"
      },
      {
        "section": 2,
        "title": "How baby talk gives infant brains a boost",
        "contentHtml": "<h2>How baby talk gives infant brains a boost</h2><p><strong>A</strong> The typical way of talking to a baby – high-pitched, exaggerated and repetitious – is a source of fascination for linguists who hope to understand how ‘baby talk’ impacts on learning. Most babies start developing their hearing while still in the womb, prompting some hopeful parents to play classical music to their pregnant bellies.</p><p>Some research even suggests that infants are listening to adult speech as early as 10 weeks before being born, gathering the basic building blocks of their family’s native tongue.</p><p><strong>B</strong> Early language exposure seems to have benefits to the brain – for instance, studies suggest that babies raised in bilingual homes are better at learning how to mentally prioritize information. So how does the sweet if sometimes absurd sound of infant-directed speech influence a baby’s development? Here are some recent studies that explore the science behind baby talk.</p><p><strong>C</strong> Fathers don’t use baby talk as often or in the same ways as mothers – and that’s perfectly OK, according to a new study. Mark VanDam of Washington State University at Spokane and colleagues equipped parents with recording devices and speech-recognition software to study the way they interacted with their youngsters during a normal day. ‘We found that moms do exactly what you’d expect and what’s been described many times over,’ VanDam explains. ‘But we found that dads aren’t doing the same thing.</p><p>Dads didn’t raise their pitch or fundamental frequency when they talked to kids.’ Their role may be rooted in what is called the bridge hypothesis, which dates back to 1975. It suggests that fathers use less familial language to provide their children with a bridge to the kind of speech they’ll hear in public. ‘The idea is that a kid gets to practice a certain kind of speech with mom and another kind of speech with dad, so the kid then has a wider repertoire of kinds of speech to practice,’ says VanDam.</p><p><strong>D</strong> Scientists from the University of Washington and the University of Connecticut collected thousands of 30-second conversations between parents and their babies, fitting 26 children with audio-recording vests that captured language and sound during a typical eight-hour day. The study found that the more baby talk parents used, the more their youngsters began to babble.</p><p>And when researchers saw the same babies at age two, they found that frequent baby talk had dramatically boosted vocabulary, regardless of socioeconomic status. ‘Those children who listened to a lot of baby talk were talking more than the babies that listened to more adult talk or standard speech,’ says Nairán Ramirez-Esparza of the University of Connecticut. ‘We also found that it really matters whether you use baby talk in a one-on-one context,’ she adds.</p><p>‘The more parents use baby talk one-on-one, the more babies babble, and the more they babble, the more words they produce later in life.’</p><p><strong>E</strong> Another study suggests that parents might want to pair their youngsters up so they can babble more with their own kind. Researchers from McGill University and Université du Québec à Montréal found that babies seem to like listening to each other rather than to adults – which may be why baby talk is such a universal tool among parents. They played repeating vowel sounds made by a special synthesizing device that mimicked sounds made by either an adult woman or another baby.</p><p>This way, only the impact of the auditory cues was observed. The team then measured how long each type of sound held the infants’ attention. They found that the ‘infant’ sounds held babies’ attention nearly 40 percent longer. The baby noises also induced more reactions in the listening infants, like smiling or lip moving, which approximates sound making. The team theorizes that this attraction to other infant sounds could help launch the learning process that leads to speech.</p><p>‘It may be some property of the sound that is just drawing their attention,’ says study co-author Linda Polka. ‘Or maybe they are really interested in that particular type of sound because they are starting to focus on their own ability to make sounds. We are speculating here but it might catch their attention because they recognize it as a sound they could possibly make.’</p><p><strong>F</strong> In a study published in Proceedings of the National Academy of Sciences, a total of 57 babies from two slightly different age groups – seven months and eleven and a half months – were played a number of syllables from both their native language (English) and a non-native tongue (Spanish). The infants were placed in a brain-activation scanner that recorded activity in a brain region known to guide the motor movements that produce speech.</p><p>The results suggest that listening to baby talk prompts infant brains to start practicing their language skills. ‘Finding activation in the motor areas of the brain when infants are simply listening is significant, because it means the baby brain is engaged in trying to talk back right from the start, and suggests that seven-month-olds’ brains are already trying to figure out how to make the right movements that will produce words,’ says co-author Patricia Kuhl.</p><p>Another interesting finding was that while the seven-month-olds responded to all speech sounds regardless of language, the brains of the older infants worked harder at the motor activations of non-native sounds compared to native sounds. The study may have also uncovered a process by which babies recognize differences between their native language and other tongues.</p>"
      },
      {
        "section": 3,
        "title": "Whatever happened to the Harappan Civilisation?",
        "contentHtml": "<h2>Whatever happened to the Harappan Civilisation?</h2><p>New research sheds light on the disappearance of an ancient society</p><p><strong>A</strong> The Harappan Civilisation of ancient Pakistan and India flourished 5,000 years ago, but a thousand years later their cities were abandoned. The Harappan Civilisation was a sophisticated Bronze Age society who built ‘megacities’ and traded internationally in luxury craft products, and yet seemed to have left almost no depictions of themselves.</p><p>But their lack of self-imagery – at a time when the Egyptians were carving and painting representations of themselves all over their temples – is only part of the mystery.</p><p><strong>B</strong> ‘There is plenty of archaeological evidence to tell us about the rise of the Harappan Civilisation, but relatively little about its fall,’ explains archaeologist Dr Cameron Petrie of the University of Cambridge. ‘As populations increased, cities were built that had great baths, craft workshops, palaces and halls laid out in distinct sectors. Houses were arranged in blocks, with wide main streets and narrow alleyways, and many had their own wells and drainage systems.</p><p>It was very much a “thriving” civilisation.’ Then around 2100 BC, a transformation began. Streets went uncleaned, buildings started to be abandoned, and ritual structures fell out of use. After their final demise, a millennium passed before really large-scale cities appeared once more in South Asia.</p><p><strong>C</strong> Some have claimed that major glacier-fed rivers changed their course, dramatically affecting the water supply and agriculture; or that the cities could not cope with an increasing population, they exhausted their resource base, the trading economy broke down or they succumbed to invasion and conflict; and yet others that climate change caused an environmental change that affected food and water provision. ‘It is unlikely that there was a single cause for the decline of the civilisation.</p><p>But the fact is, until now, we have had little solid evidence from the area for most of the key elements,’ said Petrie. ‘A lot of the archaeological debate has really only been well-argued speculation.’</p><p><strong>D</strong> A research team led by Petrie, together with Dr Ravindanath Singh of Banaras Hindu University in India, found early in their investigations that many of the archaeological sites were not where they were supposed to be, completely altering understanding of the way that this region was inhabited in the past.</p><p>When they carried out a survey of how the larger area was settled in relation to sources of water, they found inaccuracies in the published geographic locations of ancient settlements ranging from several hundred metres to many kilometres. They realised that any attempts to use the existing data were likely to be fundamentally flawed. Over the course of several seasons of fieldwork they carried out new surveys, finding an astonishing 198 settlement sites that were previously unknown.</p><p><strong>E</strong> Now, research published by Dr Yama Dixit and Professor David Hodell, both from Cambridge’s Department of Earth Sciences, has provided the first definitive evidence for climate change affecting the plains of north-western India, where hundreds of Harappan sites are known to have been situated. The researchers gathered shells of Melanoides tuberculate snails from the sediments of an ancient lake and used geochemical analysis as a means of tracing the climate history of the region.</p><p>‘As today, the major source of water into the lake is likely to have been the summer monsoon,’ says Dixit. ‘But we have observed that there was an abrupt change about 4,100 years ago, when the amount of evaporation from the lake exceeded the rainfall – indicative of a drought.’ Hodell adds: ‘We estimate that the weakening of the Indian summer monsoon climate lasted about 200 years before recovering to the previous conditions, which we still see today.’</p><p><strong>F</strong> It has long been thought that other great Bronze Age civilisations also declined at a similar time, with a global-scale climate event being seen as the cause. While it is possible that these local-scale processes were linked, the real archaeological interest lies in understanding the impact of these larger-scale events on different environments and different populations.</p><p>‘Considering the vast area of the Harappan Civilisation with its variable weather systems,’ explains Singh, ‘it is essential that we obtain more climate data from areas close to the two great cities at Mohenjodaro and Harappa and also from the Indian Punjab.’</p><p><strong>G</strong> Petrie and Singh’s team is now examining archaeological records and trying to understand details of how people led their lives in the region five millennia ago. They are analysing grains cultivated at the time, and trying to work out whether they were grown under extreme conditions of water stress, and whether they were adjusting the combinations of crops they were growing for different weather systems.</p><p>They are also looking at whether the types of pottery used, and other aspects of their material culture, were distinctive to specific regions or were more similar across larger areas. This gives us insight into the types of interactive networks that the population was involved in, and whether those changed.</p><p><strong>H</strong> Petrie believes that archaeologists are in a unique position to investigate how past societies responded to environmental and climatic change.</p><p>‘By investigating responses to environmental pressures and threats, we can learn from the past to engage with the public, and the relevant governmental and administrative bodies, to be more proactive in issues such as the management and administration of water supply, the balance of urban and rural development, and the importance of preserving cultural heritage in the future.’</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 8,
        "type": "fill",
        "displayType": "table-completion",
        "instructionHtml": "<h3>Questions 1–8</h3><p>Complete the table below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>THE COCONUT PALM</p><table><tbody><tr><td>Part</td><td>Description</td><td>Uses</td></tr><tr><td>trunk</td><td>up to 30 metres</td><td>timber for houses and the making of 1_______</td></tr><tr><td>leaves</td><td>up to 6 metres long</td><td>to make brushes</td></tr><tr><td>flowers</td><td>at the top of the trunk</td><td>stems provide sap, used as a drink or a source of 2_______</td></tr><tr><td>fruits</td><td>outer layer</td><td></td></tr><tr><td>middle layer (coir fibres)</td><td>used for 3_______ ,</td></tr><tr><td>Inner layer (shell)</td><td>a source of 4_______  (when halved) for 5_______</td></tr><tr><td>coconut water</td><td>a drink a source of 6_______  for other plants</td></tr><tr><td>coconut flesh</td><td>oil and milk for cooking and 7_______  glycerine (an ingredient in 8_______ )</td></tr></tbody></table>",
        "questions": [
          {
            "number": 1,
            "prompt": "trunk | up to 30 metres | timber for houses and the making of 1_______ ",
            "options": [],
            "answerKey": "furniture",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "flowers | at the top of the trunk | stems provide sap, used as a drink or a source of 2_______ ",
            "options": [],
            "answerKey": "sugar",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "middle layer (coir fibres) | used for 3_______ ,",
            "options": [],
            "answerKey": "ropes",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Inner layer (shell) | a source of 4_______  (when halved) for 5_______ ",
            "options": [],
            "answerKey": "charcoal",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Inner layer (shell) | a source of 4_______  (when halved) for 5_______ ",
            "options": [],
            "answerKey": "bowls",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "coconut water | a drink a source of 6_______  for other plants",
            "options": [],
            "answerKey": "hormones",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "coconut flesh | oil and milk for cooking and 7_______  glycerine (an ingredient in 8_______ )",
            "options": [],
            "answerKey": "cosmetics",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "coconut flesh | oil and milk for cooking and 7_______  glycerine (an ingredient in 8_______ )",
            "options": [],
            "answerKey": "dynamite",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 9–13</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 9,
            "prompt": "Coconut seeds need shade in order to germinate.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Coconuts were probably transported to Asia from America in the 16th century.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Coconuts found on the west coast of America were a different type from those found on the east coast.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "All the coconuts found in Asia are cultivated varieties.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Coconuts are cultivated in different ways in America and the Pacific.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 17,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 14–17</h3><p>Look at the following ideas and the list of researchers below.</p><p>Match each idea with the correct researcher, A, B or C.</p><p>Write the correct letter, A, B or C, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Mark VanDam",
            "Nairán Ramirez-Esparza",
            "Patricia Kuhl"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "the importance of adults giving babies individual attention when talking to them",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "the connection between what babies hear and their own efforts to create speech",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "the advantage for the baby of having two parents each speaking in a different way",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "the connection between the amount of baby talk babies hear and how much vocalising they do themselves",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 18,
        "to": 23,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 18–23</h3><p>Complete the summary below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Research into how parents talk to babies</p><p>Researchers at Washington State University used 18_______ , together with specialised computer programs, to analyse how parents interacted with their babies during a normal day. The study revealed that 19_______  tended not to modify their ordinary speech patterns when interacting with their babies. According to an idea known as the 20_______ , they may use a more adult type of speech to prepare infants for the language they will hear outside the family home.</p><p>According to the researchers, hearing baby talk from one parent and ‘normal’ language from the other expands the baby’s 21_______  of types of speech which they can practise.</p><p>Meanwhile, another study carried out by scientists from the University of Washington and the University of Connecticut recorded speech and sound using special 22_______  that the babies were equipped with. When they studies the babies again at age two, the found that those who had heard a lot of baby talk in infancy had a much larger 23_______ . Than those who had not.</p>",
        "questions": [
          {
            "number": 18,
            "prompt": "Researchers at Washington State University used 18_______ , together with specialised computer programs, to analyse how parents interacted with their babies during a normal day. The study revealed that 19_______  tended not to modify their ordinary speech patterns when interacting with their babies. According to an idea known as the 20_______ , they may use a more adult type of speech to prepare infants for the language they will hear outside the family home.",
            "options": [],
            "answerKey": "recording devices",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Researchers at Washington State University used 18_______ , together with specialised computer programs, to analyse how parents interacted with their babies during a normal day. The study revealed that 19_______  tended not to modify their ordinary speech patterns when interacting with their babies. According to an idea known as the 20_______ , they may use a more adult type of speech to prepare infants for the language they will hear outside the family home.",
            "options": [],
            "answerKey": "dads",
            "acceptedAnswers": [
              "fathers / dads"
            ]
          },
          {
            "number": 20,
            "prompt": "Researchers at Washington State University used 18_______ , together with specialised computer programs, to analyse how parents interacted with their babies during a normal day. The study revealed that 19_______  tended not to modify their ordinary speech patterns when interacting with their babies. According to an idea known as the 20_______ , they may use a more adult type of speech to prepare infants for the language they will hear outside the family home.",
            "options": [],
            "answerKey": "bridge hypothesis",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "According to the researchers, hearing baby talk from one parent and ‘normal’ language from the other expands the baby’s 21_______  of types of speech which they can practise.",
            "options": [],
            "answerKey": "repertoire",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Meanwhile, another study carried out by scientists from the University of Washington and the University of Connecticut recorded speech and sound using special 22_______  that the babies were equipped with. When they studies the babies again at age two, the found that those who had heard a lot of baby talk in infancy had a much larger 23_______ . Than those who had not.",
            "options": [],
            "answerKey": "audio-recording vests",
            "acceptedAnswers": [
              "(audio-recording) vests"
            ]
          },
          {
            "number": 23,
            "prompt": "Meanwhile, another study carried out by scientists from the University of Washington and the University of Connecticut recorded speech and sound using special 22_______  that the babies were equipped with. When they studies the babies again at age two, the found that those who had heard a lot of baby talk in infancy had a much larger 23_______ . Than those who had not.",
            "options": [],
            "answerKey": "vocabulary",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 24,
        "to": 26,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 24–26</h3><p>The Reading Passage has six paragraphs, A-F.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 24,
            "prompt": "a reference to a change which occurs in babies’ brain activity before the end of their first year.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "an example of what some parents do for their baby’s benefit before birth",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "a mention of babies’ preference for the sounds that other babies make",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 27–31</h3><p>The Reading Passage has eight paragraphs, A-H.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p><p>NB You may use any letter more than once</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "proposed explanations for the decline of the Harappan Civilisation",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "reference to a present-day application of some archaeological research findings",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "a difference between the Harappan Civilisation and another culture of the same period",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "a description of some features of Harappan urban design",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "reference to the discovery of errors made by previous archaeologists",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 36,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 32–36</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Looking at evidence of climate change</p><p>Yama Dixit and David Hodell have found the first definitive evidence of climate change affecting the plains of north-western India thousands of years ago. By collecting the 32_______  of snails and analysing them, they discovered evidence of a change in water levels in a 33_______  in the region. This occurred when there was less 34_______  than evaporation, and suggests that there was an extended period of drought.</p><p>Petrie and Singh’s team are using archaeological records to look at 35_______  from five millennia ago, in order to know whether people had adapted their agricultural practices to changing climatic conditions. They are also examining objects including 36_______ , so as to find out about links between inhabitants of different parts of the region and whether these changed over time.</p>",
        "questions": [
          {
            "number": 32,
            "prompt": "Yama Dixit and David Hodell have found the first definitive evidence of climate change affecting the plains of north-western India thousands of years ago. By collecting the 32_______  of snails and analysing them, they discovered evidence of a change in water levels in a 33_______  in the region. This occurred when there was less 34_______  than evaporation, and suggests that there was an extended period of drought.",
            "options": [],
            "answerKey": "shells",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Yama Dixit and David Hodell have found the first definitive evidence of climate change affecting the plains of north-western India thousands of years ago. By collecting the 32_______  of snails and analysing them, they discovered evidence of a change in water levels in a 33_______  in the region. This occurred when there was less 34_______  than evaporation, and suggests that there was an extended period of drought.",
            "options": [],
            "answerKey": "lake",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Yama Dixit and David Hodell have found the first definitive evidence of climate change affecting the plains of north-western India thousands of years ago. By collecting the 32_______  of snails and analysing them, they discovered evidence of a change in water levels in a 33_______  in the region. This occurred when there was less 34_______  than evaporation, and suggests that there was an extended period of drought.",
            "options": [],
            "answerKey": "rainfall",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Petrie and Singh’s team are using archaeological records to look at 35_______  from five millennia ago, in order to know whether people had adapted their agricultural practices to changing climatic conditions. They are also examining objects including 36_______ , so as to find out about links between inhabitants of different parts of the region and whether these changed over time.",
            "options": [],
            "answerKey": "grains",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Petrie and Singh’s team are using archaeological records to look at 35_______  from five millennia ago, in order to know whether people had adapted their agricultural practices to changing climatic conditions. They are also examining objects including 36_______ , so as to find out about links between inhabitants of different parts of the region and whether these changed over time.",
            "options": [],
            "answerKey": "pottery",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 37,
        "to": 40,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Look at the following statements and the list of researchers below.</p><p>Match each statement with the correct researcher, A, B, C or D.</p><p>Write the correct letter, A, B, C or D, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Cameron Petrie",
            "Ravindanath Singh",
            "Yama Dixit",
            "David Hodell"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "Finding further information about changes to environmental conditions in the region is vital.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "Examining previous patterns of behaviour may have long-term benefits.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Rough calculations indicate the approximate length of a period of water shortage.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Information about the decline of the Harappan Civilisation has been lacking.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-13-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-13-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "Cutty Sark: the fastest sailing ship of all time",
        "contentHtml": "<h2>Cutty Sark: the fastest sailing ship of all time</h2><p>The nineteenth century was a period of great technological development in Britain, and for shipping the major changes were from wind to steam power, and from wood to iron and steel.</p><p>The fastest commercial sailing vessels of all time were clippers, three-masted ships built to transport goods around the world, although some also took passengers. From the 1840s until 1869, when the Suez Canal opened and steam propulsion was replacing sail, clippers dominated world trade. Although many were built, only one has survived more or less intact: Cutty Sark, now on display in Greenwich, southeast London.</p><p>Cutty Sark’s unusual name comes from the poem Tam O’Shanter by the Scottish poet Robert Burns. Tam, a farmer, is chased by a witch called Nannie, who is wearing a ‘cutty sark’ – an old Scottish name for a short nightdress. The witch is depicted in Cutty Sark’s figurehead – the carving of a woman typically at the front of old sailing ships. In legend, and in Burns’s poem, witches cannot cross water, so this was a rather strange choice of name for a ship.</p><p>Cutty Sark was built in Dumbarton, Scotland, in 1869, for a shipping company owned by John Willis. To carry out construction, Willis chose a new shipbuilding firm, Scott &amp; Linton, and ensured that the contract with them put him in a very strong position. In the end, the firm was forced out of business, and the ship was finished by a competitor.</p><p>Willis’s company was active in the tea trade between China and Britain, where speed could bring shipowners both profits and prestige, so Cutty Sark was designed to make the journey more quickly than any other ship. On her maiden voyage, in 1870, she set sail from London, carrying large amounts of goods to China. She returned laden with tea, making the journey back to London in four months.</p><p>However, Cutty Sark never lived up to the high expectations of her owner, as a result of bad winds and various misfortunes. On one occasion, in 1872, the ship and a rival clipper, Thermopylae, left port in China on the same day. Crossing the Indian Ocean, Cutty Sark gained a lead of over 400 miles, but then her rudder was severely damaged in stormy seas, making her impossible to steer. The ship’s crew had the daunting task of repairing the rudder at sea, and only succeeded at the second attempt.</p><p>Cutty Sark reached London a week after Thermopylae.</p><p>Steam ships posed a growing threat to clippers, as their speed and cargo capacity increased. In addition, the opening of the Suez Canal in 1869, the same year that Cutty Sark was launched, had a serious impact. While steam ships could make use of the quick, direct route between the Mediterranean and the Red Sea, the canal was of no use to sailing ships, which needed the much stronger winds of the oceans, and so had to sail a far greater distance.</p><p>Steam ships reduced the journey time between Britain and China by approximately two months.</p><p>By 1878, tea traders weren’t interested in Cutty Sark, and instead, she took on the much less prestigious work of carrying any cargo between any two ports in the world. In 1880, violence aboard the ship led ultimately to the replacement of the captain with an incompetent drunkard who stole the crew’s wages. He was suspended from service, and a new captain appointed.</p><p>This marked a turnaround and the beginning of the most successful period in Cutty Sark’s working life, transporting wool from Australia to Britain. One such journey took just under 12 weeks, beating every other ship sailing that year by around a month.</p><p>The ship’s next captain, Richard Woodget, was an excellent navigator, who got the best out of both his ship and his crew. As a sailing ship, Cutty Sark depended on the strong trade winds of the southern hemisphere, and Woodget took her further south than any previous captain, bringing her dangerously close to icebergs off the southern tip of South America. His gamble paid off, though, and the ship was the fastest vessel in the wool trade for ten years.</p><p>As competition from steam ships increased in the 1890s, and Cutty Sark approached the end of her life expectancy, she became less profitable. She was sold to a Portuguese firm, which renamed her Ferreira. For the next 25 years, she again carried miscellaneous cargoes around the world.</p><p>Badly damaged in a gale in 1922, she was put into Falmouth harbor in southwest England, for repairs. Wilfred Dowman, a retired sea captain who owned a training vessel, recognised her and tried to buy her, but without success. She returned to Portugal and was sold to another Portuguese company. Dowman was determined, however, and offered a high price: this was accepted, and the ship returned to Falmouth the following year and had her original name restored.</p><p>Dowman used Cutty Sark as a training ship, and she continued in this role after his death. When she was no longer required, in 1954, she was transferred to dry dock at Greenwich to go on public display. The ship suffered from fire in 2007, and again, less seriously, in 2014, but now Cutty Sark attracts a quarter of a million visitors a year.</p>"
      },
      {
        "section": 2,
        "title": "SAVING THE SOIL",
        "contentHtml": "<h2>SAVING THE SOIL</h2><p>More than a third of the Earth’s top layer is at risk. Is there hope for our planet’s most precious resource?</p><p><strong>A</strong> More than a third of the world’s soil is endangered, according to a recent UN report. If we don’t slow the decline, all farmable soil could be gone in 60 years. Since soil grows 95% of our food, and sustains human life in other more surprising ways, that is a huge problem.</p><p><strong>B</strong> Peter Groffman, from the Cary Institute of Ecosystem Studies in New York, points out that soil scientists have been warning about the degradation of the world’s soil for decades. At the same time, our understanding of its importance to humans has grown. A single gram of healthy soil might contain 100 million bacteria, as well as other microorganisms such as viruses and fungi, living amid decomposing plants and various minerals.</p><p>That means soils do not just grow our food, but are the source of nearly all our existing antibiotics, and could be our best hope in the fight against antibiotic-resistant bacteria. Soil is also an ally against climate change: as microorganisms within soil digest dead animals and plants, they lock in their carbon content, holding three times the amount of carbon as does the entire atmosphere.</p><p>Soils also store water, preventing flood damage: in the UK, damage to buildings, roads and bridges from floods caused by soil degradation costs £233 million every year.</p><p><strong>C</strong> If the soil loses its ability to perform these functions, the human race could be in big trouble. The danger is not that the soil will disappear completely, but that the microorganisms that give it its special properties will be lost. And once this has happened, it may take the soil thousands of years to recover.</p><p>Agriculture is by far the biggest problem. In the wild, when plants grow they remove nutrients from the soil, but then when the plants die and decay these nutrients are returned directly to the soil. Humans tend not to return unused parts of harvested crops directly to the soil to enrich it, meaning that the soil gradually becomes less fertile. In the past we developed strategies to get around the problem, such as regularly varying the types of crops grown, or leaving fields uncultivated for a season.</p><p><strong>D</strong> But these practices became inconvenient as populations grew and agriculture had to be run on more commercial lines. A solution came in the early 20^{th} century with the Haber-Bosch process for manufacturing ammonium nitrate. Farmers have been putting this synthetic fertiliser on their fields ever since.</p><p>But over the past few decades, it has become clear this wasn’t such a bright idea. Chemical fertilisers can release polluting nitrous oxide into the atmosphere and excess is often washed away with the rain, releasing nitrogen into rivers. More recently, we have found that indiscriminate use of fertilisers hurts the soil itself, turning it acidic and salty, and degrading the soil they are supposed to nourish.</p><p><strong>E</strong> One of the people looking for a solution to this problem is Pius Floris, who started out running a tree-care business in the Netherlands, and now advises some of the world’s top soil scientists. He came to realise that the best way to ensure his trees flourished was to take care of the soil, and has developed a cocktail of beneficial bacteria, fungi and humus* to do this. Researchers at the University of Valladolid in Spain recently used this cocktail on soils destroyed by years of fertiliser overuse.</p><p>When they applied Floris’s mix to the desert-like test plots, a good crop of plants emerged that were not just healthy at the surface, but had roots strong enough to pierce dirt as hard as rock. The few plants that grew in the control plots, fed with traditional fertilisers, were small and weak</p><p><strong>F</strong> However, measures like this are not enough to solve the global soil degradation problem. To assess our options on a global scale we first need an accurate picture of what types of soil are out there, and the problems they face. That’s not easy. For one thing, there is no agreed international system for classifying soil. In an attempt to unify the different approaches, the UN has created the Global Soil Map project.</p><p>Researchers from nine countries are working together to create a map linked to a database that can be fed measurements from field surveys, drone surveys, satellite imagery, lab analyses and so on to provide real-time data on the state of the soil. Within the next four years, they aim to have mapped soils worldwide to a depth of 100 metres, with the results freely accessible to all.</p><p><strong>G</strong> But this is only a first step. We need ways of presenting the problem that bring it home to governments and the wider public, says Pamela Chasek at the International Institute for Sustainable Development, in Winnipeg, Canada. ‘Most scientists don’t speak language that policy-makers can understand, and vice versa.’ Chasek and her colleagues have proposed a goal of ‘zero net land degradation’.</p><p>Like the idea of carbon neutrality, it is an easily understood target that can help shape expectations and encourage action.</p><p>For soils on the brink, that may be too late. Several researchers are agitating for the immediate creation of protected zones for endangered soils. One difficulty here is defining what these areas should conserve: areas where the greatest soil diversity is present? Or areas of unspoilt soils that could act as a future benchmark of quality?</p><p>Whatever we do, if we want our soils to survive, we need to take action now.</p>"
      },
      {
        "section": 3,
        "title": "Book Review",
        "contentHtml": "<h2>Book Review</h2><p>The Happiness Industry: How the Government and Big Business Sold Us Well-Being</p><p>By William Davies</p><p>‘Happiness is the ultimate goal because it is self-evidently good. If we are asked why happiness matters we can give no further external reason. It just obviously does matter.’ This pronouncement by Richard Layard, an economist and advocate of ‘positive psychology’, summarises the beliefs of many people today. For Layard and others like him, it is obvious that the purpose of government is to promote a state of collective well-being.</p><p>The only question is how to achieve it, and here positive psychology – a supposed science that not only identifies what makes people happy but also allows their happiness to be measured – can show the way. Equipped with this science, they say, governments can secure happiness in society in a way they never could in the past.</p><p>It is an astonishingly crude and simple-minded way of thinking, and for that very reason increasingly popular. Those who think in this way are oblivious to the vast philosophical literature in which the meaning and value of happiness have been explored and questioned, and write as if nothing of any importance had been thought on the subject until it came to their attention.</p><p>It was the philosopher Jeremy Bentham (1748-1832) who was more than anyone else responsible for the development of this way of thinking. For Bentham it was obvious that the human good consists of pleasure and the absence of pain. The Greek philosopher Aristotle may have identified happiness with self-realisation in the 4th century BC, and thinkers throughout the ages may have struggled to reconcile the pursuit of happiness with other human values, but for Bentham all this was mere metaphysics or fiction.</p><p>Without knowing anything much of him or the school of moral theory he established – since they are by education and intellectual conviction illiterate in the history of ideas – our advocates of positive psychology follow in his tracks in rejecting as outmoded and irrelevant pretty much the entirety of ethical reflection on human happiness to date.</p><p>But as William Davies notes in his recent book The Happiness Industry, the view that happiness is the only self-evident good is actually a way of limiting moral inquiry. One of the virtues of this rich, lucid and arresting book is that it places the current cult of happiness in a well-defined historical framework. Rightly, Davies begins his story with Bentham, noting that he was far more than a philosopher.</p><p>Davies writes, ‘Bentham’s activities were those which we might now associate with a public sector management consultant’. In the 1790s, he wrote to the Home Office suggesting that the departments of government be linked together through a set of ‘conversation tubes’, and to the Bank of England with a design for a printing device that could produce unforgeable banknotes. He drew up plans for a ‘frigidarium’ to keep provisions such as meat, fish, fruit and vegetables fresh.</p><p>His celebrated design for a prison to be known as a ‘Panopticon’, in which prisoners would be kept in solitary confinement while being visible at all times to the guards, was very nearly adopted. (Surprisingly, Davies does not discuss the fact that Bentham meant his Panopticon not just as a model prison but also as an instrument of control that could be applied to schools and factories.)</p><p>Bentham was also a pioneer of the ‘science of happiness’. If happiness is to be regarded as a science, it has to be measured, and Bentham suggested two ways in which this might be done. Viewing happiness as a complex of pleasurable sensations, he suggested that it might be quantified by measuring the human pulse rate.</p><p>Alternatively, money could be used as the standard for quantification: if two different goods have the same price, it can be claimed that they produce the same quantity of pleasure in the consumer. Bentham was more attracted by the latter measure. By associating money so closely to inner experience, Davies writes, Bentham ‘set the stage for the entangling of psychological research and capitalism that would shape the business practices of the twentieth century’.</p><p>The Happiness Industry describes how the project of a science of happiness has become integral to capitalism. We learn much that is interesting about how economic problems are being redefined and treated as psychological maladies. In addition, Davies shows how the belief that inner states of pleasure and displeasure can be objectively measured has informed management studies and advertising.</p><p>The tendency of thinkers such as J B Watson, the founder of behaviourism*, was that human beings could be shaped, or manipulated, by policymakers and managers. Watson had no factual basis for his view of human action. When he became president of the American Psychological Association in 1915, he ‘had never even studied a single human being’: his research had been confined to experiments on white rats.</p><p>Yet Watson’s reductive model is now widely applied, with ‘behaviour change’ becoming the goal of governments: in Britain, a ‘Behaviour Insights Team’ has been established by the government to study how people can be encouraged, at minimum cost to the public purse, to live in what are considered to be socially desirable ways.</p><p>Modern industrial societies appear to need the possibility of ever-increasing happiness to motivate them in their labours. But whatever its intellectual pedigree, the idea that governments should be responsible for promoting happiness is always a threat to human freedom.</p><p>* ‘behaviourism’: a branch of psychology which is concerned with observable behaviour</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 8,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–8</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "Clippers were originally intended to be used as passenger ships.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Cutty Sark was given the name of a character in a poem.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "The contract between John Willis and Scott & Linton favoured Willis.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "John Willis wanted Cutty Sark to be the fastest tea clipper travelling between the UK and China.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Despite storm damage, Cutty Sark beat Thermopylae back to London.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "The opening of the Suez Canal meant that steam ships could travel between Britain and China faster than clippers.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "Steam ships sometimes used the ocean route to travel between London and China.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Captain Woodget put Cutty Sark at risk of hitting an iceberg.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 13,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 9–13</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• After 1880, Cutty Sark carried 9_______  as its main cargo during its most successful time.</p><p>• As a captain and 10_______ , Woodget was very skilled.</p><p>• Ferreira went to Falmouth to repair damage that a 11_______  had caused.</p><p>• Between 1923 and 1954, Cutty Sark was used for 12_______ </p><p>• Cutty Sark has twice been damaged by 13_______  in the 21st century.</p>",
        "questions": [
          {
            "number": 9,
            "prompt": "* After 1880, Cutty Sark carried 9_______  as its main cargo during its most successful time.",
            "options": [],
            "answerKey": "wool",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "* As a captain and 10_______ , Woodget was very skilled.",
            "options": [],
            "answerKey": "navigator",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "* Ferreira went to Falmouth to repair damage that a 11_______  had caused.",
            "options": [],
            "answerKey": "gale",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "* Between 1923 and 1954, Cutty Sark was used for 12_______ ",
            "options": [],
            "answerKey": "training",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "* Cutty Sark has twice been damaged by 13_______  in the 21st century.",
            "options": [],
            "answerKey": "fire",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 17,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 14–17</h3><p>Complete the summary below.</p><p>Write ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Why soil degradation could be a disaster for humans</p><p>Healthy soil contains a large variety of bacteria and other microorganisms, as well as plant remains and 14_______ . It provides us with food and also with antibiotics, and its function in storing 15_______  has a significant effect on the climate. In addition, it prevents damage to property and infrastructure because it holds 16_______ .</p><p>If these microorganisms are lost, soil may lose its special properties. The main factor contributing to soil degradation is the 17_______  carried out by humans.</p>",
        "questions": [
          {
            "number": 14,
            "prompt": "Healthy soil contains a large variety of bacteria and other microorganisms, as well as plant remains and 14_______ . It provides us with food and also with antibiotics, and its function in storing 15_______  has a significant effect on the climate. In addition, it prevents damage to property and infrastructure because it holds 16_______ .",
            "options": [],
            "answerKey": "minerals",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "Healthy soil contains a large variety of bacteria and other microorganisms, as well as plant remains and 14_______ . It provides us with food and also with antibiotics, and its function in storing 15_______  has a significant effect on the climate. In addition, it prevents damage to property and infrastructure because it holds 16_______ .",
            "options": [],
            "answerKey": "carbon",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Healthy soil contains a large variety of bacteria and other microorganisms, as well as plant remains and 14_______ . It provides us with food and also with antibiotics, and its function in storing 15_______  has a significant effect on the climate. In addition, it prevents damage to property and infrastructure because it holds 16_______ .",
            "options": [],
            "answerKey": "water",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "If these microorganisms are lost, soil may lose its special properties. The main factor contributing to soil degradation is the 17_______  carried out by humans.",
            "options": [],
            "answerKey": "agriculture",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 18,
        "to": 21,
        "type": "matching",
        "displayType": "sentence-ending",
        "instructionHtml": "<h3>Questions 18–21</h3><p>Complete each sentence with the correct ending, A-F, below.</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
        "config": {
          "sentenceEndings": [
            "may improve the number and quality of plants growing there.",
            "may contain data from up to nine countries.",
            "may not be put back into the soil.",
            "may help governments to be more aware of soil-related issues.",
            "may cause damage to different aspects of the environment.",
            "may be better for use at a global level."
          ]
        },
        "questionHtml": "<p>• Nutrients contained in the unused parts of harvested crops 18_______ </p><p>• Synthetic fertilisers produced with Haber-Bosch process 19_______ </p><p>• Addition of a mixture developed by Pius Floris to the soil 20_______ </p><p>• The idea of zero net soil degradation 21_______ </p>",
        "questions": [
          {
            "number": 18,
            "prompt": "• Nutrients contained in the unused parts of harvested crops 18_______ ",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "• Synthetic fertilisers produced with Haber-Bosch process 19_______ ",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "• Addition of a mixture developed by Pius Floris to the soil 20_______ ",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "• The idea of zero net soil degradation 21_______ ",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 22,
        "to": 26,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 22–26</h3><p>The Reading Passage has seven paragraphs, A-G.</p><p>Which section contains the following information?</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 22,
            "prompt": "a reference to one person’s motivation for a soil-improvement project",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "an explanation of how soil stayed healthy before the development of farming",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "examples of different ways of collecting information on soil degradation",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "a suggestion for a way of keeping some types of soil safe in the near future",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "a reason why it is difficult to provide an overview of soil degradation",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 29,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 27–29</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "What is the reviewer’s attitude to advocates of positive psychology?",
            "options": [
              "They are wrong to reject the ideas of Bentham.",
              "They are over-influenced by their study of Bentham’s theories.",
              "They have a fresh new approach to ideas on human happiness.",
              "They are ignorant about the ideas they should be considering."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "The reviewer refers to the Greek philosopher Aristotle in order to suggest that happiness",
            "options": [
              "may not be just pleasure and the absence of pain.",
              "should not be the main goal of humans.",
              "is not something that should be fought for.",
              "is not just an abstract concept."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "According to Davies, Bentham’s suggestion for linking the price of goods to happiness was significant because",
            "options": [
              "it was the first successful way of assessing happiness.",
              "it established a connection between work and psychology.",
              "it was the first successful example of psychological research.",
              "it involved consideration of the rights of consumers."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 30,
        "to": 34,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 30–34</h3><p>Complete the summary using the list of words A-G below.</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "measurement",
            "security",
            "implementation",
            "profits",
            "observation",
            "communication",
            "preservation"
          ]
        },
        "questionHtml": "<p>Jeremy Bentham</p><p>Jeremy Bentham was active in other areas besides philosophy. In the 1970s he suggested a type of technology to improve 30_______  for different Government departments. He developed a new way of printing banknotes to increase 31_______  and also designed a method for the 32_______  of food.</p><p>He also drew up plans for a prison which allowed the 33_______  of prisoners at al times, and believed the same design could be used for other institutions as well. When researching happiness, he investigated possibilities for its 34_______ , and suggested some methods of doing this.</p>",
        "questions": [
          {
            "number": 30,
            "prompt": "Jeremy Bentham was active in other areas besides philosophy. In the 1970s he suggested a type of technology to improve 30_______  for different Government departments. He developed a new way of printing banknotes to increase 31_______  and also designed a method for the 32_______  of food.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Jeremy Bentham was active in other areas besides philosophy. In the 1970s he suggested a type of technology to improve 30_______  for different Government departments. He developed a new way of printing banknotes to increase 31_______  and also designed a method for the 32_______  of food.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "Jeremy Bentham was active in other areas besides philosophy. In the 1970s he suggested a type of technology to improve 30_______  for different Government departments. He developed a new way of printing banknotes to increase 31_______  and also designed a method for the 32_______  of food.",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "He also drew up plans for a prison which allowed the 33_______  of prisoners at al times, and believed the same design could be used for other institutions as well. When researching happiness, he investigated possibilities for its 34_______ , and suggested some methods of doing this.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "He also drew up plans for a prison which allowed the 33_______  of prisoners at al times, and believed the same design could be used for other institutions as well. When researching happiness, he investigated possibilities for its 34_______ , and suggested some methods of doing this.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 35,
        "to": 40,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 35–40</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 35,
            "prompt": "One strength of The Happiness Industry is its discussion of the relationship between psychology and economics.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "It is more difficult to measure some emotions than others.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Watson’s ideas on behaviourism were supported by research on humans he carried out before 1915.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "Watson’s ideas have been most influential on governments outside America.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "The need for happiness is linked to industrialisation.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "A main aim of government should be to increase the happiness of the population.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-14-1",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-14-academic-reading-test-1/",
    "sections": [
      {
        "section": 1,
        "title": "THE IMPORTANCE OF CHILDREN’S PLAY",
        "contentHtml": "<h2>THE IMPORTANCE OF CHILDREN’S PLAY</h2><p>Brick by brick, six-year-old Alice is building a magical kingdom. Imagining fairy-tale turrets and fire-breathing dragons, wicked witches and gallant heroes, she’s creating an enchanting world. Although she isn’t aware of it, this fantasy is helping her take her first steps towards her capacity for creativity and so it will have important repercussions in her adult life.</p><p>Minutes later, Alice has abandoned the kingdom in favour of playing schools with her younger brother. When she bosses him around as his ‘teacher’, she’s practising how to regulate her emotions through pretence. Later on, when they tire of this and settle down with a board game, she’s learning about the need to follow rules and take turns with a partner.</p><p>‘Play in all its rich variety is one of the highest achievements of the human species,’ says Dr David Whitebread from the Faculty of Education at the University of Cambridge, UK. ‘It underpins how we develop as intellectual, problem-solving adults and is crucial to our success as a highly adaptable species.’</p><p>Recognizing the importance of play is not new: over two millennia ago, the Greek philosopher Plato extolled its virtues as a means of developing skills for adult life, and ideas about play-based learning have been developing since the 19th century.</p><p>But we live in changing times, and Whitebread is mindful of a worldwide decline in play, pointing out that over half the people in the world now live in cities. ‘The opportunities for free play, which I experienced almost every day of my childhood, are becoming increasingly scarce,’ he says.</p><p>Outdoor play is curtailed by perceptions of risk to do with traffic, as well as parents’ increased wish to protect their children from being the victims of crime, and by the emphasis on ‘earlier is better’ which is leading to greater competition in academic learning and schools.</p><p>International bodies like the United Nations and the European Union have begun to develop policies concerned with children’s right to play, and to consider implications for leisure facilities and educational programmes. But what they often lack is the evidence to base policies on.</p><p>‘The type of play we are interested in is child-initiated, spontaneous and unpredictable – but, as soon as you ask a five-year-old “to play”, then you as the researcher have intervened,’ explains Dr Sara Baker. ‘And we want to know what the long-term impact of play is. It’s a real challenge.’</p><p>Dr Jenny Gibson agrees, pointing out that although some of the steps in the puzzle of how and why play is important have been looked at, there is very little data on the impact it has on the child’s later life.</p><p>Now, thanks to the university’s new Centre for Research on Play in Education, Development and Learning (PEDAL), Whitebread, Baker, Gibson and a team of researchers hope to provide evidence on the role played by play in how a child develops.</p><p>‘A strong possibility is that play supports the early development of children’s self-control,’ explains Baker. ‘This is our ability to develop awareness of our own thinking progresses – it influences how effectively we go about undertaking challenging activities.’</p><p>In a study carried out by Baker with toddlers and young pre-schoolers, she found that children with greater self-control solved problems more quickly when exploring an unfamiliar set-up requiring scientific reasoning. ‘This sort of evidence makes up think that giving children the chance to play will make them more successful problem-solvers in the long run.’</p><p>If playful experiences do facilitate this aspect of development, say the researchers, it could be extremely significant for educational practices, because the ability to self-regulate has been shown to be a key predictor of academic performance.</p><p>Gibson adds: ‘Playful behavior is also an important indicator of healthy social and emotional development. In my previous research, I investigated how observing children at play can give us important clues about their well-being and can even be useful in the diagnosis of neurodevelopmental disorders like autism.’</p><p>Whitebread’s recent research has involved developing a play-based approach to supporting children’s writing. ‘Many primary school children find writing difficult, but we showed in a previous study that a playful stimulus was far more effective than an instructional one.’ Children wrote longer and better-structured stories when they first played with dolls representing characters in the story. In the latest study, children first created their story with Lego*, with similar results.</p><p>‘Many teachers commented that they had always previously had children saying they didn’t know what to write about. With the Lego building, however, not a single child said this through the whole year of the project.’</p><p>Whitebread, who directs PEDAL, trained as a primary school teacher in the early 1970s, when, as he describes, ‘the teaching of young children was largely a quiet backwater, untroubled by any serious intellectual debate or controversy.’ Now, the landscape is very different, with hotly debated topics such as school starting age.</p><p>‘Somehow the importance of play has been lost in recent decades. It’s regarded as something trivial, or even as something negative that contrasts with “work”. Let’s not lose sight of its benefits, and the fundamental contributions it makes to human achievements in the arts, sciences and technology. Let’s make sure children have a rich diet of play experiences.’</p><p>* Lego: coloured plastic building blocks and other pieces that can be joined together</p>"
      },
      {
        "section": 2,
        "title": "The growth of bike-sharing schemes around the world",
        "contentHtml": "<h2>The growth of bike-sharing schemes around the world</h2><p>How Dutch engineer Luud Schimmelpennink helped to devise urban bike-sharing schemes</p><p><strong>A</strong> The original idea for an urban bike-sharing scheme dates back to a summer’s day in Amsterdam in 1965. Provo, the organization that came up with the idea, was a group of Dutch activists who wanted to change society. They believed the scheme, which was known as the Witte Fietsenplan, was an answer to the perceived threats of air pollution and consumerism. In the centre of Amsterdam, they painted a small number of used bikes white.</p><p>They also distributed leaflets describing the dangers of cars and inviting people to use the white bikes. The bikes were then left unlocked at various locations around the city, to be used by anyone in need of transport.</p><p><strong>B</strong> Luud Schimmelpennink, a Dutch industrial engineer who still lives and cycles in Amsterdam, was heavily involved in the original scheme. He recalls how the scheme succeeded in attracting a great deal of attention – particularly when it came to publicising Provo’s aims – but struggled to get off the ground. The police were opposed to Provo’s initiatives and almost as soon as the white bikes were distributed around the city, they removed them.</p><p>However, for Schimmelpennink and for bike-sharing schemes in general, this was just the beginning. ‘The first Witte Fietsenplan was just a symbolic thing,’ he says. ‘We painted a few bikes white, that was all. Things got more serious when I became a member of the Amsterdam city council two years later.’</p><p><strong>C</strong> Schimmelpennink seized this opportunity to present a more elaborate Witte Fietsenplan to the city council. ‘My idea was that the municipality of Amsterdam would distribute 10,000 white bikes over the city, for everyone to use,’ he explains. ‘I made serious calculations. It turned out that a white bicycle – per person, per kilometer – would cost the municipality only 10% of what it contributed to public transport per person per kilometer.’ Nevertheless, the council unanimously rejected the plan.</p><p>‘They said that the bicycle belongs to the past. They saw a glorious future for the car,’ says Schimmelpennink. But he was not in the least discouraged.</p><p><strong>D</strong> Schimmelpennink never stopped believing in bike-sharing, and in the mid-90s, two Danes asked for his help to set up a system in Copenhagen. The result was the world’s first large-scale bike-share programme. It worked on a deposit: ‘You dropped a coin in the bike and when you returned it, you got your money back.’ After setting up the Danish system, Schimmelpennink decided to try his luck again in the Netherlands – and this time he succeeded in arousing the interest of the Dutch Ministry of Transport.</p><p>‘Times had changed,’ he recalls. ‘People had become more environmentally conscious, and the Danish experiment had proved that bike-sharing was a real possibility.’ A new Witte Fietsenplan was launched in 1999 in Amsterdam. However, riding a white bike was no longer free; it cost one guilder per trip and payment was made with a chip card developed by the Dutch bank Postbank.</p><p>Schimmelpennink designed conspicuous, sturdy white bikes locked in special racks which could be opened with the chip card – the plan started with 250 bikes, distributed over five stations.</p><p><strong>E</strong> Theo Molenaar, who was a system designer for the project, worked alongside Schimmelpennink. ‘I remember when we were testing the bike racks, he announced that he had already designed better ones. But of course, we had to go through with the ones we had.’ The system, however, was prone to vandalism and theft. ‘After every weekend there would always be a couple of bikes missing,’ Molenaar says.</p><p>‘I really have no idea what people did with them, because they could instantly be recognised as white bikes.’ But the biggest blow came when Postbank decided to abolish the chip card, because it wasn’t profitable. ‘That chip card was pivotal to the system,’ Molenaar says. ‘To continue the project we would have needed to set up another system, but the business partner had lost interest.’</p><p><strong>F</strong> Schimmelpennink was disappointed, but – characteristically – not for long. In 2002 he got a call from the French advertising corporation JC Decaux, who wanted to set up his bike-sharing scheme in Vienna. ‘That went really well. After Vienna, they set up a system in Lyon. Then in 2007, Paris followed.</p><p>That was a decisive moment in the history of bike-sharing.’ The huge and unexpected success of the Parisian bike-sharing programme, which now boasts more than 20,000 bicycles, inspired cities all over the world to set up their own schemes, all modelled on Schimmelpennink’s. ‘It’s wonderful that this happened,’ he says. ‘But financially I didn’t really benefit from it, because I never filed for a patent.’</p><p><strong>G</strong> In Amsterdam today, 38% of all trips are made by bike and, along with Copenhagen, it is regarded as one of the two most cycle-friendly capitals in the world – but the city never got another Witte Fietsenplan. Molenaar believes this may be because everybody in Amsterdam already has a bike. Schimmelpennink, however, cannot see that this changes Amsterdam’s need for a bike-sharing scheme. ‘People who travel on the underground don’t carry their bikes around.</p><p>But often they need additional transport to reach their final destination.’ Although he thinks it is strange that a city like Amsterdam does not have a successful bike-sharing scheme, he is optimistic about the future. ‘In the ‘60s we didn’t stand a chance because people were prepared to give their lives to keep cars in the city. But that mentality has totally changed. Today everybody longs for cities that are not dominated by cars.’</p>"
      },
      {
        "section": 3,
        "title": "Motivational factors and the hospitality industry",
        "contentHtml": "<h2>Motivational factors and the hospitality industry</h2><p>A critical ingredient in the success of hotels is developing and maintaining superior performance from their employees. How is that accomplished? What Human Resource Management (HRM) practices should organizations invest in to acquire and retain great employees?</p><p>Some hotels aim to provide superior working conditions for their employees. The idea originated from workplaces – usually in the non-service sector – that emphasized fun and enjoyment as part of work-life balance. By contrast, the service sector, and more specifically hotels, has traditionally not extended these practices to address basic employee needs, such as good working conditions.</p><p>Pfeffer (1994) emphasizes that in order to succeed in a global business environment, organizations must make investment in Human Resource Management (HRM) to allow them to acquire employees who possess better skills and capabilities than their competitors. This investment will be to their competitive advantage. Despite this recognition of the importance of employee development, the hospitality industry has historically been dominated by underdeveloped HR practices (Lucas, 2002).</p><p>Lucas also points out that ‘the substance of HRM practices does not appear to be designed to foster constructive relations with employees or to represent a managerial approach that enables developing and drawing out the full potential of people, even though employees may be broadly satisfied with many aspects of their work’ (Lucas, 2002). In addition, or maybe as a result, high employee turnover has been a recurring problem throughout the hospitality industry.</p><p>Among the many cited reasons are low compensation, inadequate benefits, poor working conditions and compromised employee morale and attitudes (Maroudas et al., 2008).</p><p>Ng and Sorensen (2008) demonstrated that when managers provide recognition to employees, motivate employees to work together, and remove obstacles preventing effective performance, employees feel more obligated to stay with the company. This was succinctly summarized by Michel et al.</p><p>(2013): ‘[P]roviding support to employees gives them the confidence to perform their jobs better and the motivation to stay with the organization.’ Hospitality organizations can therefore enhance employee motivation and retention through the development and improvement of their working conditions. These conditions are inherently linked to the working environment.</p><p>While it seems likely that employees’ reactions to their job characteristics could be affected by a predisposition to view their work environment negatively, no evidence exists to support this hypothesis (Spector et al., 2000). However, given the opportunity, many people will find something to complain about in relation to their workplace (Poulston, 2009).</p><p>There is a strong link between the perceptions of employees and particular factors of their work environment that are separate from the work itself, including company policies, salary and vacations.</p><p>Such conditions are particularly troubling for the luxury hotel market, where high-quality service, requiring a sophisticated approach to HRM, is recognized as a critical source of competitive advantage (Maroudas et al., 2008). In a real sense, the services of hotel employees represent their industry (Schneider and Bowen, 1993). This representation has commonly been limited to guest experiences.</p><p>This suggests that there has been a dichotomy between the guest environment provided in luxury hotels and the working conditions of their employees.</p><p>It is therefore essential for hotel management to develop HRM practices that enable them to inspire and retain competent employees. This requires an understanding of what motivates employees at different levels of management and different stages of their careers (Enz and Siguaw, 2000). This implies that it is beneficial for hotel managers to understand what practices are most favorable to increase employee satisfaction and retention.</p><p>Herzberg (1966) proposes that people have two major types of needs, the first being extrinsic motivation factors relating to the context in which work is performed, rather than the work itself. These include working conditions and job security. When these factors are unfavorable, job dissatisfaction may result. Significantly, though, just fulfilling these needs does not result in satisfaction, but only in the reduction of dissatisfaction (Maroudas et al., 2008).</p><p>Employees also have intrinsic motivation needs or motivators, which include such factors as achievement and recognition. Unlike extrinsic factors, motivator factors may ideally result in job satisfaction (Maroudas et al., 2008). Herzberg’s (1966) theory discusses the need for a ‘balance’ of these two types of needs.</p><p>The impact of fun as a motivating factor at work has also been explored. For example, Tews, Michel and Stafford (2013) conducted a study focusing on staff from a chain of themed restaurants in the United States. It was found that fun activities had a favorable impact on performance and manager support for fun had a favorable impact in reducing turnover.</p><p>Their findings support the view that fun may indeed have a beneficial effect, but the framing of that fun must be carefully aligned with both organizational goals and employee characteristics. ‘Managers must learn how to achieve the delicate balance of allowing employees the freedom to enjoy themselves at work while simultaneously high levels of performance’ (Tews et al., 2013).</p><p>Deery (2008) has recommended several actions that can be adopted at the organizational level to retain good staff as well as assist in balancing work and family life. Those particularly appropriate to the hospitality industry include allowing adequate breaks during the working day, staff functions that involve families, and providing health and well-being opportunities.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 8,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–8</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Children’s play</p><p>Uses of children’s play</p><p>• building a ‘magical kingdom’ may help develop 1_______ </p><p>• board games involve 2_______  and turn-taking</p><p>Recent changes affecting children’s play</p><p>• population of 3_______  have grown</p><p>• opportunities for free play are limited due to</p><p>• fear of 4_______ </p><p>• fear of 5_______ </p><p>• increased 6_______  in schools</p><p>International policies on children’s play</p><p>• it is difficult to find 7_______  to support new policies</p><p>• research needs to study the impact of play on the rest of the child’s 8_______ </p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* building a ‘magical kingdom’ may help develop 1_______ ",
            "options": [],
            "answerKey": "creativity",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* board games involve 2_______  and turn-taking",
            "options": [],
            "answerKey": "rules",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "* population of 3_______  have grown",
            "options": [],
            "answerKey": "cities",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* fear of 4_______ ",
            "options": [],
            "answerKey": "traffic",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* fear of 5_______ ",
            "options": [],
            "answerKey": "crime",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "* increased 6_______  in schools",
            "options": [],
            "answerKey": "competition",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "* it is difficult to find 7_______  to support new policies",
            "options": [],
            "answerKey": "evidence",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "* research needs to study the impact of play on the rest of the child’s 8_______ ",
            "options": [],
            "answerKey": "life",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 9–13</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 9,
            "prompt": "Children with good self-control are known to be likely to do well at school later on.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "The way a child plays may provide information about possible medical problems.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Playing with dolls was found to benefit girls’ writing more than boys’ writing.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Children had problems thinking up ideas when they first created the story with Lego.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "People nowadays regard children’s play as less significant than they did in the past.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 18,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–18</h3><p>The Reading Passage has seven paragraphs, A-G.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "a description of how people misused a bike-sharing scheme",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "an explanation of why a proposed bike-sharing scheme was turned down",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "a reference to a person being unable to profit their work",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "an explanation of the potential savings a bike-sharing scheme would bring",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "a reference to the problems a bike-sharing scheme was intended to solve",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 20,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 19–20</h3><p>Choose TWO letters, A-E</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 19,
            "prompt": "Which TWO of the following statements are made in the text about the Amsterdam bike-sharing scheme of 1999?",
            "options": [
              "It was initially opposed by a government department.",
              "It failed when a partner in the scheme withdrew support.",
              "It aimed to be more successful than the Copenhagen scheme.",
              "It was made possible by a change in people’s attitudes.",
              "It attracted interest from a range of bike designers."
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 20,
            "prompt": "Which TWO of the following statements are made in the text about the Amsterdam bike-sharing scheme of 1999?",
            "options": [
              "It was initially opposed by a government department.",
              "It failed when a partner in the scheme withdrew support.",
              "It aimed to be more successful than the Copenhagen scheme.",
              "It was made possible by a change in people’s attitudes.",
              "It attracted interest from a range of bike designers."
            ],
            "answerKey": "D",
            "acceptedAnswers": [
              "B"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 21,
        "to": 22,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 21–22</h3><p>Choose TWO letters, A-E</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 21,
            "prompt": "Which TWO of the following statements are made in the text about Amsterdam today?",
            "options": [
              "The majority of residents would like to prevent all cars from entering the city.",
              "There is little likelihood of the city having another bike-sharing scheme.",
              "More trips in the city are made by bike than by any other form of transport.",
              "A bike-sharing scheme would benefit residents who use public transport.",
              "The city has a reputation as a place that welcomes cyclists."
            ],
            "answerKey": "D",
            "acceptedAnswers": [
              "E"
            ]
          },
          {
            "number": 22,
            "prompt": "Which TWO of the following statements are made in the text about Amsterdam today?",
            "options": [
              "The majority of residents would like to prevent all cars from entering the city.",
              "There is little likelihood of the city having another bike-sharing scheme.",
              "More trips in the city are made by bike than by any other form of transport.",
              "A bike-sharing scheme would benefit residents who use public transport.",
              "The city has a reputation as a place that welcomes cyclists."
            ],
            "answerKey": "E",
            "acceptedAnswers": [
              "D"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 26,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 23–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The first urban bike-sharing scheme</p><p>The first bike-sharing scheme was the idea of the Dutch group Provo. The people who belonged to this group were 23_______ . They were concerned about damage to the environment and about 24_______ , and believed that the bike-sharing scheme would draw attention to these issues. As well as painting some bikes white, they handed out 25_______  that condemned the use of cars.</p><p>However, the scheme was not a great success: almost as quickly as Provo left the bikes around the city, the 26_______  Took them away. According to Schimmelpennink, the scheme was intended to be symbolic. The idea was to get people thinking about the issues.</p>",
        "questions": [
          {
            "number": 23,
            "prompt": "The first bike-sharing scheme was the idea of the Dutch group Provo. The people who belonged to this group were 23_______ . They were concerned about damage to the environment and about 24_______ , and believed that the bike-sharing scheme would draw attention to these issues. As well as painting some bikes white, they handed out 25_______  that condemned the use of cars.",
            "options": [],
            "answerKey": "activists",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "The first bike-sharing scheme was the idea of the Dutch group Provo. The people who belonged to this group were 23_______ . They were concerned about damage to the environment and about 24_______ , and believed that the bike-sharing scheme would draw attention to these issues. As well as painting some bikes white, they handed out 25_______  that condemned the use of cars.",
            "options": [],
            "answerKey": "consumerism",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "The first bike-sharing scheme was the idea of the Dutch group Provo. The people who belonged to this group were 23_______ . They were concerned about damage to the environment and about 24_______ , and believed that the bike-sharing scheme would draw attention to these issues. As well as painting some bikes white, they handed out 25_______  that condemned the use of cars.",
            "options": [],
            "answerKey": "leaflets",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "However, the scheme was not a great success: almost as quickly as Provo left the bikes around the city, the 26_______  Took them away. According to Schimmelpennink, the scheme was intended to be symbolic. The idea was to get people thinking about the issues.",
            "options": [],
            "answerKey": "police",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Look at the following statements and the list of researchers below.</p><p>Match each statement with the correct researcher, A-F.</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Pfeffer",
            "Lucas",
            "Maroudas et al.",
            "Ng and Sorensen",
            "Enz and Siguaw",
            "Deery"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "Hotel managers need to know what would encourage good staff to remain.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "The actions of managers may make staff feel they shouldn’t move to a different employer.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Little is done in the hospitality industry to help workers improve their skills.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Staff are less likely to change jobs if cooperation is encouraged.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Dissatisfaction with pay is not the only reason why hospitality workers change jobs.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 35,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 32–35</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 32,
            "prompt": "One reason for high staff turnover in the hospitality industry is poor morale.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Research has shown that staff have a tendency to dislike their workplace.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "An improvement in working conditions and job security makes staff satisfied with their jobs.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Staff should be allowed to choose when they take breaks during the working day.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 36,
        "to": 40,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 36–40</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Fun at work</p><p>Tews, Michel and Stafford carried out research on staff in an American chain of 36_______ . They discovered that activities designed for staff to have fun improved their 37_______ , and that management involvement led to lower staff 38_______ . They also found that the activities needed to fit with both the company’s 39_______  and the 40_______  Of the staff. A balance was required between a degree of freedom and maintaining work standards.</p>",
        "questions": [
          {
            "number": 36,
            "prompt": "Tews, Michel and Stafford carried out research on staff in an American chain of 36_______ . They discovered that activities designed for staff to have fun improved their 37_______ , and that management involvement led to lower staff 38_______ . They also found that the activities needed to fit with both the company’s 39_______  and the 40_______  Of the staff. A balance was required between a degree of freedom and maintaining work standards.",
            "options": [],
            "answerKey": "restaurants",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Tews, Michel and Stafford carried out research on staff in an American chain of 36_______ . They discovered that activities designed for staff to have fun improved their 37_______ , and that management involvement led to lower staff 38_______ . They also found that the activities needed to fit with both the company’s 39_______  and the 40_______  Of the staff. A balance was required between a degree of freedom and maintaining work standards.",
            "options": [],
            "answerKey": "performance",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "Tews, Michel and Stafford carried out research on staff in an American chain of 36_______ . They discovered that activities designed for staff to have fun improved their 37_______ , and that management involvement led to lower staff 38_______ . They also found that the activities needed to fit with both the company’s 39_______  and the 40_______  Of the staff. A balance was required between a degree of freedom and maintaining work standards.",
            "options": [],
            "answerKey": "turnover",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Tews, Michel and Stafford carried out research on staff in an American chain of 36_______ . They discovered that activities designed for staff to have fun improved their 37_______ , and that management involvement led to lower staff 38_______ . They also found that the activities needed to fit with both the company’s 39_______  and the 40_______  Of the staff. A balance was required between a degree of freedom and maintaining work standards.",
            "options": [],
            "answerKey": "goals",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Tews, Michel and Stafford carried out research on staff in an American chain of 36_______ . They discovered that activities designed for staff to have fun improved their 37_______ , and that management involvement led to lower staff 38_______ . They also found that the activities needed to fit with both the company’s 39_______  and the 40_______  Of the staff. A balance was required between a degree of freedom and maintaining work standards.",
            "options": [],
            "answerKey": "characteristics",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-14-2",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-14-academic-reading-test-2/",
    "sections": [
      {
        "section": 1,
        "title": "Alexander Henderson (1831-1913)",
        "contentHtml": "<h2>Alexander Henderson (1831-1913)</h2><p>Born in Scotland, Henderson emigrated to Canada in 1855 and become a well-known landscape photographer</p><p>Alexander Henderson was born in Scotland in 1831 and was the son of a successful merchant. His grandfather, also called Alexander, had founded the family business, and later became the first chairman of the National Bank of Scotland. The family had extensive landholding in Scotland. Besides its residence in Edinburgh, it owned Press Estate, 650 acres of farmland about 35 miles southeast of the city.</p><p>The family often stayed at Press Castle, the large mansion on the northern edge of the property, and Alexander spent much of his childhood in the area, playing on the beach near Eyemouth or fishing in the streams nearby.</p><p>Even after he went to school at Murcheston Academy on the outskirts of Edinburgh, Henderson returned to Press at weekends. In 1849 he began a three-year apprenticeship to become an accountant. Although he never liked the prospect of a business career, he stayed with it to please his family. In October 1855, however, he emigrated to Canada with his wife Agnes Elder Robertson and they settled in Montreal.</p><p>Henderson learned photography in Montreal around the year 1857 and quickly took it up as a serious amateur. He became a personal friend and colleague of the Scottish – Canadian photographer William Notman. The two men made a photographic excursion to Niagara Falls in 1860 and they cooperated on experiments with magnesium flares as a source of artificial light in 1865. They belonged to the same societies and were among the founding members of the Art Association of Montreal.</p><p>Henderson acted as chairman of the association’s first meeting, which was held in Notman’s studio on 11 January 1860.</p><p>In spite of their friendship, their styles of photography were quite different. While Notman’s landscapes were noted for their bold realism, Henderson for the first 20 years of his career produced romantic images, showing the strong influence of the British landscape tradition. His artistic and technical progress was rapid and in 1865 he published his first major collection of landscape photographs.</p><p>The publication had limited circulation (only seven copies have ever been found), and was called Canadian Views and Studies. The contents of each copy vary significantly and have proved a useful source for evaluating Henderson’s early work.</p><p>In 1866, he gave up his business to open a photographic studio, advertising himself as a portrait and landscape photographer. From about 1870 he dropped portraiture to specialize in landscape photography and other views.</p><p>His numerous photographs of city life revealed in street scenes, houses, and markets are alive with human activity, and although his favourite subject was landscape he usually composed his scenes around such human pursuits as farming the land, cutting ice on a river, or sailing down a woodland stream. There was sufficient demand for these types of scenes and others he took depicting the lumber trade, steamboats and waterfalls to enable him to make a living.</p><p>There was little competing hobby or amateur photography before the late 1880s because of the time-consuming techniques involved and the weight of equipment. People wanted to buy photographs as souvenirs of a trip or as gifts, and catering to this market, Henderson had stock photographs on display at his studio for mounting, framing, or inclusion in albums.</p><p>Henderson frequently exhibited his photographs in Montreal and abroad, in London, Edinburgh, Dublin, Paris, New York, and Philadelphia. He met with greater success in 1877 and 1878 in New York when he won first prizes in the exhibition held by E and H T Anthony and Company for landscapes using the Lambertype process. In 1878 his work won second prize at the world exhibition in Paris.</p><p>In the 1890s and 1880s Henderson travelled widely throughout Quebec and Ontario, in Canada, documenting the major cities of the two provinces and many of the villages in Quebec. He was especially fond of the wilderness and often travelled by canoe on the Blanche, du Lièvre, and other noted eastern rivers. He went on several occasions to the Maritimes and in 1872 he sailed by yacht along the lower north shore of the St Lawrence River.</p><p>That same year, while in the lower St Lawrence River region, he took some photographs of the construction of the Intercolonial Railway. This undertaking led in 1875 to a commission from the railway to record the principal structures along the almost-completed line connecting Montreal to Halifax. Commissions from other railways followed. In 1876 he photographed bridges on the Quebec, Montreal, Ottawa and Occidental Railway between Montreal and Ottawa.</p><p>In 1885 he went west along the Canadian Pacific Railway (CPR) as far as Rogers Pass in British Columbia, where he took photographs of the mountains and the progress of construction.</p><p>In 1892 Henderson accepted a full-time position with the CPR as manager of a photographic department which he was to set up and administer. His duties included spending four months in the field each year. That summer he made his second trip west, photographing extensively along the railway line as far as Victoria. He continued in this post until 1897, when he retired completely from photography.</p><p>When Henderson died in 1913, his huge collection of glass negatives was stored in the basement of his house. Today collections of his work are held at the National Archives of Canada, Ottawa, and the McCord Museum of Canadian History, Montreal.</p>"
      },
      {
        "section": 2,
        "title": "Back to the future of skyscraper design",
        "contentHtml": "<h2>Back to the future of skyscraper design</h2><p>Answers to the problem of excessive electricity use by skyscrapers and large public buildings can be found in ingenious but forgotten architectural designs of the 19th and early-20th centuries</p><p><strong>A</strong> The Recovery of Natural Environments in Architecture by Professor Alan Short is the culmination of 30 years of research and award-winning green building design by Short and colleagues in Architecture, Engineering, Applied Maths and Earth Sciences at the University of Cambridge.</p><p>‘The crisis in building design is already here,’ said Short. ‘Policy makers think you can solve energy and building problems with gadgets. You can’t. As global temperatures continue to rise, we are going to continue to squander more and more energy on keeping our buildings mechanically cool until we have run out of capacity.’</p><p><strong>B</strong> Short is calling for a sweeping reinvention of how skyscrapers and major public buildings are designed – to end the reliance on sealed buildings which exist solely via the ‘life support’ system of vast air conditioning units.</p><p>Instead, he shows it is entirely possible to accommodate natural ventilation and cooling in large buildings by looking into the past, before the widespread introduction of air conditioning systems, which were ‘relentlessly and aggressively marketed’ by their inventors.</p><p><strong>C</strong> Short points out that to make most contemporary buildings habitable, they have to be sealed and air conditioned. The energy use and carbon emissions this generates is spectacular and largely unnecessary. Buildings in the West account for 40-50% of electricity usage, generating substantial carbon emissions, and the rest of the world is catching up at a frightening rate. Short regards glass, steel and air-conditioned skyscrapers as symbols of status, rather than practical ways of meeting our requirements.</p><p><strong>D</strong> Short’s book highlights a developing and sophisticated art and science of ventilating buildings through the 19th and earlier-20th centuries, including the design of ingeniously ventilated hospitals. Of particular interest were those built to the designs of John Shaw Billings, including the first Johns Hopkins Hospital in the US city of Baltimore (1873-1889).</p><p>‘We spent three years digitally modelling Billings’ final designs,’ says Short. ‘We put pathogens* in the airstreams, modelled for someone with tuberculosis (TB) coughing in the wards and we found the ventilation systems in the room would have kept other patients safe from harm.</p><p>* pathogens: microorganisms that can cause disease</p><p><strong>E</strong> ‘We discovered that 19th-century hospital wards could generate up to 24 air changes an hour – that’s similar to the performance of a modern-day, computer-controlled operating theatre. We believe you could build wards based on these principles now.</p><p>Single rooms are not appropriate for all patients. Communal wards appropriate for certain patients – older people with dementia, for example – would work just as well in today’s hospitals, at a fraction of the energy cost.’</p><p>Professor Short contends the mindset and skill-sets behind these designs have been completely lost, lamenting the disappearance of expertly designed theatres, opera houses, and other buildings where up to half the volume of the building was given over to ensuring everyone got fresh air.</p><p><strong>F</strong> Much of the ingenuity present in 19th-century hospital and building design was driven by a panicked public clamouring for buildings that could protect against what was thought to be the lethal threat of miasmas – toxic air that spread disease. Miasmas were feared as the principal agents of disease and epidemics for centuries, and were used to explain the spread of infection from the Middle Ages right through to the cholera outbreaks in London and Paris during the 1850s.</p><p>Foul air, rather than germs, was believed to be the main driver of ‘hospital fever’, leading to disease and frequent death. The prosperous steered clear of hospitals.</p><p>While miasma theory has been long since disproved, Short has for the last 30 years advocated a return to some of the building design principles produced in its wake.</p><p><strong>G</strong> Today, huge amounts of a building’s space and construction cost are given over to air conditioning. ‘But I have designed and built a series of buildings over the past three decades which have tried to reinvent some of these ideas and then measure what happens.</p><p>‘To go forward into our new low-energy, low-carbon future, we would be well advised to look back at design before our high-energy, high-carbon present appeared. What is surprising is what a rich legacy we have abandoned.’</p><p><strong>H</strong> Successful examples of Short’s approach include the Queen’s Building at De Montfort University in Leicester. Containing as many as 2,000 staff and students, the entire building is naturally ventilated, passively cooled and naturally lit, including the two largest auditoria, each seating more than 150 people. The award-winning building uses a fraction of the electricity of comparable buildings in the UK.</p><p>Short contends that glass skyscrapers in London and around the world will become a liability over the next 20 or 30 years if climate modelling predictions and energy price rises come to pass as expected.</p><p><strong>I</strong> He is convinced that sufficiently cooled skyscrapers using the natural environment can be produced in almost any climate. He and his team have worked on hybrid buildings in the harsh climates of Beijing and Chicago – built with natural ventilation assisted by back-up air conditioning – which, surprisingly perhaps, can be switched off more than half the time on milder days and during the spring and autumn.</p><p>Short looks at how we might reimagine the cities, offices and homes of the future. Maybe it’s time we changed our outlook.</p>"
      },
      {
        "section": 3,
        "title": "Why companies should welcome disorder",
        "contentHtml": "<h2>Why companies should welcome disorder</h2><p><strong>A</strong> Organisation is big business. Whether it is of our lives – all those inboxes and calendars – or how companies are structured, a multi-billion dollar industry helps to meet this need.</p><p>We have more strategies for time management, project management and self-organisation than at any other time in human history. We are told that we ought to organize our company, our home life, our week, our day and even our sleep, all as a means to becoming more productive. Every week, countless seminars and workshops take place around the world to tell a paying public that they ought to structure their lives in order to achieve this.</p><p>This rhetoric has also crept into the thinking of business leaders and entrepreneurs, much to the delight of self-proclaimed perfectionists with the need to get everything right. The number of business schools and graduates has massively increased over the past 50 years, essentially teaching people how to organise well.</p><p><strong>B</strong> Ironically, however, the number of business that fail has also steadily increased. Work-related stress has increased. A large proportion of workers from all demographics claim to be dissatisfied with the way their work is structured and the way they are managed.</p><p>This begs the question: what has gone wrong? Why is it that on paper the drive for organisation seems a sure shot for increasing productivity, but in reality falls well short of what is expected?</p><p><strong>C</strong> This has been a problem for a while now. Frederick Taylor was one of the forefathers of scientific management. Writing in the first half of the 20th century, he designed a number of principles to improve the efficiency of the work process, which have since become widespread in modern companies. So the approach has been around for a while.</p><p><strong>D</strong> New research suggests that this obsession with efficiency is misguided. The problem is not necessarily the management theories or strategies we use to organise our work; it’s the basic assumptions we hold in approaching how we work. Here it’s the assumption that order is a necessary condition for productivity. This assumption has also fostered the idea that disorder must be detrimental to organizational productivity.</p><p>The result is that businesses and people spend time and money organising themselves for the sake of organising, rather than actually looking at the end goal and usefulness of such an effort.</p><p><strong>E</strong> What’s more, recent studies show that order actually has diminishing returns. Order does increase productivity to a certain extent, but eventually the usefulness of the process of organisation, and the benefit it yields, reduce until the point where any further increase in order reduces productivity. Some argue that in a business, if the cost of formally structuring something outweighs the benefit of doing it, then that thing ought not to be formally structured.</p><p>Instead, the resources involved can be better used elsewhere.</p><p><strong>F</strong> In fact, research shows that, when innovating, the best approach is to create an environment devoid of structure and hierarchy and enable everyone involved to engage as one organic group. These environments can lead to new solutions that, under conventionally structured environments (filled with bottlenecks in term of information flow, power structures, rules, and routines) would never be reached.</p><p><strong>G</strong> In recent times companies have slowly started to embrace this disorganisation. Many of them embrace it in terms of perception (embracing the idea of disorder, as opposed to fearing it) and in terms of process (putting mechanisms in place to reduce structure).</p><p>For example, Oticon, a large Danish manufacturer of hearing aids, used what it called a ‘spaghetti’ structure in order to reduce the organisation’s rigid hierarchies. This involved scrapping formal job titles and giving staff huge amounts of ownership over their own time and projects. This approach proved to be highly successful initially, with clear improvements in worker productivity in all facets of the business.</p><p>In similar fashion, the former chairman of General Electric embraced disorganisation, putting forward the idea of the ‘boundaryless’ organisation. Again, it involves breaking down the barriers between different parts of a company and encouraging virtual collaboration and flexible working. Google and a number of other tech companies have embraced (at least in part) these kinds of flexible structures, facilitated by technology and strong company values which glue people together.</p><p><strong>H</strong> A word of warning to others thinking of jumping on this bandwagon: the evidence so far suggests disorder, much like order, also seems to have diminishing utility, and can also have detrimental effects on performance if overused. Like order, disorder should be embraced only so far as it is useful. But we should not fear it – nor venerate one over the other. This research also shows that we should continually question whether or not our existing assumptions work.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 8,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–8</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "Henderson rarely visited the area around Press estate when he was younger.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Henderson pursued a business career because it was what his family wanted.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Henderson and Notman were surprised by the results of their 1865 experiment.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "There were many similarities between Henderson’s early landscapes and those of Notman.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "The studio that Henderson opened in 1866 was close to his home.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Henderson gave up portraiture so that he could focus on taking photographs of scenery.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "When Henderson began work for the Intercolonial Railway, the Montreal to Halifax line had been finished.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Henderson’s last work as a photographer was with the Canadian Pacific Railway.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 13,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 9–13</h3><p>Complete the notes below</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Alexander Henderson</p><p>Early life</p><p>• was born in Scotland in 1831 – father was a 9_______ </p><p>• trained as an accountant, emigrated to Canada in 1855</p><p>Start of a photographic career</p><p>• opened up a photographic studio in 1866</p><p>• took photos of city life, but preferred landscape photography</p><p>• people bought Henderson’s photos because photography took up considerable time and the 10_______  was heavy</p><p>• the photographs Henderson sold were 11_______  or souvenirs</p><p>Travelling as a professional photographer</p><p>• travelled widely in Quebec and Ontario in 1870s and 1880s</p><p>• took many trips along eastern rivers in a 12_______ </p><p>• worked for Canadian railways between 1875 and 1897</p><p>• worked for CPR in 1885 and photographed the 13_______  and the railway at Rogers Pass</p>",
        "questions": [
          {
            "number": 9,
            "prompt": "* was born in Scotland in 1831 – father was a 9_______ ",
            "options": [],
            "answerKey": "merchant",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "* people bought Henderson’s photos because photography took up considerable time and the 10_______  was heavy",
            "options": [],
            "answerKey": "equipment",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "* the photographs Henderson sold were 11_______  or souvenirs",
            "options": [],
            "answerKey": "gifts",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "* took many trips along eastern rivers in a 12_______ ",
            "options": [],
            "answerKey": "canoe",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "* worked for CPR in 1885 and photographed the 13_______  and the railway at Rogers Pass",
            "options": [],
            "answerKey": "mountains",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 18,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–18</h3><p>The Reading Passage has nine section, A-I</p><p>Which section contains the following information?</p><p>Write the correct letter, A-I, in boxes on your answer sheet.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "why some people avoided hospitals in the 19th century",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "a suggestion that the popularity of tall buildings is linked to prestige",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "a comparison between the circulation of air in a 19th-century building and modern standards",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "how Short tested the circulation of air in a 19th-century building",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "an implication that advertising led to the large increase in the use of air conditioning",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 26,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 19–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Ventilation in 19th-century hospital wards</p><p>Professor Alan Short examined the work of John Shaw Billings, who influenced the architectural 19_______  of hospitals to ensure they had good ventilation. He calculated that 20_______  in the air coming from patients suffering form 21_______  would not have harmed other patients. He also found that the air in 22_______ . In hospitals could change as often as in a modern operating theatre. He suggests that energy use could be reduced by locating more patients in 23_______  areas.</p><p>A major reason for improving ventilation in 19th-century hospitals was the demand from the 24_______  for protection against bad air, known as 25_______ . These were blamed for the spread of disease for hundreds of years, including epidemics of 26_______  in London and Paris in the middle of the 19th century.</p>",
        "questions": [
          {
            "number": 19,
            "prompt": "Professor Alan Short examined the work of John Shaw Billings, who influenced the architectural 19_______  of hospitals to ensure they had good ventilation. He calculated that 20_______  in the air coming from patients suffering form 21_______  would not have harmed other patients. He also found that the air in 22_______ . In hospitals could change as often as in a modern operating theatre. He suggests that energy use could be reduced by locating more patients in 23_______  areas.",
            "options": [],
            "answerKey": "design",
            "acceptedAnswers": [
              "design(s)"
            ]
          },
          {
            "number": 20,
            "prompt": "Professor Alan Short examined the work of John Shaw Billings, who influenced the architectural 19_______  of hospitals to ensure they had good ventilation. He calculated that 20_______  in the air coming from patients suffering form 21_______  would not have harmed other patients. He also found that the air in 22_______ . In hospitals could change as often as in a modern operating theatre. He suggests that energy use could be reduced by locating more patients in 23_______  areas.",
            "options": [],
            "answerKey": "pathogens",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "Professor Alan Short examined the work of John Shaw Billings, who influenced the architectural 19_______  of hospitals to ensure they had good ventilation. He calculated that 20_______  in the air coming from patients suffering form 21_______  would not have harmed other patients. He also found that the air in 22_______ . In hospitals could change as often as in a modern operating theatre. He suggests that energy use could be reduced by locating more patients in 23_______  areas.",
            "options": [],
            "answerKey": "tuberculosis",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Professor Alan Short examined the work of John Shaw Billings, who influenced the architectural 19_______  of hospitals to ensure they had good ventilation. He calculated that 20_______  in the air coming from patients suffering form 21_______  would not have harmed other patients. He also found that the air in 22_______ . In hospitals could change as often as in a modern operating theatre. He suggests that energy use could be reduced by locating more patients in 23_______  areas.",
            "options": [],
            "answerKey": "wards",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "Professor Alan Short examined the work of John Shaw Billings, who influenced the architectural 19_______  of hospitals to ensure they had good ventilation. He calculated that 20_______  in the air coming from patients suffering form 21_______  would not have harmed other patients. He also found that the air in 22_______ . In hospitals could change as often as in a modern operating theatre. He suggests that energy use could be reduced by locating more patients in 23_______  areas.",
            "options": [],
            "answerKey": "communal",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "A major reason for improving ventilation in 19th-century hospitals was the demand from the 24_______  for protection against bad air, known as 25_______ . These were blamed for the spread of disease for hundreds of years, including epidemics of 26_______  in London and Paris in the middle of the 19th century.",
            "options": [],
            "answerKey": "public",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "A major reason for improving ventilation in 19th-century hospitals was the demand from the 24_______  for protection against bad air, known as 25_______ . These were blamed for the spread of disease for hundreds of years, including epidemics of 26_______  in London and Paris in the middle of the 19th century.",
            "options": [],
            "answerKey": "miasmas",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "A major reason for improving ventilation in 19th-century hospitals was the demand from the 24_______  for protection against bad air, known as 25_______ . These were blamed for the spread of disease for hundreds of years, including epidemics of 26_______  in London and Paris in the middle of the 19th century.",
            "options": [],
            "answerKey": "cholera",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 34,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 27–34</h3><p>The Reading Passage has eight sections, A-H</p><p>Choose the correct heading for each section from the list of headings below.</p><p>Write the correct number, i-ix, in boxes on your answer sheet.</p>",
        "config": {
          "headings": [
            "Complaints about the impact of a certain approach",
            "Fundamental beliefs that are in fact incorrect",
            "Early recommendations concerning business activities",
            "Organisations that put a new approach into practice",
            "Companies that have suffered from changing their approach",
            "What people are increasingly expected to do",
            "How to achieve outcomes that are currently impossible",
            "Neither approach guarantees continuous improvement",
            "Evidence that a certain approach can have more disadvantages that advantages"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "iii",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "ii",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "ix",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "vii",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Paragraph G",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Paragraph H",
            "options": [],
            "answerKey": "viii",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 35,
        "to": 37,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 35–37</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• Numerous training sessions are aimed at people who feel they are not 35_______  enough.</p><p>• Being organised appeals to people who regard themselves as 36_______ </p><p>• Many people feel 37_______  with aspects of their work.</p>",
        "questions": [
          {
            "number": 35,
            "prompt": "* Numerous training sessions are aimed at people who feel they are not 35_______  enough.",
            "options": [],
            "answerKey": "productive",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "* Being organised appeals to people who regard themselves as 36_______ ",
            "options": [],
            "answerKey": "perfectionists",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "* Many people feel 37_______  with aspects of their work.",
            "options": [],
            "answerKey": "dissatisfied",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 38,
        "to": 40,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 38–40</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 38,
            "prompt": "Both businesses and people aim at order without really considering its value.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Innovation is most successful if the people involved have distinct roles.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Google was inspired to adopt flexibility by the success of General Electric.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-14-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-14-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "The concept of intelligence",
        "contentHtml": "<h2>The concept of intelligence</h2><p><strong>A</strong> Looked at in one way, everyone knows what intelligence is; looked at in another way, no one does. In other words, people all have unconscious notions – known as ‘implicit theories’ – of intelligence, but no one knows for certain what it actually is. This chapter addresses how people conceptualize intelligence, whatever it may actually be.</p><p>But why should we even care what people think intelligence is, as opposed only to valuing whatever it actually is? There are at least four reasons people’s conceptions of intelligence matter.</p><p><strong>B</strong> First, implicit theories of intelligence drive the way in which people perceive and evaluate their own intelligence and that of others. To better understand the judgments people make about their own and others’ abilities, it is useful to learn about people’s implicit theories. For example, parents’ implicit theories of their children’s language development will determine at what ages they will be willing to make various corrections in their children’s speech.</p><p>More generally, parents’ implicit theories of intelligence will determine at what ages they believe their children are ready to perform various cognitive tasks. Job interviewers will make hiring decisions on the basis of their implicit theories of intelligence. People will decide who to be friends with on the basis of such theories.</p><p>In sum, knowledge about implicit theories of intelligence is important because this knowledge is so often used by people to make judgments in the course of their everyday lives.</p><p><strong>C</strong> Second, the implicit theories of scientific investigators ultimately give rise to their explicit theories. Thus it is useful to find out what these implicit theories are. Implicit theories provide a framework that is useful in defining the general scope of a phenomenon – especially a not-well-understood phenomenon. These implicit theories can suggest what aspects of the phenomenon have been more or less attended to in previous investigations.</p><p><strong>D</strong> Third, implicit theories can be useful when an investigator suspects that existing explicit theories are wrong or misleading. If an investigation of implicit theories reveals little correspondence between the extant implicit and explicit theories, the implicit theories may be wrong. But the possibility also needs to be taken into account that the explicit theories are wrong and in need of correction or supplementation.</p><p>For example, some implicit theories of intelligence suggest the need for expansion of some of our explicit theories of the construct.</p><p><strong>E</strong> Finally, understanding implicit theories of intelligence can help elucidate developmental and cross-cultural differences. As mentioned earlier, people have expectations for intellectual performances that differ for children of different ages. How these expectations differ is in part a function of culture. For example, expectations for children who participate in Western-style schooling are almost certain to be different from those for children who do not participate in such schooling.</p><p><strong>F</strong> I have suggested that there are three major implicit theories of how intelligence relates to society as a whole (Sternberg, 1997). These might be called Hamiltonian, Jeffersonian, and Jacksonian. These views are not based strictly, but rather, loosely, on the philosophies of Alexander Hamilton, Thomas Jefferson, and Andrew Jackson, three great statesmen in the history of the United States.</p><p><strong>G</strong> The Hamiltonian view, which is similar to the Platonic view, is that people are born with different levels of intelligence and that those who are less intelligent need the good offices of the more intelligent to keep them in line, whether they are called government officials or, in Plato’s term, philosopher-kings.</p><p>Herrnstein and Murray (1994) seem to have shared this belief when they wrote about the emergence of a cognitive (high-IQ) elite, which eventually would have to take responsibility for the largely irresponsible masses of non-elite (low-IQ) people who cannot take care of themselves. Left to themselves, the unintelligent would create, as they always have created, a kind of chaos.</p><p><strong>H</strong> The Jeffersonian view is that people should have equal opportunities, but they do not necessarily avail themselves equally of these opportunities and are not necessarily equally rewarded for their accomplishments. People are rewarded for what they accomplish, if given equal opportunity. Low achievers are not rewarded to the same extent as high achievers.</p><p>In the Jeffersonian view, the goal of education is not to favor or foster an elite, as in the Hamiltonian tradition, but rather to allow children the opportunities to make full use of the skills they have. My own views are similar to these (Sternberg, 1997).</p><p><strong>I</strong> The Jacksonian view is that all people are equal, not only as human beings but in terms of their competencies – that one person would serve as well as another in government or on a jury or in almost any position of responsibility. In this view of democracy, people are essentially intersubstitutable except for specialized skills, all of which can be learned. In this view, we do not need or want any institutions that might lead to favoring one group over another.</p><p><strong>J</strong> Implicit theories of intelligence and of the relationship of intelligence to society perhaps need to be considered more carefully than they have been because they often serve as underlying presuppositions for explicit theories and even experimental designs that are then taken as scientific contributions. Until scholars are able to discuss their implicit theories and thus their assumptions, they are likely to miss the point of what others are saying when discussing their explicit theories and their data.</p>"
      },
      {
        "section": 2,
        "title": "Saving bugs to find new drugs",
        "contentHtml": "<h2>Saving bugs to find new drugs</h2><p>Zoologist Ross Piper looks at the potential of insects in pharmaceutical research</p><p><strong>A</strong> More drugs than you might think are derived from, or inspired by, compounds found in living things. Looking to nature for the soothing and curing of our ailments is nothing new – we have been doing it for tens of thousands of years.</p><p>You only have to look at other primates – such as the capuchin monkeys who rub themselves with toxin-oozing millipedes to deter mosquitoes, or the chimpanzees who use noxious forest plants to rid themselves of intestinal parasites – to realise that our ancient ancestors too probably had a basic grasp of medicine.</p><p><strong>B</strong> Pharmaceutical science and chemistry built on these ancient foundations and perfected the extraction, characterization, modification and testing of these natural products. Then, for a while, modern pharmaceutical science moved its focus away from nature and into the laboratory, designing chemical compounds from scratch. The main cause of this shift is that although there are plenty of promising chemical compounds in nature, finding them is far from easy.</p><p>Securing sufficient numbers of the organism in question, isolating and characterizing the compounds of interest, and producing large quantities of these compounds are all significant hurdles.</p><p><strong>C</strong> Laboratory-based drug discovery has achieved varying levels of success, something which has now prompted the development of new approaches focusing once again on natural products. With the ability to mine genomes for useful compounds, it is now evident that we have barely scratched the surface of nature’s molecular diversity.</p><p>This realization, together with several looming health crises, such as antibiotic resistance, has put bioprospecting – the search for useful compounds in nature – firmly back on the map.</p><p><strong>D</strong> Insects are the undisputed masters of the terrestrial domain, where they occupy every possible niche. Consequently, they have a bewildering array of interactions with other organisms, something which has driven the evolution of an enormous range of very interesting compounds for defensive and offensive purposes. Their remarkable diversity exceeds that of every other group of animals on the planet combined.</p><p>Yet even though insects are far and away the most diverse animals in existence, their potential as sources of therapeutic compounds is yet to be realised.</p><p><strong>E</strong> From the tiny proportion of insects that have been investigated, several promising compounds have been identified. For example, alloferon, an antimicrobial compound produced by blow fly larvae, is used as an antiviral and antitumor agent in South Korea and Russia. The larvae of a few other insect species are being investigated for the potent antimicrobial compounds they produce. Meanwhile, a compound from the venom of the wasp Polybia paulista has potential in cancer treatment.</p><p><strong>F</strong> Why is it that insects have received relatively little attention in bioprospecting? Firstly, there are so many insects that, without some manner of targeted approach, investigating this huge variety of species is a daunting task. Secondly, insects are generally very small, and the glands inside them that secrete potentially useful compounds are smaller still. This can make it difficult to obtain sufficient quantities of the compound for subsequent testing.</p><p>Thirdly, although we consider insects to be everywhere, the reality of this ubiquity is vast numbers of a few extremely common species. Many insect species are infrequently encountered and very difficult to rear in captivity, which, again, can leave us with insufficient material to work with.</p><p><strong>G</strong> My colleagues and I at Aberystwyth University in the UK have developed an approach in which we use our knowledge of ecology as a guide to target our efforts. The creatures that particularly interest us are the many insects that secrete powerful poison for subduing prey and keeping it fresh for future consumption. There are even more insects that are masters of exploiting filthy habitats, such as faeces and carcasses, where they are regularly challenged by thousands of micro-organisms.</p><p>These insects have many antimicrobial compounds for dealing with pathogenic bacteria and fungi, suggesting that there is certainly potential to find many compounds that can serve as or inspire new antibiotics.</p><p><strong>H</strong> Although natural history knowledge points us in the right direction, it doesn’t solve the problems associated with obtaining useful compounds from insects. Fortunately, it is now possible to snip out the stretches of the insect’s DNA that carry the codes for the interesting compounds and insert them into cell lines that allow larger quantities to be produced.</p><p>And although the road from isolating and characterizing compounds with desirable qualities to developing a commercial product is very long and full of pitfalls, the variety of successful animal-derived pharmaceuticals on the market demonstrates there is a precedent here that is worth exploring.</p><p><strong>I</strong> With every bit of wilderness that disappears, we deprive ourselves of potential medicines. As much as I’d love to help develop a groundbreaking insect-derived medicine, my main motivation for looking at insects in this way is conservation. I sincerely believe that all species, however small and seemingly insignificant, have a right to exist for their own sake.</p><p>If we can shine a light on the darker recesses of nature’s medicine cabinet, exploring the useful chemistry of the most diverse animals on the planet, I believe we can make people think differently about the value of nature.</p>"
      },
      {
        "section": 3,
        "title": "The power of play",
        "contentHtml": "<h2>The power of play</h2><p>Virtually every child, the world over, plays. The drive to play is so intense that children will do so in any circumstances, for instance when they have no real toys, or when parents do not actively encourage the behavior. In the eyes of a young child, running, pretending, and building are fun. Researchers and educators know that these playful activities benefit the development of the whole child across social, cognitive, physical, and emotional domains.</p><p>Indeed, play is such an instrumental component to healthy child development that the United Nation High Commission on Human Rights (1989) recognized play as a fundamental right of every child.</p><p>Yet, while experts continue to expound a powerful argument for the importance of play in children’s lives, the actual time children spend playing continues to decrease. Today, children play eight hours less each week than their counterparts did two decades ago (Elkind 2008).</p><p>Under pressure of rising academic standards, play is being replaced by test preparation in kindergartens and grade schools, and parents who aim to give their preschoolers a leg up are led to believe that flashcards and educational ‘toys’ are the path to success. Our society has created a false dichotomy between play and learning.</p><p>Through play, children learn to regulate their behavior, lay the foundations for later learning in science and mathematics, figure out the complex negotiations of social relationships, build a repertoire of creative problem-solving skills, and so much more. There is also an important role for adults in guiding children through playful learning opportunities.</p><p>Full consensus on a formal definition of play continues to elude the researchers and theorists who study it. Definitions range from discrete descriptions of various types of play such as physical, construction, language, or symbolic play (Miler &amp; Almon 2009), to lists of broad criteria, based on observations and attitudes, that are meant to capture the essence of all play behaviors (e.g. Rubin et al. 1983).</p><p>A majority of the contemporary definitions of play focus on several key criteria. The founder of the National Institute for Play, Stuart Brown, has described play as ‘anything that spontaneously is done for its own sake’. More specifically, he says it ‘appears purposeless, produces pleasure and joy, [and] leads one to the next stage of mastery’ (as quoted in Tippett 2008).</p><p>Similarly, Miller and Almon (2009) say that play includes ‘activities that are freely chosen and directed by children and arise from intrinsic motivation’. Often, play is defined along a continuum as more or less playful using the following set of behavioral and dispositional criteria (e.g. Rubin et al. 1983).</p><p>Play is pleasurable: Children must enjoy the activity or it is not play. It is intrinsically motivated: Children engage in play simply for the satisfaction the behavior itself brings. It has no extrinsically motivated function or goal. Play is process oriented: When children play, the means are more important than the ends. It is freely chosen, spontaneous and voluntary. If a child is pressured, they will likely not think of the activity as play.</p><p>Play is actively engaged: Players must be physically and/or mentally involved in the activity. Play is non-literal. It involves make-believe.</p><p>According to this view, children’s playful behaviors can range in degree from 0% to 100% playful. Rubin and colleagues did not assign greater weight to any one dimension in determining playfulness; however, other researchers have suggested that process orientation and a lack of obvious functional purpose may be the most important aspects of play (e.g. Pellegrini 2009).</p><p>From the perspective of a continuum, play can thus blend with other motives and attitudes that are less playful, such as work. Unlike play, work is typically not viewed as enjoyable and it is extrinsically motivated (i.e. it is goal oriented). Researcher Joan Goodman (1994) suggested that hybrid forms of work and play are not a detriment to learning; rather, they can provide optimal contexts for learning.</p><p>For example, a child may be engaged in a difficult, goal-directed activity set up by their teacher, but they may still be actively engaged and intrinsically motivated. At this mid-point between play and work, the child’s motivation, coupled with guidance from an adult, can create robust opportunities for playful learning.</p><p>Critically, recent research supports the idea that adults can facilitate children’s learning while maintaining a playful approach in interactions known as ‘guided play’ (Fisher et al. 2011). The adult’s role in play varies as a function of their educational goals and the child’s developmental level (Hirsch-Pasek et al. 2009).</p><p>Guided play takes two forms. At a very basic level, adults can enrich the child’s environment by providing objects or experiences that promote aspects of a curriculum. In the more direct form of guided play, parents or other adults can support children’s play by joining in the fun as a co-player, raising thoughtful questions, commenting on children’s discoveries, or encouraging further exploration or new facets to the child’s activity.</p><p>Although playful learning can be somewhat structured, it must also be child-centered (Nicolopolou et al. 2006). Play should stem from the child’s own desire.</p><p>Both free and guided play are essential elements in a child-centered approach to playful learning. Intrinsically motivated free play provides the child with true autonomy, while guided play is an avenue through which parents and educators can provide more targeted learning experiences. In either case, play should be actively engaged, it should be predominantly child-directed, and it must be fun.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 3,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 1–3</h3><p>The Reading Passage has ten sections, A-J</p><p>Which section contains the following information?</p><p>Write the correct letter, A-J, in boxes on your answer sheet.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "information about how non-scientists’ assumptions about intelligence influence their behavior towards others",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "a reference to lack of clarity over the definition of intelligence",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "the point that a researcher’s implicit and explicit theories may be very different",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 4,
        "to": 6,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 4–6</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 4,
            "prompt": "Slow language development in children is likely to prove disappointing to their parents.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "People’s expectations of what children should gain from education are universal.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Scholars may discuss theories without fully understanding each other.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 7,
        "to": 13,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 7–13</h3><p>Look at the following statements and the list of theories below.</p><p>Match each statement with the correct theory, A, B or C.</p><p>Write the correct letter, A, B or C, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Hamiltonian",
            "Jeffersonian",
            "Jacksonian"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 7,
            "prompt": "It is desirable for the same possibilities to be open to everyone.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "No section of society should have preferential treatment at the expense of another.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "People should only gain benefits on the basis of what they actually achieve.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Variation in intelligence begins at birth.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "The more intelligent people should be in positions of power.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Everyone can develop the same abilities.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "People of low intelligence are likely to lead uncontrolled lives.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 20,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–20</h3><p>The Reading Passage has nine paragraphs, A-I</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-I, in boxes on your answer sheet.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "mention of factors driving a renewed interest in natural medicinal compounds.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "how recent technological advances have made insect research easier",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "examples of animals which use medicinal substances from nature",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "reasons why it is challenging to use insects in drug research",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "reference to how interest in drug research may benefit wildlife",
            "options": [],
            "answerKey": "I",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "a reason why nature-based medicines fell out of favour for a period",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "an example of an insect-derived medicine in use at the moment",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 21,
        "to": 22,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 21–22</h3><p>Choose TWO letters, A-E</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 21,
            "prompt": "Which TWO of the following make insects interesting for drug research?",
            "options": [
              "the huge number of individual insects in the world",
              "the variety of substances insects have developed to protect themselves",
              "the potential to extract and make use of insects’ genetic codes",
              "the similarities between different species of insect",
              "the manageable size of most insects"
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "C"
            ]
          },
          {
            "number": 22,
            "prompt": "Which TWO of the following make insects interesting for drug research?",
            "options": [
              "the huge number of individual insects in the world",
              "the variety of substances insects have developed to protect themselves",
              "the potential to extract and make use of insects’ genetic codes",
              "the similarities between different species of insect",
              "the manageable size of most insects"
            ],
            "answerKey": "C",
            "acceptedAnswers": [
              "B"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 26,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 23–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Research at Aberystwyth University</p><p>Ross Piper and fellow zoologists at Aberystwyth University are using their expertise in 23_______  when undertaking bioprospecting with insects. They are especially interested in the compounds that insects produce to overpower and preserve their 24_______ . They are also interested in compounds which insects use to protect themselves from pathogenic bacteria and fungi found in their 25_______ . Piper hopes that these substances will be useful in the development of drugs such as 26_______ </p>",
        "questions": [
          {
            "number": 23,
            "prompt": "Ross Piper and fellow zoologists at Aberystwyth University are using their expertise in 23_______  when undertaking bioprospecting with insects. They are especially interested in the compounds that insects produce to overpower and preserve their 24_______ . They are also interested in compounds which insects use to protect themselves from pathogenic bacteria and fungi found in their 25_______ . Piper hopes that these substances will be useful in the development of drugs such as 26_______ ",
            "options": [],
            "answerKey": "ecology",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "Ross Piper and fellow zoologists at Aberystwyth University are using their expertise in 23_______  when undertaking bioprospecting with insects. They are especially interested in the compounds that insects produce to overpower and preserve their 24_______ . They are also interested in compounds which insects use to protect themselves from pathogenic bacteria and fungi found in their 25_______ . Piper hopes that these substances will be useful in the development of drugs such as 26_______ ",
            "options": [],
            "answerKey": "prey",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "Ross Piper and fellow zoologists at Aberystwyth University are using their expertise in 23_______  when undertaking bioprospecting with insects. They are especially interested in the compounds that insects produce to overpower and preserve their 24_______ . They are also interested in compounds which insects use to protect themselves from pathogenic bacteria and fungi found in their 25_______ . Piper hopes that these substances will be useful in the development of drugs such as 26_______ ",
            "options": [],
            "answerKey": "habitats",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "Ross Piper and fellow zoologists at Aberystwyth University are using their expertise in 23_______  when undertaking bioprospecting with insects. They are especially interested in the compounds that insects produce to overpower and preserve their 24_______ . They are also interested in compounds which insects use to protect themselves from pathogenic bacteria and fungi found in their 25_______ . Piper hopes that these substances will be useful in the development of drugs such as 26_______ ",
            "options": [],
            "answerKey": "antibiotics",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Look at the following statements and the list of researchers below.</p><p>Match each statement with the correct researcher, A-G.</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "featureOptions": [
            "Elkind",
            "Miller & Almon",
            "Rubin et al.",
            "Stuart Brown",
            "Pellegrini",
            "Joan Goodman",
            "Girsch-Pasek et al."
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "Play can be divided into a number of separate categories.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Adults’ intended goals affect how they play with children.",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Combining work with play may be the best way for children to learn.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Certain elements of play are more significant than others.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Activities can be classified on a scale of playfulness.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 36,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 32–36</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the winter</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 32,
            "prompt": "Children need toys in order to play.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "It is a mistake to treat play and learning as separate types of activities.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Play helps children to develop their artistic talents.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Researchers have agreed on a definition of play.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Work and play differ in terms of whether or not they have a target.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 37,
        "to": 40,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Guided play</p><p>In the simplest form of guided play, an adult contributes to the environment in which the child is playing. Alternatively, an adult can play with a child and develop the play, for instance by 37_______  the child to investigate different aspects of their game. Adults can help children to learn through play, and may make the activity rather structured, but it should still be based on the child’s 38_______  to play.</p><p>Play without the intervention of adults gives children real 39_______ ; with adults, play can be 40_______  at particular goals. However, all forms of play should be an opportunity for children to have fun.</p>",
        "questions": [
          {
            "number": 37,
            "prompt": "In the simplest form of guided play, an adult contributes to the environment in which the child is playing. Alternatively, an adult can play with a child and develop the play, for instance by 37_______  the child to investigate different aspects of their game. Adults can help children to learn through play, and may make the activity rather structured, but it should still be based on the child’s 38_______  to play.",
            "options": [],
            "answerKey": "encouraging",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "In the simplest form of guided play, an adult contributes to the environment in which the child is playing. Alternatively, an adult can play with a child and develop the play, for instance by 37_______  the child to investigate different aspects of their game. Adults can help children to learn through play, and may make the activity rather structured, but it should still be based on the child’s 38_______  to play.",
            "options": [],
            "answerKey": "desire",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Play without the intervention of adults gives children real 39_______ ; with adults, play can be 40_______  at particular goals. However, all forms of play should be an opportunity for children to have fun.",
            "options": [],
            "answerKey": "autonomy",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Play without the intervention of adults gives children real 39_______ ; with adults, play can be 40_______  at particular goals. However, all forms of play should be an opportunity for children to have fun.",
            "options": [],
            "answerKey": "targeted",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-14-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-14-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "The secret of staying young",
        "contentHtml": "<h2>The secret of staying young</h2><p>Pheidole dentata, a native ant of the south-eastern U.S., isn’t immortal. But scientists have found that it doesn’t seem to show any signs of aging. Old worker ants can do everything just as well as the youngsters, and their brains appear just as sharp. ‘We get a picture that these ants really don’t decline,’ says Ysabel Giraldo, who studies the ants for her doctoral thesis at Boston University.</p><p>Such age-defying feats are rare in the animal kingdom. Naked mole rats can live for almost 30 years and stay fit for nearly their entire lives. They can still reproduce even when old, and they never get cancer. But the vast majority of animals deteriorate with age just like people do. Like the naked mole rat, ants are social creatures that usually live in highly organised colonies. ‘It’s this social complexity that makes P.</p><p>dentata useful for studying aging in people,’ says Giraldo, now at the California Institute of Technology. Humans are also highly social, a trait that has been connected to healthier aging. By contrast, most animal studies of aging use mice, worms or fruit flies, which all lead much more isolated lives.</p><p>In the lab, P. dentata worker ants typically live for around 140 days. Giraldo focused on ants at four age ranges: 20 to 22 days, 45 to 47 days, 95 to 97 days and 120 to 122 days. Unlike all previous studies, which only estimated how old the ants were, her work tracked the ants from the time the pupae became adults, so she knew their exact ages. Then she put them through a range of tests.</p><p>Giraldo watched how well the ants took care of the young of the colony, recording how often each ant attended to, carried and fed them. She compared how well 20-day-old and 95-day-old ants followed the telltale scent that the insects usually leave to mark a trail to food. She tested how ants responded to light and also measured how active they were by counting how often ants in a small dish walked across a line. And she experimented with how ants react to live prey: a tethered fruit fly.</p><p>Giraldo expected the older ants to perform poorly in all these tasks. But the elderly insects were all good caretakers and trail-followers – the 95-day-old ants could track the scent even longer than their younger counterparts. They all responded do light well, and the older ants were more active. And when it came to reacting to prey, the older ants attacked the poor fruit fly just as aggressively as the young ones did, flaring their mandibles or pulling at the fly’s legs.</p><p>Then Giraldo compared the brains of 20-day-old and 95-day-ole ants, identifying any cells that were close to death. She saw no major differences with age, nor was there any difference in the location of the dying cells, showing that age didn’t seem to affect specific brain functions. Ants and other insects have structures in their brains called mushroom bodies, which are important for processing information, learning and memory.</p><p>She also wanted to see if aging affects the density of synaptic complexes within these structures – regions where neurons come together. Again, the answer was no. what was more, the old ants didn’t experience any drop in the levels of either serotonin or dopamine – brain chemicals whose decline often coincides with aging. In humans, for example, a decrease in serotonin has been linked to Alzheimer’s disease.</p><p>‘This is the first time anyone has looked at both behavioral and neural changes in these ants so thoroughly,’ says Giraldo, who recently published the findings in the Proceeding of the Royal Society B. Scientists have looked at some similar aspects in bees, but the results of recent bee studies were mixed – some studies showed age-related declines, which biologists call senescence, and others didn’t. ‘For now, the study raises more questions than it answers,’ Giraldo says, ‘including how P.</p><p>dentata stays in such good shape.’</p><p>Also, if the ants don’t deteriorate with age, why do they die at all? Out in the wild, the ants probably don’t live for a full 140 days thanks to predators, disease and just being in an environment that’s much harsher than the comforts of the lab. ‘The lucky ants that do live into old age may suffer a steep decline just before dying,’ Giraldo says, but she can’t say for sure because her study wasn’t designed to follow an ant’s final moments.</p><p>‘It will be important to extend these findings to other species of social insects,’ says Gene E. Robinson, an entomologist at the University of Illinois at Urbana-Champaign. This ant might be unique, or it might represent a broader pattern among other social bugs with possible clues to the science of aging in larger animals. Either way, it seems that for these ants, age really doesn’t matter.</p>"
      },
      {
        "section": 2,
        "title": "Why zoos are good",
        "contentHtml": "<h2>Why zoos are good</h2><p>Scientist David Hone makes the case for zoos</p><p><strong>A</strong> In my view, it is perfectly possible for many species of animals living in zoos or wildlife parks to have a quality of life as high as, or higher than, in the wild. Animals in good zoos get a varied and high-quality diet with all the supplements required, and any illnesses they might have will be treated. Their movement might be somewhat restricted, but they have a safe environment in which to live, and they are spared bullying and social ostracism by others of their kind.</p><p>They do not suffer from the threat or stress of predators, or the irritation and pain of parasites or injuries. The average captive animal will have a greater life expectancy compared with its wild counterpart, and will not die of drought, of starvation or in the jaws of a predator. A lot of very nasty things happen to truly ‘wild’ animals that simply don’t happen in good zoos, and to view a life that is ‘free’ as one that is automatically ‘good’ is, I think, an error.</p><p>Furthermore, zoos serve several key purposes.</p><p><strong>B</strong> Firstly, zoos aid conservation. Colossal numbers of species are becoming extinct across the world, and many more are increasingly threatened and therefore risk extinction. Moreover, some of these collapses have been sudden, dramatic and unexpected, or were simply discovered very late in the day. A species protected in captivity can be bred up to provide a reservoir population against a population crash or extinction in the wild.</p><p>A good number of species only exist in captivity, with many of these living in zoos. Still more only exist in the wild because they have been reintroduced from zoos, or have wild populations that have been boosted by captive bred animals. Without these efforts there would be fewer species alive today.</p><p>Although reintroduction successes are few and far between, the numbers are increasing, and the very fact that species have been saved or reintroduced as a result of captive breeding proves the value of such initiatives.</p><p><strong>C</strong> Zoos also provide education. Many children and adults, especially those in cities, will never see a wild animal beyond a fox or pigeon. While it is true that television documentaries are becoming ever more detailed and impressive, and many natural history specimens are on display in museums, there really is nothing to compare with seeing a living creature in the flesh, hearing it, smelling it, watching what it does and having the time to absorb details.</p><p>That alone will bring a greater understanding and perspective to many, and hopefully give them a greater appreciation for wildlife, conservation efforts and how they can contribute.</p><p><strong>D</strong> In addition to this, there is also the education that can take place in zoos through signs, talks and presentations which directly communicate information to visitors about the animals they are seeing and their place in the world. This was an area where zoos used to be lacking, but they are now increasingly sophisticated in their communication and outreach work.</p><p>Many zoos also work directly to educate conservation workers in other countries, or send their animal keepers abroad to contribute their knowledge and skills to those working in zoos and reserves, thereby helping to improve conditions and reintroductions all over the world.</p><p><strong>E</strong> Zoos also play a key role in research. If we are to save wild species and restore and repair ecosystems we need to know about how key species live, act and react. Being able to undertake research on animals in zoos where there is less risk and fewer variables means real changes can be effected on wild populations. Finding out about, for example, the oestrus cycle of an animal of its breeding rate helps us manage wild populations.</p><p>Procedures such as capturing and moving at-risk or dangerous individuals are bolstered by knowledge gained in zoos about doses for anaesthetics, and by experience in handling and transporting animals. This can make a real difference to conservation efforts and to the reduction of human-animal conflicts, and can provide a knowledge base for helping with the increasing threats of habitat destruction and other problems.</p><p><strong>F</strong> In conclusion, considering the many ongoing global threats to the environment, it is hard for me to see zoos as anything other than essential to the long-term survival of numerous species. They are vital not just in terms of protecting animals, but as a means of learning about them to aid those still in the wild, as well as educating and informing the general population about these animals and their world so that they can assist or at least accept the need to be more environmentally conscious.</p><p>Without them, the world would be, and would increasingly become, a much poorer place.</p>"
      },
      {
        "section": 3,
        "title": "How Bad Is Ocean Garbage, Really?",
        "contentHtml": "<h2>How Bad Is Ocean Garbage, Really?</h2><p>Chelsea Rochman, an ecologist at the University of California, Davis, has been trying to answer a dismal question: Is everything terrible, or are things just very, very bad?</p><p>Rochman is a member of the National Center for Ecological Analysis and Synthesis’s marine-debris working group, a collection of scientists who study, among other things, the growing problem of marine debris, also known as ocean trash. Plenty of studies have sounded alarm bells about the state of marine debris; in a recent paper published in the journal Ecology, Rochman and her colleagues set out to determine how many of those perceived risks are real.</p><p>Often, Rochman says, scientists will end a paper by speculating about the broader impacts of what they’ve found. For example, a study could show that certain seabirds eat plastic bags, and go on to warn that whole bird populations are at risk of dying out. ‘But the truth was that nobody had yet tested those perceived threats,’ Rochman says. ‘There wasn’t a lot of information.’</p><p>Rochman and her colleagues examined more than a hundred papers on the impacts of marine debris that were published through 2013. Within each paper, they asked what threats scientists had studied – 366 perceived threats in all – and what they’d actually found.</p><p>In 83 percent of cases, the perceived dangers of ocean trash were proven true. In the remaining cases, the working group found the studies had weaknesses in design and content which affected the validity of their conclusions – they lacked a control group, for example, or used faulty statistics.</p><p>Strikingly, Rochman says, only one well-designed study failed to find the effect it was looking for, an investigation of mussels ingesting microscopic bits. The plastic moved from the mussels’ stomachs to their bloodstreams, scientists found, and stayed there for weeks – but didn’t seem to stress out the shellfish.</p><p>While mussels may be fine eating trash, though, the analysis also gave a clearer picture of the many ways that ocean debris is bothersome.</p><p>Within the studies they looked at, most of the proven threats came from plastic debris, rather than other materials like metal or wood. Most of the dangers also involved large pieces of debris – animals getting entangled in trash, for example, or eating it and severely injuring themselves.</p><p>But a lot of ocean debris is ‘microplastic’, or pieces smaller than five millimeters. These may be ingredients used in cosmetics and toiletries, fibers shed by synthetic clothing in the wash, or eroded remnants of larger debris. Compared to the number of studies investigating large-scale debris, Rochman’s group found little research on the effects of these tiny bits.</p><p>‘There are a lot of open questions still for microplastic,’ Rochman says, though she notes that more papers on the subject have been published since 2013, the cutoff point for the group’s analysis.</p><p>There are also, she adds, a lot of open questions about the ways that ocean debris can lead to sea-creature death. Many studies have looked at how plastic affects an individual animal, or that animal’s tissues or cells, rather than whole populations. And in the lab, scientists often use higher concentrations of plastic than what’s really in the ocean.</p><p>None of that tells us how many birds or fish or sea turtles could die from plastic pollution – or how deaths in one species could affect that animal’s predators, or the rest of the ecosystem.</p><p>‘We need to be asking more ecologically relevant questions,’ Rochman says. Usually, scientists don’t know exactly how disasters such as a tanker accidentally spilling its whole cargo of oil and polluting huge areas of the ocean will affect the environment until after they’ve happened. ‘We don’t ask the right questions early enough,’ she says. But if ecologists can understand how the slow-moving effect of ocean trash is damaging ecosystems, they might be able to prevent things from getting worse.</p><p>Asking the right questions can help policy makers, and the public, figure out where to focus their attention. The problems that look or sound most dramatic may not be the best places to start. For example, the name of the ‘Great Pacific Garbage Patch’ – a collection of marine debris in the northern Pacific Ocean – might conjure up a vast, floating trash island. In reality though, much of the debris is tiny or below the surface; a person could sail through the area without seeing any trash at all.</p><p>A Dutch group called ‘The Ocean Cleanup’ is currently working on plans to put mechanical devices in the Pacific Garbage Patch and similar areas to suck up plastic. But a recent paper used simulations to show that strategically positioning the cleanup devices closer to shore would more effectively reduce pollution over the long term.</p><p>‘I think clearing up some of these misperceptions is really important,’ Rochman says. Among scientists as well as in the media, she says, ‘A lot of the images about strandings and entanglement and all of that cause the perception that plastic debris is killing everything in the ocean.’ Interrogating the existing scientific literature can help ecologists figure out which problems really need addressing, and which ones they’d be better off – like the mussels – absorbing and ignoring.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 8,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–8</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answer in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Ysabel Giraldo’s research</p><p>Focused on a total of 1_______  different age groups of ants, analyzing</p><p>Behaviour:</p><p>• how well ants looked after their 2_______ </p><p>• their ability to locate 3_______  using a scent trail</p><p>• the effect that 4_______  had on them</p><p>• how 5_______ . They attacked prey</p><p>Brains:</p><p>• comparison between age and the 6_______  of dying cells in the brains of ants</p><p>• condition of synaptic complexes (areas in which 7_______  meet) in the brain’s ‘mushroom bodies’</p><p>• level of two 8_______  in the brain associated with ageing</p>",
        "questions": [
          {
            "number": 1,
            "prompt": "Focused on a total of 1_______  different age groups of ants, analyzing",
            "options": [],
            "answerKey": "four/ 4",
            "acceptedAnswers": [
              "four/4"
            ]
          },
          {
            "number": 2,
            "prompt": "* how well ants looked after their 2_______ ",
            "options": [],
            "answerKey": "young",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "* their ability to locate 3_______  using a scent trail",
            "options": [],
            "answerKey": "food",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* the effect that 4_______  had on them",
            "options": [],
            "answerKey": "light",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* how 5_______ . They attacked prey",
            "options": [],
            "answerKey": "aggressively",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "* comparison between age and the 6_______  of dying cells in the brains of ants",
            "options": [],
            "answerKey": "location",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "* condition of synaptic complexes (areas in which 7_______  meet) in the brain’s ‘mushroom bodies’",
            "options": [],
            "answerKey": "neurons",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "* level of two 8_______  in the brain associated with ageing",
            "options": [],
            "answerKey": "chemicals",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 9–13</h3><p>Do the following statements agree with the information give in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 9,
            "prompt": "Pheidole dentata ants are the only known animals which remain active for almost their whole lives.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Ysabel Giraldo was the first person to study Pheidole dentata ants using precise data about the insects’ ages.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "The ants in Giraldo’s experiments behaved as she had predicted that they would.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "The recent studies of bees used different methods of measuring age-related decline.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Pheidole dentata ants kept in laboratory conditions tend to live longer lives.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 17,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–17</h3><p>The Reading Passage has six paragraphs, A-F.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "a reference to how quickly animal species can die out",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "reasons why it is preferable to study animals in captivity rather than in the wild",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "mention of two ways of learning about animals other than visiting them in zoos",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "reasons why animals in zoos may by healthier than those in the wild",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 18,
        "to": 22,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 18–22</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on you answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 18,
            "prompt": "An animal is likely to live longer in a zoo than in the wild",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "There are some species in zoos which can no longer be found in the wild.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "Improvements in the quality of TV wildlife documentaries have resulted in increased numbers of zoo visitors.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "Zoos have always excelled at transmitting information about animals to the public.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Studying animals in zoos is less stressful for the animals than studying them in the wild.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 24,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 23–24</h3><p>Choose TWO letters, A-E.</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "Which TWO of the following are stated about zoo staff in the text?",
            "options": [
              "Some take part in television documentaries about animals",
              "Some travel to overseas locations to join teams in zoos.",
              "Some get experience with species in the wild before taking up zoo jobs.",
              "Some teach people who are involved with conservation projects.",
              "Some specialise in caring for species which are under threat."
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 24,
            "prompt": "Which TWO of the following are stated about zoo staff in the text?",
            "options": [
              "Some take part in television documentaries about animals",
              "Some travel to overseas locations to join teams in zoos.",
              "Some get experience with species in the wild before taking up zoo jobs.",
              "Some teach people who are involved with conservation projects.",
              "Some specialise in caring for species which are under threat."
            ],
            "answerKey": "D",
            "acceptedAnswers": [
              "B"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 25,
        "to": 26,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 25–26</h3><p>Choose TWO letters, A-E</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 25,
            "prompt": "Which TWO of these beliefs about zoos does the writer mention in the text?",
            "options": [
              "They can help children overcome their fears of wild animals.",
              "They can increase public awareness of environmental issues.",
              "They can provide employment for a range of professional people.",
              "They can generate income to support wildlife conservation projects.",
              "They can raise animals which can later be released into the wild."
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "E"
            ]
          },
          {
            "number": 26,
            "prompt": "Which TWO of these beliefs about zoos does the writer mention in the text?",
            "options": [
              "They can help children overcome their fears of wild animals.",
              "They can increase public awareness of environmental issues.",
              "They can provide employment for a range of professional people.",
              "They can generate income to support wildlife conservation projects.",
              "They can raise animals which can later be released into the wild."
            ],
            "answerKey": "E",
            "acceptedAnswers": [
              "B"
            ]
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 33,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 27–33</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on you answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "Rochman and her colleagues were the first people to research the problem of marine debris.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "The creatures most in danger from ocean trash are certain seabirds.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "The studies Rochman has reviewed have already proved that populations of some birds will soon become extinct.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Rochman analysed papers on the different kinds of danger caused by ocean trash.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Most of the research analysed by Rochman and her colleagues was badly designed.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "One study examined by Rochman was expecting to find that mussels were harmed by eating plastic.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Some mussels choose to eat plastic in preference to their natural diet.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 34,
        "to": 39,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 34–39</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Findings related to marine debris</p><p>Studies of marine debris found the biggest threats were</p><p>• plastic (not metal or wood)</p><p>• bits of debris that were 34_______  (harmful to animals)</p><p>There was little research into 35_______  e.g. from synthetic fibres.</p><p>Drawbacks of the studies examined</p><p>• most of them focused on individual animals, not entire 36_______ </p><p>• the 37_______  of plastic used in the lab did not always reflect those in the ocean</p><p>• there was insufficient information on</p><p>• * numbers of animals which could be affected</p><p>• the impact of a reduction in numbers on the 38_______  of that species</p><p>• the impact on the ecosystem</p><p>Rochman says more information is needed on the possible impact of future 39_______  (e.g. involving oil).</p>",
        "questions": [
          {
            "number": 34,
            "prompt": "* bits of debris that were 34_______  (harmful to animals)",
            "options": [],
            "answerKey": "large",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "There was little research into 35_______  e.g. from synthetic fibres.",
            "options": [],
            "answerKey": "microplastic",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "* most of them focused on individual animals, not entire 36_______ ",
            "options": [],
            "answerKey": "populations",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "* the 37_______  of plastic used in the lab did not always reflect those in the ocean",
            "options": [],
            "answerKey": "concentrations",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "* the impact of a reduction in numbers on the 38_______  of that species",
            "options": [],
            "answerKey": "predators",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Rochman says more information is needed on the possible impact of future 39_______  (e.g. involving oil).",
            "options": [],
            "answerKey": "disasters",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 40,
        "to": 40,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 40</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in box on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 40,
            "prompt": "What would be the best title for this passage?",
            "options": [
              "Assessing the threat of marine debris",
              "Marine debris: who is to blame?",
              "A new solution to the problem of marine debris",
              "Marine debris: the need for international action"
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-15-1",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-15-academic-reading-test-1/",
    "sections": [
      {
        "section": 1,
        "title": "Nutmeg – a valuable spice",
        "contentHtml": "<h2>Nutmeg – a valuable spice</h2><p>The nutmeg tree, Myristica fragrans, is a large evergreen tree native to Southeast Asia. Until the late 18th century, it only grew in one place in the world: a small group of islands in the Banda Sea, part of the Moluccas – or Spice Islands – in northeastern Indonesia. The tree is thickly branched with dense foliage of tough, dark green oval leaves, and produces small, yellow, bell-shaped flowers and pale yellow pear-shaped fruits. The fruit is encased in a flesh husk.</p><p>When the fruit is ripe, this husk splits into two halves along a ridge running the length of the fruit. Inside is a purple-brown shiny seed, 2-3 cm long by about 2 cm across, surrounded by a lacy red or crimson covering called an ‘aril’. These are the sources of the two spices nutmeg and mace, the former being produced from the dried seed and the latter from the aril.</p><p>Nutmeg was a highly prized and costly ingredient in European cuisine in the Middle Ages, and was used as a flavouring, medicinal, and preservative agent. Throughout this period, the Arabs were the exclusive importers of the spice to Europe. They sold nutmeg for high prices to merchants based in Venice, but they never revealed the exact location of the source of this extremely valuable commodity.</p><p>The Arab-Venetian dominance of the trade finally ended in 1512, when the Portuguese reached the Banda Islands and began exploiting its precious resources.</p><p>Always in danger of competition from neighbouring Spain, the Portuguese began subcontracting their spice distribution to Dutch traders. Profits began to flow into the Netherlands, and the Dutch commercial fleet swiftly grew into one of the largest in the world. The Dutch quietly gained control of most of the shipping and trading of spices in Northern Europe. Then, in 1580, Portugal fell under Spanish rule, and by the end of the 16th century the Dutch found themselves locked out of the market.</p><p>As prices for pepper, nutmeg, and other spices soared across Europe, they decided to fight back.</p><p>In 1602, Dutch merchants founded the VOC, a trading corporation better known as the Dutch East India Company. By 1617, the VOC was the richest commercial operation in the world. The company had 50,000 employees worldwide, with a private army of 30,000 men and a fleet of 200 ships. At the same time, thousands of people across Europe were dying of the plague, a highly contagious and deadly disease. Doctors were desperate for a way to stop the spread of this disease, and they decided nutmeg held the cure.</p><p>Everybody wanted nutmeg, and many were willing to spare no expense to have it. Nutmeg bought for a few pennies in Indonesia could be sold for 68,000 times its original cost on the streets of London. The only problem was the short supply. And that’s where the Dutch found their opportunity.</p><p>The Banda Islands were ruled by local sultans who insisted on maintaining a neutral trading policy towards foreign powers. This allowed them to avoid the presence of Portuguese or Spanish troops on their soil, but it also left them unprotected from other invaders. In 1621, the Dutch arrived and took over. Once securely in control of the Bandas, the Dutch went to work protecting their new investment.</p><p>They concentrated all nutmeg production into a few easily guarded areas, uprooting and destroying any trees outside the plantation zones. Anyone caught growing a nutmeg seedling or carrying seeds without the proper authority was severely punished. In addition, all exported nutmeg was covered with lime to make sure there was no chance a fertile seed which could be grown elsewhere would leave the islands. There was only one obstacle to Dutch domination.</p><p>One of the Banda Islands, a sliver of land called Run, only 3 km long by less than 1 km wide, was under the control of the British. After decades of fighting for control of this tiny island, the Dutch and British arrived at a compromise settlement, the Treaty of Breda, in 1667. Intent on securing their hold over every nutmeg-producing island, the Dutch offered a trade: if the British would give them the island of Run, they would in turn give Britain a distant and much less valuable island in North America.</p><p>The British agreed. That other island was Manhattan, which is how New Amsterdam became New York. The Dutch now had a monopoly over the nutmeg trade which would last for another century.</p><p>Then, in 1770, a Frenchman named Pierre Poivre successfully smuggled nutmeg plants to safety in Mauritius, an island off the coast of Africa. Some of these were later exported to the Caribbean where they thrived, especially on the island of Grenada. Next, in 1778, a volcanic eruption in the Banda region caused a tsunami that wiped out half the nutmeg groves. Finally, in 1809, the British returned to Indonesia and seized the Banda Islands by force.</p><p>They returned the islands to the Dutch in 1817, but not before transplanting hundreds of nutmeg seedlings to plantations in several locations across southern Asia. The Dutch nutmeg monopoly was over.</p><p>Today, nutmeg is grown in Indonesia, the Caribbean, India, Malaysia, Papua New Guinea and Sri Lanka, and world nutmeg production is estimated to average between 10,000 and 12,000 tonnes per year.</p>"
      },
      {
        "section": 2,
        "title": "Driverless cars",
        "contentHtml": "<h2>Driverless cars</h2><p><strong>A</strong> The automotive sector is well used to adapting to automation in manufacturing. The implementation of robotic car manufacture from the 1970s onwards led to significant cost savings and improvements in the reliability and flexibility of vehicle mass production. A new challenge to vehicle production is now on the horizon and, again, it comes from automation. However, this time it is not to do with the manufacturing process, but with the vehicles themselves.</p><p>Research projects on vehicle automation are not new. Vehicles with limited self-driving capabilities have been around for more than 50 years, resulting in significant contributions towards driver assistance systems. But since Google announced in 2010 that it had been trialling self-driving cars on the streets of California, progress in this field has quickly gathered pace.</p><p><strong>B</strong> There are many reasons why technology is advancing so fast. One frequently cited motive is safety; indeed, research at the UK’s Transport Research Laboratory has demonstrated that more than 90 percent of road collisions involve human error as a contributory factor, and it is the primary cause in the vast majority. Automation may help to reduce the incidence of this.</p><p>Another aim is to free the time people spend driving for other purposes. If the vehicle can do some or all of the driving, it may be possible to be productive, to socialise or simply to relax while automation systems have responsibility for safe control of the vehicle. If the vehicle can do the driving, those who are challenged by existing mobility models – such as older or disabled travellers – may be able to enjoy significantly greater travel autonomy.</p><p><strong>C</strong> Beyond these direct benefits, we can consider the wider implications for transport and society, and how manufacturing processes might need to respond as a result. At present, the average car spends more than 90 percent of its life parked. Automation means that initiatives for car-sharing become much more viable, particularly in urban areas with significant travel demand. If a significant proportion of the population choose to use shared automated vehicles, mobility demand can be met by far fewer vehicles.</p><p><strong>D</strong> The Massachusetts Institute of Technology investigated automated mobility in Singapore, finding that fewer than 30 percent of the vehicles currently used would be required if fully automated car sharing could be implemented. If this is the case, it might mean that we need to manufacture far fewer vehicles to meet demand. However, the number of trips being taken would probably increase, partly because empty vehicles would have to be moved from one customer to the next.</p><p>Modelling work by the University of Michigan Transportation Research Institute suggests automated vehicles might reduce vehicle ownership by 43 percent, but that vehicles’ average annual mileage double as a result. As a consequence, each vehicle would be used more intensively, and might need replacing sooner. This faster rate of turnover may mean that vehicle production will not necessarily decrease.</p><p><strong>E</strong> Automation may prompt other changes in vehicle manufacture. If we move to a model where consumers are tending not to own a single vehicle but to purchase access to a range of vehicle through a mobility provider, drivers will have the freedom to select one that best suits their needs for a particular journey, rather than making a compromise across all their requirements.</p><p>Since, for most of the time, most of the seats in most cars are unoccupied, this may boost production of a smaller, more efficient range of vehicles that suit the needs of individuals. Specialised vehicles may then be available for exceptional journeys, such as going on a family camping trip or helping a son or daughter move to university.</p><p><strong>F</strong> There are a number of hurdles to overcome in delivering automated vehicles to our roads.</p><p>These include the technical difficulties in ensuring that the vehicle works reliably in the infinite range of traffic, weather and road situations it might encounter; the regulatory challenges in understanding how liability and enforcement might change when drivers are no longer essential for vehicle operation; and the societal changes that may be required for communities to trust and accept automated vehicles as being a valuable part of the mobility landscape.</p><p><strong>G</strong> It’s clear that there are many challenges that need to be addressed but, through robust and targeted research, these can most probably be conquered within the next 10 years. Mobility will change in such potentially significant ways and in association with so many other technological developments, such as telepresence and virtual reality, that it is hard to make concrete predictions about the future.</p><p>However, one thing is certain: change is coming, and the need to be flexible in response to this will be vital for those involved in manufacturing the vehicles that will deliver future mobility.</p>"
      },
      {
        "section": 3,
        "title": "What is exploration?",
        "contentHtml": "<h2>What is exploration?</h2><p>We are all explores. Our desire to discover, and then share that new-found knowledge, is part of what makes us human – indeed, this has played an important part in our success as a species. Long before the first caveman slumped down beside the fire and grunted news that there were plenty of wildebeest over yonder, our ancestors had learnt the value of sending out scouts to investigate the unknown.</p><p>This questing nature of ours undoubtedly helped our species spread around the globe, just as it nowadays no doubt helps the last nomadic Penan maintain their existence in the depleted forests of Borneo, and a visitor negotiate the subways of New York.</p><p>Over the years, we’ve come to think of explorers as a peculiar breed – different from the rest of us, different from those of us who are merely ‘well travelled’, even; and perhaps there is a type of person more suited to seeking out the new, a type of caveman more inclined to risk venturing out.</p><p>That, however, doesn’t take away from the fact that we all have this enquiring instinct, even today; and that in all sorts of professions – whether artist, marine biologist or astronomer – borders of the unknown are being tested each day.</p><p>Thomas Hardy set some of his novels in Egdon Heath, a fictional area of uncultivated land, and used the landscape to suggest the desires and fears of his characters. He is delving into matters we all recognise because they are common to humanity. This is surely an act of exploration, and into a world as remote as the author chooses. Explorer and travel writer Peter Fleming talks of the moment when the explorer returns to the existence he has left behind with his loved ones.</p><p>The traveller ‘who has for weeks or months seen himself only as a puny and irrelevant alien crawling laboriously over a country in which he has no roots and no background, suddenly encounters his other self, a relatively solid figure, with a place in the minds of certain people’.</p><p>In this book about the exploration of the earth’s surface, I have confined myself to those whose travels were real and who also aimed at more than personal discovery. But that still left me with another problem: the word ‘explorer’ has become associated with a past era.</p><p>We think back to a golden age, as if exploration peaked somehow in the 19th century – as if the process of discovery is now on the decline, though the truth is that we have named only one and a half million of this planet’s species, and there may be more than 10 million – and that’s not including bacteria. We have studied only 5 per cent of the species we know. We have scarcely mapped the ocean floors, and know even less about ourselves; we fully understand the workings of only 10 per cent of our brains.</p><p>Here is how some of today’s ‘explorers’ define the word.</p><p>Ran Fiennes, dubbed the ‘greatest living explorer’, said, ‘An explorer is someone who has done something that no human has done before – and also done something scientifically useful.’ Chris Bonington, a leading mountaineer, felt exploration was to be found in the act of physically touching the unknown: ‘You have to have gone somewhere new.’ Then Robin Hanbury-Tenison, a campaigner on behalf of remote so-called ‘tribal’ peoples, said, ‘A traveller simply records information about some far-off world, and reports back; but an explorer changes the world.’ Wilfred Thesiger, who crossed Arabia’s Empty Quarter in 1946, and belongs to an era of unmechanised travel now lost to the rest of us, told me, ‘If I’d gone across by camel when I could have gone by car, it would have been a stunt.’ To him, exploration meant bringing back information from a remote place regardless of any great self-discovery.</p><p>Each definition is slightly different – and tends to reflect the field of endeavour of each pioneer. It was the same whoever I asked: the prominent historian would say exploration was a thing of the past, the cutting-edge scientist would say it was of the present. And so on.</p><p>They each set their own particular criteria; the common factor in their approach being that they all had, unlike many of us who simply enjoy travel or discovering new things, both a very definite objective from the outset and also a desire to record their findings.</p><p>I’d best declare my own bias. As a writer, I’m interested in the exploration of ideas. I’ve done a great many expeditions and each one was unique. I’ve lived for months alone with isolated groups of people all around the world, even two ‘uncontacted tribes’. But none of these things is of the slightest interest to anyone unless, through my books, I’ve found a new slant, explored a new idea. Why? Because the world has moved on.</p><p>The time has long passed for the great continental voyages – another walk to the poles, another crossing of the Empty Quarter. We know how the land surface of our planet lies; exploration of it is now down to the details – the habits of microbes, say, or the grazing behaviour of buffalo. Aside from the deep sea and deep underground, it’s the era of specialists.</p><p>However, this is to disregard the role the human mind has in conveying remote places; and this is what interests me: how a fresh interpretation, even of a well-travelled route, can give its readers new insights.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 4,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–4</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The nutmeg tree and fruit</p><p>• the leaves of the tree are 1_______  in shape</p><p>• the 2_______  surrounds the fruit and breaks open when the fruit is ripe</p><p>• the 3_______  is used to produce the spice nutmeg</p><p>• the covering known as the aril is used to produce 4_______ </p><p>• the tree has yellow flowers and fruit</p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* the leaves of the tree are 1_______  in shape",
            "options": [],
            "answerKey": "oval",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* the 2_______  surrounds the fruit and breaks open when the fruit is ripe",
            "options": [],
            "answerKey": "husk",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "* the 3_______  is used to produce the spice nutmeg",
            "options": [],
            "answerKey": "seed",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* the covering known as the aril is used to produce 4_______ ",
            "options": [],
            "answerKey": "mace",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 5,
        "to": 7,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 5–7</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 5,
            "prompt": "In the Middle Ages, most Europeans knew where nutmeg was grown.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "The VOC was the world’s first major trading company.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "Following the Treaty of Breda, the Dutch had control of all the islands where nutmeg grew.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 8,
        "to": 13,
        "type": "fill",
        "displayType": "table-completion",
        "instructionHtml": "<h3>Questions 8–13</h3><p>Complete the table below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<table><tbody><tr><td>Middle Ages</td><td>Nutmeg was brought to Europe by the 8_______</td></tr><tr><td>16th century</td><td>European nations took control of the nutmeg trade</td></tr><tr><td>17th century</td><td>Demand for nutmeg grew, as it was believed to be effective against the disease known as the 9_______  The Dutch – took control of the Banda Islands – restricted nutmeg production to a few areas – put 10_______  on nutmeg to avoid it being cultivated outside the islands – finally obtained the island of 11_______  from the British</td></tr><tr><td>Late 18th century</td><td>1770 – nutmeg plants were secretly taken to 12_______  1778 – half the Banda Islands’ nutmeg plantations were destroyed by a 13_______</td></tr></tbody></table>",
        "questions": [
          {
            "number": 8,
            "prompt": "Middle Ages | Nutmeg was brought to Europe by the 8_______ ",
            "options": [],
            "answerKey": "Arabs",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "17th century | Demand for nutmeg grew, as it was believed to be effective against the disease known as the 9_______  The Dutch – took control of the Banda Islands – restricted nutmeg production to a few areas – put 10_______  on nutmeg to avoid it being cultivated outside the islands – finally obtained the island of 11_______  from the British",
            "options": [],
            "answerKey": "plague",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "17th century | Demand for nutmeg grew, as it was believed to be effective against the disease known as the 9_______  The Dutch – took control of the Banda Islands – restricted nutmeg production to a few areas – put 10_______  on nutmeg to avoid it being cultivated outside the islands – finally obtained the island of 11_______  from the British",
            "options": [],
            "answerKey": "lime",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "17th century | Demand for nutmeg grew, as it was believed to be effective against the disease known as the 9_______  The Dutch – took control of the Banda Islands – restricted nutmeg production to a few areas – put 10_______  on nutmeg to avoid it being cultivated outside the islands – finally obtained the island of 11_______  from the British",
            "options": [],
            "answerKey": "Run",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Late 18th century | 1770 – nutmeg plants were secretly taken to 12_______  1778 – half the Banda Islands’ nutmeg plantations were destroyed by a 13_______ ",
            "options": [],
            "answerKey": "Mauritius",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Late 18th century | 1770 – nutmeg plants were secretly taken to 12_______  1778 – half the Banda Islands’ nutmeg plantations were destroyed by a 13_______ ",
            "options": [],
            "answerKey": "tsunami",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 18,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–18</h3><p>The Reading Passage has seven paragraphs, A-G.</p><p>Which section contains the following information?</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "reference to the amount of time when a car is not in use",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "mention of several advantages of driverless vehicles for individual road-users",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "reference to the opportunity of choosing the most appropriate vehicle for each trip",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "an estimate of how long it will take to overcome a number of problems",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "a suggestion that the use of driverless cars may have no effect on the number of vehicles manufactured",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 22,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 19–22</h3><p>Complete the summary below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The impact of driverless cars</p><p>Figures from the Transport Research Laboratory indicate that most motor accidents are partly due to 19_______ , so the introduction of driverless vehicles will result in greater safety. In addition to the direct benefits of automation, it may bring other advantages. For example, schemes for 20_______  will be more workable, especially in towns and cities, resulting in fewer cars on the road.</p><p>According to the University of Michigan Transportation Research Institute, there could be a 43 percent drop in 21_______  of cars. However, this would mean that the yearly 22_______  of each car would, on average, be twice as high as it currently is. this would lead to a higher turnover of vehicles, and therefore no reduction in automotive manufacturing.</p>",
        "questions": [
          {
            "number": 19,
            "prompt": "Figures from the Transport Research Laboratory indicate that most motor accidents are partly due to 19_______ , so the introduction of driverless vehicles will result in greater safety. In addition to the direct benefits of automation, it may bring other advantages. For example, schemes for 20_______  will be more workable, especially in towns and cities, resulting in fewer cars on the road.",
            "options": [],
            "answerKey": "human error",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "Figures from the Transport Research Laboratory indicate that most motor accidents are partly due to 19_______ , so the introduction of driverless vehicles will result in greater safety. In addition to the direct benefits of automation, it may bring other advantages. For example, schemes for 20_______  will be more workable, especially in towns and cities, resulting in fewer cars on the road.",
            "options": [],
            "answerKey": "car sharing",
            "acceptedAnswers": [
              "car-sharing"
            ]
          },
          {
            "number": 21,
            "prompt": "According to the University of Michigan Transportation Research Institute, there could be a 43 percent drop in 21_______  of cars. However, this would mean that the yearly 22_______  of each car would, on average, be twice as high as it currently is. this would lead to a higher turnover of vehicles, and therefore no reduction in automotive manufacturing.",
            "options": [],
            "answerKey": "ownership",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "According to the University of Michigan Transportation Research Institute, there could be a 43 percent drop in 21_______  of cars. However, this would mean that the yearly 22_______  of each car would, on average, be twice as high as it currently is. this would lead to a higher turnover of vehicles, and therefore no reduction in automotive manufacturing.",
            "options": [],
            "answerKey": "mileage",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 24,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 23–24</h3><p>Choose TWO letters, A-E.</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "Which TWO benefits of automated vehicles does the writer mention?",
            "options": [
              "Car travellers could enjoy considerable cost savings.",
              "It would be easier to find parking spaces in urban areas.",
              "Travellers could spend journeys doing something other than driving.",
              "People who find driving physically difficult could travel independently.",
              "A reduction in the number of cars would mean a reduction in pollution."
            ],
            "answerKey": "C",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 24,
            "prompt": "Which TWO benefits of automated vehicles does the writer mention?",
            "options": [
              "Car travellers could enjoy considerable cost savings.",
              "It would be easier to find parking spaces in urban areas.",
              "Travellers could spend journeys doing something other than driving.",
              "People who find driving physically difficult could travel independently.",
              "A reduction in the number of cars would mean a reduction in pollution."
            ],
            "answerKey": "D",
            "acceptedAnswers": [
              "C"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 25,
        "to": 26,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 25–26</h3><p>Choose TWO letters, A-E.</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 25,
            "prompt": "Which TWO challenges to automated vehicle development does the writer mention?",
            "options": [
              "making sure the general public has confidence in automated vehicles",
              "managing the pace of transition from conventional to automated vehicles",
              "deciding how to compensate professional drivers who become redundant",
              "setting up the infrastructure to make roads suitable for automated vehicles",
              "getting automated vehicles to adapt to various different driving conditions"
            ],
            "answerKey": "A",
            "acceptedAnswers": [
              "E"
            ]
          },
          {
            "number": 26,
            "prompt": "Which TWO challenges to automated vehicle development does the writer mention?",
            "options": [
              "making sure the general public has confidence in automated vehicles",
              "managing the pace of transition from conventional to automated vehicles",
              "deciding how to compensate professional drivers who become redundant",
              "setting up the infrastructure to make roads suitable for automated vehicles",
              "getting automated vehicles to adapt to various different driving conditions"
            ],
            "answerKey": "E",
            "acceptedAnswers": [
              "A"
            ]
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 32,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 27–32</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "The writer refers to visitors to New York to illustrate the point that",
            "options": [
              "exploration is an intrinsic element of being human.",
              "most people are enthusiastic about exploring.",
              "exploration can lead to surprising results.",
              "most people find exploration daunting."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "According to the second paragraph, what is the writer’s view of explorers?",
            "options": [
              "Their discoveries have brought both benefits and disadvantages.",
              "Their main value is in teaching others.",
              "They act on an urge that is common to everyone.",
              "They tend to be more attracted to certain professions than to others."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "The writer refers to a description of Egdon Heath to suggest that",
            "options": [
              "Hardy was writing about his own experience of exploration.",
              "Hardy was mistaken about the nature of exploration.",
              "Hardy’s aim was to investigate people’s emotional states.",
              "Hardy’s aim was to show the attraction of isolation."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "In the fourth paragraph, the writer refers to ‘a golden age’ to suggest that",
            "options": [
              "the amount of useful information produced by exploration has decreased.",
              "fewer people are interested in exploring than in the 19th century.",
              "recent developments have made exploration less exciting.",
              "we are wrong to think that exploration is no longer necessary."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "In the sixth paragraph, when discussing the definition of exploration, the writer argues that",
            "options": [
              "people tend to relate exploration to their own professional interests.",
              "certain people are likely to misunderstand the nature of exploration.",
              "the generally accepted definition has changed over time.",
              "historians and scientists have more valid definitions than the general public."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "In the last paragraph, the writer explains that he is interested in",
            "options": [
              "how someone’s personality is reflected in their choice of places to visit.",
              "the human ability to cast new light on places that may be familiar.",
              "how travel writing has evolved to meet changing demands.",
              "the feelings that writers develop about the places that they explore."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 33,
        "to": 37,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 33–37</h3><p>Look at the following statements and the list of explorers below.</p><p>Match each statement with the correct explorer, A-E.</p><p>Write the correct letter, A-E, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Peter Fleming",
            "Ran Fiennes",
            "Chris Bonington",
            "Robin Hanbury-Tenison",
            "Wilfred Thesiger"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 33,
            "prompt": "He referred to the relevance of the form of transport used.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "He described feelings on coming back home after a long journey.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "He worked for the benefit of specific groups of people.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "He did not consider learning about oneself an essential part of exploration.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "He defined exploration as being both unique and of value to others.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 38,
        "to": 40,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 38–40</h3><p>Complete the summary below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The writer’s own bias</p><p>The writer has experience of a large number of 38_______ , and was the first stranger that certain previously 39_______  people had encountered. He believes there is no need for further exploration of Earth’s 40_______ , except to answer specific questions such as how buffalo eat.</p>",
        "questions": [
          {
            "number": 38,
            "prompt": "The writer has experience of a large number of 38_______ , and was the first stranger that certain previously 39_______  people had encountered. He believes there is no need for further exploration of Earth’s 40_______ , except to answer specific questions such as how buffalo eat.",
            "options": [],
            "answerKey": "unique expeditions",
            "acceptedAnswers": [
              "(unique) expeditions"
            ]
          },
          {
            "number": 39,
            "prompt": "The writer has experience of a large number of 38_______ , and was the first stranger that certain previously 39_______  people had encountered. He believes there is no need for further exploration of Earth’s 40_______ , except to answer specific questions such as how buffalo eat.",
            "options": [],
            "answerKey": "uncontacted",
            "acceptedAnswers": [
              "uncontacted / isolated"
            ]
          },
          {
            "number": 40,
            "prompt": "The writer has experience of a large number of 38_______ , and was the first stranger that certain previously 39_______  people had encountered. He believes there is no need for further exploration of Earth’s 40_______ , except to answer specific questions such as how buffalo eat.",
            "options": [],
            "answerKey": "land surface",
            "acceptedAnswers": [
              "(land) surface"
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-15-2",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-15-academic-reading-test-2/",
    "sections": [
      {
        "section": 1,
        "title": "Could urban engineers learn from dance?",
        "contentHtml": "<h2>Could urban engineers learn from dance?</h2><p><strong>A</strong> The way we travel around cities has a major impact on whether they are sustainable. Transportation is estimated to account for 30% of energy consumption in most of the world’s most developed nations, so lowering the need for energy-using vehicles is essential for decreasing the environmental impact of mobility. But as more and more people move to cities, it is important to think about other kinds of sustainable travel too.</p><p>The ways we travel affect our physical and mental health, our social lives, our access to work and culture, and the air we breathe. Engineers are tasked with changing how we travel round cities through urban design, but the engineering industry still works on the assumptions that led to the creation of the energy-consuming transport systems we have now: the emphasis placed solely on efficiency, speed, and quantitative data.</p><p>We need radical changes, to make it healthier, more enjoyable, and less environmentally damaging to travel around cities.</p><p><strong>B</strong> Dance might hold some of the answers. That is not to suggest everyone should dance their way to work, however healthy and happy it might make us, but rather that the techniques used by choreographers to experiment with and design movement in dance could provide engineers with tools to stimulate new ideas in city-making.</p><p>Richard Sennett, an influential urbanist and sociologist who has transformed ideas about the way cities are made, argues that urban design has suffered from a separation between mind and body since the introduction of the architectural blueprint.</p><p><strong>C</strong> Whereas medieval builders improvised and adapted construction through their intimate knowledge of materials and personal experience of the conditions on a site, building designs are now conceived and stored in media technologies that detach the designer from the physical and social realities they are creating. While the design practices created by these new technologies are essential for managing the technical complexity of the modern city, they have the drawback of simplifying reality in the process.</p><p><strong>D</strong> To illustrate, Sennett discusses the Peachtree Center in Atlanta, USA, a development typical of the modernist approach to urban planning prevalent in the 1970s. Peachtree created a grid of streets and towers intended as a new pedestrian-friendly downtown for Atlanta. According to Sennett, this failed because its designers had invested too much faith in computer-aided design to tell them how it would operate.</p><p>They failed to take into account that purpose-built street cafés could not operate in the hot sun without the protective awnings common in older buildings, and would need energy-consuming air conditioning instead, or that its giant car park would feel so unwelcoming that it would put people off getting out of their cars. What seems entirely predictable and controllable on screen has unexpected results when translated into reality.</p><p><strong>E</strong> The same is true in transport engineering, which uses models to predict and shape the way people move through the city. Again, these models are necessary, but they are built on specific world views in which certain forms of efficiency and safety are considered and other experience of the city ignored. Designs that seem logical in models appear counter-intuitive in the actual experience of their users.</p><p>The guard rails that will be familiar to anyone who has attempted to cross a British road, for example, were an engineering solution to pedestrian safety based on models that prioritise the smooth flow of traffic. On wide major roads, they often guide pedestrians to specific crossing points and slow down their progress across the road by using staggered access points divide the crossing into two – one for each carriageway.</p><p>In doing so they make crossings feel longer, introducing psychological barriers greatly impacting those that are the least mobile, and encouraging others to make dangerous crossings to get around the guard rails. These barriers don’t just make it harder to cross the road: they divide communities and decrease opportunities for healthy transport. As a result, many are now being removed, causing disruption, cost, and waste.</p><p><strong>F</strong> If their designers had had the tools to think with their bodies – like dancers – and imagine how these barriers would feel, there might have been a better solution. In order to bring about fundamental changes to the ways we use our cities, engineering will need to develop a richer understanding of why people move in certain ways, and how this movement affects them. Choreography may not seem an obvious choice for tackling this problem.</p><p>Yet it shares with engineering the aim of designing patterns of movement within limitations of space. It is an art form developed almost entirely by trying out ideas with the body, and gaining instant feedback on how the results feel. Choreographers have deep understanding of the psychological, aesthetic, and physical implications of different ways of moving.</p><p><strong>G</strong> Observing the choreographer Wayne McGregor, cognitive scientist David Kirsh described how he ‘thinks with the body’, Kirsh argues that by using the body to simulate outcomes, McGregor is able to imagine solutions that would not be possible using purely abstract thought. This kind of physical knowledge is valued in many areas of expertise, but currently has no place in formal engineering design processes.</p><p>A suggested method for transport engineers is to improvise design solutions and instant feedback about how they would work from their own experience of them, or model designs at full scale in the way choreographers experiment with groups of dancers. Above all, perhaps, they might learn to design for emotional as well as functional effects.</p>"
      },
      {
        "section": 2,
        "title": "Should we try to bring extinct species back to life?",
        "contentHtml": "<h2>Should we try to bring extinct species back to life?</h2><p><strong>A</strong> The passenger pigeon was a legendary species. Flying in vast numbers across North America, with potentially many millions within a single flock, their migration was once one of nature’s great spectacles. Sadly, the passenger pigeon’s existence came to an end on 1 September 1914, when the last living specimen died at Cincinnati Zoo. Geneticist Ben Novak is lead researcher on an ambitious project which now aims to bring the bird back to life through a process known as ‘de-extinction’.</p><p>The basic premise involves using cloning technology to turn the DNA of extinct animals into a fertilised embryo, which is carried by the nearest relative still in existence – in this case, the abundant band-tailed pigeon – before being born as a living, breathing animal. Passenger pigeons are one of the pioneering species in this field, but they are far from the only ones on which this cutting-edge technology is being trialled.</p><p><strong>B</strong> In Australia, the thylacine, more commonly known as the Tasmanian tiger, is another extinct creature which genetic scientists are striving to bring back to life. ‘There is no carnivore now in Tasmania that fills the niche which thylacines once occupied,’ explains Michael Archer of the University of New South Wales.</p><p>He points out that in the decades since the thylacine went extinct, there has been a spread in a ‘dangerously debilitating’ facial tumour syndrome which threatens the existence of the Tasmanian devils, the island’s other notorious resident. Thylacines would have prevented this spread because they would have killed significant numbers of Tasmanian devils. ‘If that contagious cancer had popped up previously, it would have burned out in whatever region it started.</p><p>The return of thylacines to Tasmania could help to ensure that devils are never again subjected to risks of this kind.’</p><p><strong>C</strong> If extinct species can be brought back to life, can humanity begin to correct the damage it has caused to the natural world over the past few millennia? ‘The idea of de-extinction is that we can reverse this process, bringing species that no longer exist back to life,’ says Beth Shapiro of University of California Santa Cruz’s Genomics Institute. ‘I don’t think that we can do this.</p><p>There is no way to bring back something that is 100 per cent identical to a species that went extinct a long time ago.’ A more practical approach for long-extinct species is to take the DNA of existing species as a template, ready for the insertion of strands of extinct animal DNA to create something new; a hybrid, based on the living species, but which looks and/or acts like the animal which died out.</p><p><strong>D</strong> This complicated process and questionable outcome begs the question: what is the actual point of this technology? ‘For us, the goal has always been replacing the extinct species with a suitable replacement,’ explains Novak.</p><p>‘When it comes to breeding, band-tailed pigeons scatter and make maybe one or two nests per hectare, whereas passenger pigeons were very social and would make 10,000 or more nests in one hectare.’ Since the disappearance of this key species, ecosystems in the eastern US have suffered, as the lack of disturbance caused by thousands of passenger pigeons wrecking trees and branches means there has been minimal need for regrowth.</p><p>This has left forests stagnant and therefore unwelcoming to the plants and animals which evolved to help regenerate the forest after a disturbance. According to Novak, a hybridized band-tailed pigeon, with the added nesting habits of a passenger pigeon, could, in theory, re-establish that forest disturbance, thereby creating a habitat necessary for a great many other native species to thrive.</p><p><strong>E</strong> Another popular candidate for this technology is the woolly mammoth. George Church, professor at Harvard Medical School and leader of the Woolly Mammoth Revival Project, has been focusing on cold resistance, the main way in which the extinct woolly mammoth and its nearest living relative, the Asian elephant, differ. By pinpointing which genetic traits made it possible for mammoths to survive the icy climate of the tundra, the project’s goal is to return mammoths, or a mammoth-like species, to the area.</p><p>‘My highest priority would be preserving the endangered Asian elephant,’ says Church, ‘expanding their range to the huge ecosystem of the tundra.</p><p>Necessary adaptations would include smaller ears, thicker hair, and extra insulating fat, all for the purpose of reducing heat loss in the tundra, and all traits found in the now extinct woolly mammoth.’ This repopulation of the tundra and boreal forests of Eurasia and North America with large mammals could also be a useful factor in reducing carbon emissions – elephants punch holes through snow and knock down trees, which encourages grass growth.</p><p>This grass growth would reduce temperature, and mitigate emissions from melting permafrost.</p><p><strong>F</strong> While the prospect of bringing extinct animals back to life might capture imaginations, it is, of course, far easier to try to save an existing species which is merely threatened with extinction. ‘Many of the technologies that people have in mind when they think about de-extinction can be used as a form of “genetic rescue”,’ explains Shapiro.</p><p>She prefers to focus the debate on how this emerging technology could be used to fully understand why various species went extinct in the first place, and therefore how we could use it to make genetic modifications which could prevent mass extinctions in the future. ‘I would also say there’s an incredible moral hazard to not do anything at all,’ she continues. ‘We know that what we are doing today is not enough, and we have to be willing to take some calculated and measured risks.’</p>"
      },
      {
        "section": 3,
        "title": "Having a laugh",
        "contentHtml": "<h2>Having a laugh</h2><p>The findings of psychological scientists reveal the importance of humour</p><p>Humans start developing a sense of humour as early as six weeks old, when babies begin to laugh and smile in response to stimuli. Laughter is universal across all human cultures and even exists in some form in rats, chimps, and bonobos. Like other human emotions and expressions, laughter and humour provide psychological scientists with rich resources for studying human psychology, ranging from the development of language to the neuroscience of social perception.</p><p>Theories focusing on the evolution of laughter point to it as an important adaptation for social communication. Take, for example, the recorded laughter in TV comedy shows. Back in 1950, US sound engineer Charley Douglass hated dealing with the unpredictable laughter of live audiences, so started recording his own ‘laugh tracks’. These were intended to help people at home feel like they were in a social situation, such as a crowded theatre.</p><p>Douglass even recorded various types of laughter, as well as mixtures of laugher from men, women, and children. In doing so, he picked up on a quality of laughter that is now interesting researchers: a simple ‘haha’ communicates a remarkable amount of socially relevant information.</p><p>In one study conducted in 2016, samples of laughter from pairs of English-speaking students were recorded at the University of California, Santa Cruz. A team made up of more than 30 psychological scientists, anthropologists, and biologists then played these recording to listeners from 24 diverse societies, from indigenous tribes in New Guinea to city-dwellers in India and Europe. Participants were asked whether they thought the people laughing were friends or strangers.</p><p>On average, the results were remarkably consistent: worldwide, people’s guesses were correct approximately 60% of the time.</p><p>Researchers have also found that different types of laughter serve as codes to complex human social hierarchies. A team led by Christopher Oveis from the University of California, San Diego, found that high-status individuals had different laughs from low-status individuals, and that strangers’ judgements of an individual’s social status were influenced by the dominant or submissive quality of their laughter.</p><p>In their study, 48 male college students were randomly assigned to groups of four, with each group composed of two low-status members, who had just joined their college fraternity group, and two high-status members, older student took a turn at being teased by the others, involving the use of mildly insulting nicknames. Analysis revealed that, as expected, high-status individuals produced more dominant laughs and fewer submissive laughs relative to the low-status individuals.</p><p>Meanwhile, low-status individuals were more likely to change their laughter based on their position of power; that is, the newcomers produced more dominant laughs when they were in the ‘powerful’ role of teasers. Dominant laughter was higher in pitch, louder, and more variable in tone than submissive laughter.</p><p>A random group of volunteers then listened to an equal number of dominant and submissive laughs from both the high- and low-status individuals, and were asked to estimate the social status of the laughter. In line with predictions, laughers producing dominant laughs were perceived to be significantly higher in status than laughers producing submissive laughs.</p><p>‘This was particularly true for low-status individuals, who were rated as significantly higher in status when displaying a dominant versus submissive laugh,’ Oveis and colleagues note. ‘Thus, by strategically displaying more dominant laughter when the context allows, low-status individuals may achieve higher status in the eyes of others.’ However, high-status individuals were rated as high-status whether they produced their natural dominant laugh or tried to do a submissive one.</p><p>Another study, conducted by David Cheng and Lu Wang of Australian National University, was based on the hypothesis that humour might provide a respite from tedious situations in the workplace. This ‘mental break’ might facilitate the replenishment of mental resources. To test this theory, the researchers recruited 74 business students, ostensibly for an experiment on perception.</p><p>First, the students performed a tedious task in which they had to cross out every instance of the letter ‘e’ over two pages of text. The students then were randomly assigned to watch a video clip eliciting either humour, contentment, or neutral feelings. Some watched a clip of the BBC comedy Mr. Bean, others a relaxing scene with dolphins swimming in the ocean, and others a factual video about the management profession.</p><p>The students then completed a task requiring persistence in which they were asked to guess the potential performance of employees based on provided profiles, and were told that making 10 correct assessments in a row would lead to a win. However, the software was programmed such that is was nearly impossible to achieve 10 consecutive correct answers. Participants were allowed to quit the task at any point. Students who had watched the Mr.</p><p>Bean video ended up spending significantly more time working on the task, making twice as many predictions as the other two groups.</p><p>Cheng and Wang then replicated these results in a second study, during which they had participants complete long multiplication questions by hand. Again, participants who watched the humorous video spent significantly more time working on this tedious task and completed more questions correctly than did the students in either of the other groups.</p><p>‘Although humour has been found to help relieve stress and facilitate social relationships, traditional view of task performance implies that individuals should avoid things such as humour that may distract them from the accomplishment of task goals,’ Cheng and Wang conclude. ‘We suggest that humour is not only enjoyable but more importantly, energising.’</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 6,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 1–6</h3><p>The Reading Passage has seven paragraphs, A-G.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "reference to an appealing way of using dance that the writer is not proposing",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "an example of a contrast between past and present approaches to building",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "mention of an objective of both dance and engineering",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "reference to an unforeseen problem arising from ignoring the climate",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "why some measures intended to help people are being reversed",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "reference to how transport has an impact on human lives",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 7,
        "to": 13,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 7–13</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Guard rails</p><p>Guard rails were introduced on British roads to improve the 7_______  of pedestrians, while ensuring that the movement of 8_______  is not disrupted. Pedestrians are led to access points, and encouraged to cross one 9_______  at a time.</p><p>An unintended effect is to create psychological difficulties in crossing the road, particularly for less 10_______  people. Another result is that some people cross the road in a 11_______  way. The guard rails separate 12_______ , and make it more difficult to introduce forms of transport that are 13_______ </p>",
        "questions": [
          {
            "number": 7,
            "prompt": "Guard rails were introduced on British roads to improve the 7_______  of pedestrians, while ensuring that the movement of 8_______  is not disrupted. Pedestrians are led to access points, and encouraged to cross one 9_______  at a time.",
            "options": [],
            "answerKey": "safety",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Guard rails were introduced on British roads to improve the 7_______  of pedestrians, while ensuring that the movement of 8_______  is not disrupted. Pedestrians are led to access points, and encouraged to cross one 9_______  at a time.",
            "options": [],
            "answerKey": "traffic",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "Guard rails were introduced on British roads to improve the 7_______  of pedestrians, while ensuring that the movement of 8_______  is not disrupted. Pedestrians are led to access points, and encouraged to cross one 9_______  at a time.",
            "options": [],
            "answerKey": "carriageway",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "An unintended effect is to create psychological difficulties in crossing the road, particularly for less 10_______  people. Another result is that some people cross the road in a 11_______  way. The guard rails separate 12_______ , and make it more difficult to introduce forms of transport that are 13_______ ",
            "options": [],
            "answerKey": "mobile",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "An unintended effect is to create psychological difficulties in crossing the road, particularly for less 10_______  people. Another result is that some people cross the road in a 11_______  way. The guard rails separate 12_______ , and make it more difficult to introduce forms of transport that are 13_______ ",
            "options": [],
            "answerKey": "dangerous",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "An unintended effect is to create psychological difficulties in crossing the road, particularly for less 10_______  people. Another result is that some people cross the road in a 11_______  way. The guard rails separate 12_______ , and make it more difficult to introduce forms of transport that are 13_______ ",
            "options": [],
            "answerKey": "communities",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "An unintended effect is to create psychological difficulties in crossing the road, particularly for less 10_______  people. Another result is that some people cross the road in a 11_______  way. The guard rails separate 12_______ , and make it more difficult to introduce forms of transport that are 13_______ ",
            "options": [],
            "answerKey": "healthy",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 17,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–17</h3><p>The Reading Passage has six paragraphs, A-F.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "a reference to how further disappearance of multiple species could be avoided.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "explanation of a way of reproducing an extinct animal using the DNA of only that species",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "reference to a habitat which has suffered following the extinction of a species",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "mention of the exact point at which a particular species became extinct",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 18,
        "to": 22,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 18–22</h3><p>Complete the summary below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The woolly mammoth revival project</p><p>Professor George Church and his team are trying to identify the 18_______  which enabled mammoths to live in the tundra. The findings could help preserve the mammoth’s close relative, the endangered Asian elephant.</p><p>According to Church, introducing Asian elephants to the tundra would involve certain physical adaptations to minimise 19_______ . To survive in the tundra, the species would need to have the mammoth-like features of thicker hair, 20_______  of a reduced size and more 21_______ </p><p>Repopulating the tundra with mammoths or Asian elephant/mammoth hybrids would also have an impact on the environment, which could help to reduce temperatures and decrease 22_______ </p>",
        "questions": [
          {
            "number": 18,
            "prompt": "Professor George Church and his team are trying to identify the 18_______  which enabled mammoths to live in the tundra. The findings could help preserve the mammoth’s close relative, the endangered Asian elephant.",
            "options": [],
            "answerKey": "genetic traits",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "According to Church, introducing Asian elephants to the tundra would involve certain physical adaptations to minimise 19_______ . To survive in the tundra, the species would need to have the mammoth-like features of thicker hair, 20_______  of a reduced size and more 21_______ ",
            "options": [],
            "answerKey": "heat loss",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "According to Church, introducing Asian elephants to the tundra would involve certain physical adaptations to minimise 19_______ . To survive in the tundra, the species would need to have the mammoth-like features of thicker hair, 20_______  of a reduced size and more 21_______ ",
            "options": [],
            "answerKey": "ears",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "According to Church, introducing Asian elephants to the tundra would involve certain physical adaptations to minimise 19_______ . To survive in the tundra, the species would need to have the mammoth-like features of thicker hair, 20_______  of a reduced size and more 21_______ ",
            "options": [],
            "answerKey": "insulating fat",
            "acceptedAnswers": [
              "(insulating) fat"
            ]
          },
          {
            "number": 22,
            "prompt": "Repopulating the tundra with mammoths or Asian elephant/mammoth hybrids would also have an impact on the environment, which could help to reduce temperatures and decrease 22_______ ",
            "options": [],
            "answerKey": "carbon emissions",
            "acceptedAnswers": [
              "(carbon) emissions"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 26,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 23–26</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person, A, B or C.</p><p>Write the correct letter, A, B or C, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Ben Novak",
            "Michael Archer",
            "Beth Shapiro"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "Reintroducing an extinct species to its original habitat could improve the health of a particular species living there.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "It is important to concentrate on the causes of an animal’s extinction.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "A species brought back from extinction could have an important beneficial impact on the vegetation of its habitat.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "Our current efforts at preserving biodiversity are insufficient.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "When referring to laughter in the first paragraphs, the writer emphasises",
            "options": [
              "its impact on language.",
              "its function in human culture.",
              "its value to scientific research.",
              "its universality in animal societies."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "What does the writer suggest about Charley Douglass?",
            "options": [
              "He understood the importance of enjoying humour in a group setting.",
              "He believed that TV viewers at home needed to be told when to laugh.",
              "He wanted his shows to appeal to audiences across the social spectrum.",
              "He preferred shows where audiences were present in the recording studio."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "What makes the Santa Cruz study particularly significant?",
            "options": [
              "the various different types of laughter that were studied",
              "the similar results produced by a wide range of cultures",
              "the number of different academic disciplines involved",
              "the many kinds of people whose laughter was recorded"
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Which of the following happened in the San Diego study?",
            "options": [
              "Some participants became very upset.",
              "Participants exchanged roles.",
              "Participants who had not met before became friends.",
              "Some participants were unable to laugh."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "In the fifth paragraph, what did the results of the San Diego study suggest?",
            "options": [
              "It is clear whether a dominant laugh is produced by a high- or low-status person.",
              "Low-status individuals in a position of power will still produce submissive laughs.",
              "The submissive laughs of low- and high-status individuals are surprisingly similar.",
              "High-status individuals can always be identified by their way of laughing."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 36,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 32–36</h3><p>Complete the summary using the list of words, A-H, below.</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "laughter",
            "relaxing",
            "boring",
            "anxiety",
            "stimulating",
            "emotion",
            "enjoyment",
            "amusing"
          ]
        },
        "questionHtml": "<p>The benefits of humour</p><p>In one study at Australian National University, randomly chosen groups of participants were shown one of three videos, each designed to generate a different kind of 32_______ . When all participants were then given a deliberately frustrating task to do, it was found that those who had watched the 33_______  video persisted with the task for longer and tried harder to accomplish the task than either of the other two groups.</p><p>A second study in which participants were asked to perform a particularly 34_______  task produced similar results. According to researchers David Cheng and Lu Wang, these findings suggest that humour not only reduces 35_______  and helps build social connections but it may also have a 36_______  Effect on the body and mind.</p>",
        "questions": [
          {
            "number": 32,
            "prompt": "In one study at Australian National University, randomly chosen groups of participants were shown one of three videos, each designed to generate a different kind of 32_______ . When all participants were then given a deliberately frustrating task to do, it was found that those who had watched the 33_______  video persisted with the task for longer and tried harder to accomplish the task than either of the other two groups.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "In one study at Australian National University, randomly chosen groups of participants were shown one of three videos, each designed to generate a different kind of 32_______ . When all participants were then given a deliberately frustrating task to do, it was found that those who had watched the 33_______  video persisted with the task for longer and tried harder to accomplish the task than either of the other two groups.",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "A second study in which participants were asked to perform a particularly 34_______  task produced similar results. According to researchers David Cheng and Lu Wang, these findings suggest that humour not only reduces 35_______  and helps build social connections but it may also have a 36_______  Effect on the body and mind.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "A second study in which participants were asked to perform a particularly 34_______  task produced similar results. According to researchers David Cheng and Lu Wang, these findings suggest that humour not only reduces 35_______  and helps build social connections but it may also have a 36_______  Effect on the body and mind.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "A second study in which participants were asked to perform a particularly 34_______  task produced similar results. According to researchers David Cheng and Lu Wang, these findings suggest that humour not only reduces 35_______  and helps build social connections but it may also have a 36_______  Effect on the body and mind.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 37,
        "to": 40,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the claims of the writer</p><p>FALSE if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "Participants in the Santa Cruz study were more accurate at identifying the laughs of friends than those of strangers.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "The researchers in the San Diego study were correct in their predictions regarding the behaviour of the high-status individuals.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "The participants in the Australian National University study were given a fixed amount of time to complete the task focusing on employee profiles.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Cheng and Wang’s conclusions were in line with established notions regarding task performance.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-15-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-15-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "Henry Moore (1898-1986)",
        "contentHtml": "<h2>Henry Moore (1898-1986)</h2><p>The British sculptor Henry Moore was a leading figure in the 20th-century art world</p><p>Henry Moore was born in Castleford, a small town near Leeds in the north of England. He was the seventh child of Raymond Moore and his wife Mary Baker. He studied at Castleford Grammar School from 1909 to 1915, where his early interest in art was encouraged by his teacher Alice Gostick. After leaving school, Moore hoped to become a sculptor, but instead he complied with his father’s wish that he train as a schoolteacher.</p><p>He had to abandon his training in 1917 when he was sent to France to fight in the First World War.</p><p>After the war, Moore enrolled at the Leeds School of Art, where he studied for two years. In his first year, he spent most of his time drawing. Although he wanted to study sculpture, no teacher was appointed until his second year. At the end of that year, he passed the sculpture examination and was awarded a scholarship to the Royal College of Art in London. In September 1921, he moved to London and began three years of advanced study in sculpture.</p><p>Alongside the instruction he received at the Royal College, Moore visited many of the London museums, particularly the British Museum, which had a wide-ranging collection of ancient sculpture. During these visits, he discovered the power and beauty of ancient Egyptian and African sculpture. As he became increasingly interested in these ‘primitive’ forms of art, he turned away from European sculptural traditions.</p><p>After graduating, Moore spent the first six months of 1925 travelling in France. When he visited the Trocadero Museum in Paris, he was impressed by a cast of a Mayan* sculpture of the rain spirit. It was a male reclining figure with its knees drawn up together, and its head at a right angle to its body. Moore became fascinated with this stone sculpture, which he thought had a power and originality that no other stone sculpture possessed.</p><p>He himself started carving a variety of subjects in stone, including depiction of reclining women, mother-and-child groups, and masks.</p><p>Moore’s exceptional talent soon gained recognition, and in 1926 he started work as a sculpture instructor at the Royal College. In 1933, he became a member of a group of young artists called Unit One. The aim of the group was to convince the English public of the merits of the emerging international movement in modern art and architecture.</p><p>Around this time, Moore moved away from the human figure to experiment with abstract shapes. In 1931, he held an exhibition at the Leicester Galleries in London. His work was enthusiastically welcomed by fellow sculptors, but the reviews in the press were extremely negative and turned Moore into a notorious figure. There were calls for his resignation from the Royal College, and the following year, when his contract expired, he left to start a sculpture department at the Chelsea School of Art in London.</p><p>Throughout the 1930s, Moore did not show any inclination to please the British public. He became interested in the paintings of the Spanish artist Pablo Picasso, whose work inspired him to distort the human body in a radical way. At times, he seemed to abandon the human figure altogether. The pages of his sketchbooks from this period show his ideas for abstract sculptures that bore little resemblance to the human form.</p><p>In 1940, during the Second World War, Moore stopped teaching at the Chelsea School and moved to a farmhouse about 20 miles north of London. A shortage of materials forced him to focus on drawing. He did numerous small sketches of Londoners, later turning these ideas into large coloured drawings in his studio. In 1942, he returned to Castleford to make a series of sketches of the miners who worked there.</p><p>In 1944, Harlow, a town near London, offered Moore a commission for a sculpture depicting a family. The resulting work signifies a dramatic change in Moore’s style, away from the experimentation of the 1930s towards a more natural and humanistic subject matter. He did dozens of studies in clay for the sculpture, and these were cast in bronze and issued in editions of seven to nine copies each. In this way, Moore’s work became available to collectors all over the world.</p><p>The boost to his income enabled him to take on ambitious projects and start working on the scale he felt his sculpture demanded.</p><p>Critics who had begun to think that Moore had become less revolutionary were proven wrong by the appearance, in 1950, of the first of Moore’s series of standing figures in bronze, with their harsh and angular pierced forms and distinct impression of menace. Moore also varied his subject matter in the 1950s with such works as Warrior with Shield and Falling Warrior.</p><p>These were rare examples of Moore’s use of the male figure and owe something to his visit to Greece in 1951, when he had the opportunity to study ancient works of art.</p><p>In his final years, Moore created the Henry Moore Foundation to promote art appreciation and to display his work. Moore was the first modern English sculptor to achieve international critical acclaim and he is still regarded as one of the most important sculptors of the 20th century.</p><p>*Mayan: belonging to an ancient civilisation that inhabited parts of current-day Mexico, Guatemala, Belize, El Salvador and Honduras.</p>"
      },
      {
        "section": 2,
        "title": "The Desolenator: producing clean water",
        "contentHtml": "<h2>The Desolenator: producing clean water</h2><p><strong>A</strong> Travelling around Thailand in the 1990s, William Janssen was impressed with the basic rooftop solar heating systems that were on many homes, where energy from the sun was absorbed by a plate and then used to heat water for domestic use. Two decades later Janssen developed that basic idea he saw in Southeast Asia into a portable device that uses the power from the sun to purify water.</p><p><strong>B</strong> The Desolenator operates as a mobile desalination unit that can take water from different places, such as the sea, rivers, boreholes and rain, and purify it for human consumption. It is particularly valuable in regions where natural groundwater reserves have been polluted, or where seawater is the only water source available.</p><p>Janssen saw that there was a need for a sustainable way to clean water is both the developing and the developed countries when he moved to the United Arab Emirates and saw large-scale water processing. ‘I was confronted with the enormous carbon footprint that the Gulf nations have because of all of the desalination that they do,’ he says.</p><p><strong>C</strong> The Desolenator can produce 15 litres of drinking water per day, enough to sustain a family for cooking and drinking. Its main selling point is that unlike standard desalination techniques, it doesn’t require a generated power supply: just sunlight. It measures 120 cm by 90 cm, and it easy to transport, thanks to its two wheels. Water enters through a pipe, and flows as a thin film between a sheet of double glazing and the surface of a solar panel, where it is heated by the sun.</p><p>The warm water flows into a small boiler (heated by a solar-powered battery) where it is converted to steam. When the steam cools, it becomes distilled water. The device has a very simple filter to trap particles, and this can easily be shaken to remove them. There are two tubes for liquid coming out: one for the waste – salt from seawater, fluoride, etc. – and another for the distilled water.</p><p>The performance of the unit is shown on an LCD screen and transmitted to the company which provides servicing when necessary.</p><p><strong>D</strong> A recent analysis found that at least two-thirds of the world’s population lives with severe water scarcity for at least a month every year. Janssen says that by 2030 half of the world’s population will be living with water stress – where the demand exceeds the supply over a certain period of time. ‘It is really important that a sustainable solution is brought to the market that is able to help these people,’ he says.</p><p>Many countries ‘don’t have the money for desalination plants, which are very expensive to build. They don’t have the money to operate them, they are very maintenance intensive, and they don’t have the money to buy the diesel to run the desalination plants, so it is a really bad situation.’</p><p><strong>E</strong> The device is aimed at a wide variety of users – from homeowners in the developing world who do not have a constant supply of water to people living off the grid in rural parts of the US. The first commercial versions of the Desolenator are expected to be in operation in India early next year, after field tests are carried out.</p><p>The market for the self-sufficient devices in developing countries is twofold – those who cannot afford the money for the device outright and pay through microfinance, and middle-income homes that can lease their own equipment. ‘People in India don’t pay for a fridge outright; they pay for it over six months. They would put the Desolenator on their roof and hook it up to their municipal supply and they would get very reliable drinking water on a daily basis,’ Janssen says.</p><p>In the developed world, it is aimed at niche markets where tap water is unavailable – for camping, on boats, or for the military, for instance.</p><p><strong>F</strong> Prices will vary according to where it is bought. In the developing world, the price will depend on what deal aid organisations can negotiate. In developed countries, it is likely to come in at $1,000 (£685) a unit, said Janssen. ‘We are a venture with a social mission. We are aware that the product we have envisioned is mainly finding application in the developing world and humanitarian sector and that this is the way we will proceed.</p><p>We do realise, though, that to be a viable company there is a bottom line to keep in mind,’ he says.</p><p><strong>G</strong> The company itself is based at Imperial College London, although Janssen, its chief executive, still lives in the UAE. It has raised £340,000 in funding so far. Within two years, he says, the company aims to be selling 1,000 units a month, mainly in the humanitarian field. They are expected to be sold in areas such as Australia, northern Chile, Peru, Texas and California.</p>"
      },
      {
        "section": 3,
        "title": "Why fairy tales are really scary tales",
        "contentHtml": "<h2>Why fairy tales are really scary tales</h2><p>Some people think that fairy tales are just stories to amuse children, but their universal and enduring appeal may be due to more serious reasons</p><p>People of every culture tell each other fairy tales but the same story often takes a variety of forms in different parts of the world. In the story of Little Red Riding Hood that European children are familiar with, a young girl on the way to see her grandmother meets a wolf and tells him where she is going. The wolf runs on ahead and disposes of the grandmother, then gets into bed dressed in the grandmother’s clothes to wait for Little Red Riding Hood.</p><p>You may think you know the story – but which version? In some versions, the wolf swallows up the grandmother, while in others it locks her in a cupboard. In some stories Red Riding Hood gets the better of the wolf on her own, while in others a hunter or a woodcutter hears her cries and comes to her rescue.</p><p>The universal appeal of these tales is frequently attributed to the idea that they contain cautionary messages: in the case of Little Red Riding Hood, to listen to your mother, and avoid talking to strangers. ‘It might be what we find interesting about this story is that it’s got this survival-relevant information in it,’ says anthropologist Jamie Tehrani at Durham University in the UK. But his research suggests otherwise.</p><p>‘We have this huge gap in our knowledge about the history and prehistory of storytelling, despite the fact that we know this genre is an incredibly ancient one,’ he says. That hasn’t stopped anthropologists, folklorists* and other academics devising theories to explain the importance of fairy tales in human society. Now Tehrani has found a way to test these ideas, borrowing a technique from evolutionary biologists.</p><p>To work out the evolutionary history, development and relationships among groups of organisms, biologists compare the characteristics of living species in a process called ‘phylogenetic analysis’. Tehrani has used the same approach to compare related versions of fairy tales to discover how they have evolved and which elements have survived longest.</p><p>Tehrani’s analysis focused on Little Red Riding Hood in its many forms, which include another Western fairy tale known as The Wolf and the Kids. Checking for variants of these two tales and similar stories from Africa, East Asia and other regions, he ended up with 58 stories recorded from oral traditions. Once his phylogenetic analysis had established that they were indeed related, he used the same methods to explore how they have developed and altered over time.</p><p>First he tested some assumptions about which aspects of the story alter least as it evolves, indicating their importance. Folklorists believe that what happens in a story is more central to the story than the characters in it – that visiting a relative, only to be met by a scary animal in disguise, is more fundamental than whether the visitor is a little girl or three siblings, or the animal is a tiger instead of a wolf.</p><p>However, Tehrani found no significant difference in the rate of evolution of incidents compared with that of characters. ‘Certain episodes are very stable because they are crucial to the story, but there are lots of other details that can evolve quite freely,’ he says. Neither did his analysis support the theory that the central section of a story is the most conserved part. He found no significant difference in the flexibility of events there compared with the beginning or the end.</p><p>But the really big surprise came when he looked at the cautionary elements of the story. ‘Studies on hunter-gatherer folk tales suggest that these narratives include really important information about the environment and the possible dangers that may be faced there – stuff that’s relevant to survival,’ he says. Yet in his analysis such elements were just as flexible as seemingly trivial details. What, then, is important enough to be reproduced from generation to generation?</p><p>The answer, it would appear, is fear – blood-thirsty and gruesome aspects of the story, such as the eating of the grandmother by the wolf, turned out to be the best preserved of all. Why are these details retained by generations of storytellers, when other features are not? Tehrani has an idea: ‘In an oral context, a story won’t survive because of one great teller.</p><p>It also needs to be interesting when it’s told by someone who’s not necessarily a great storyteller.’ Maybe being swallowed whole by a wolf, then cut out of its stomach alive is so gripping that it helps the story remain popular, no matter how badly it’s told.</p><p>Jack Zipes at the University of Minnesota, Minneapolis, is unconvinced by Tehrani’s views on fairy tales. ‘Even if they’re gruesome, they won’t stick unless they matter,’ he says. He believes the perennial theme of women as victims in stories like Little Red Riding Hood explains why they continue to feel relevant. But Tehrani points out that although this is often the case in Western versions, it is not always true elsewhere.</p><p>In Chinese and Japanese versions, often known as The Tiger Grandmother, the villain is a woman, and in both Iran and Nigeria, the victim is a boy.</p><p>Mathias Clasen at Aarhus University in Denmark isn’t surprised by Tehrani’s findings. ‘Habits and morals change, but the things that scare us, and the fact that we seek out entertainment that’s designed to scare us – those are constant,’ he says. Clasen believes that scary stories teach us what it feels like to be afraid without having to experience real danger, and so build up resistance to negative emotions.</p><p>*Folklorists: those who study traditional stories</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 7,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–7</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "On leaving school, Moore did what his father wanted him to do.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Moore began studying sculpture in his first term at the Leeds School of Art.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "When Moore started at the Royal College of Art, its reputation for teaching sculpture was excellent.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Moore became aware of ancient sculpture as a result of visiting London Museums.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "The Trocadero Museum’s Mayan sculpture attracted a lot of public interest.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Moore thought the Mayan sculpture was similar in certain respects to other stone sculptures.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "The artists who belonged to Unit One wanted to make modern art and architecture more popular.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 8,
        "to": 13,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 8–13</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Moore’s career as an artist</p><p>1930s</p><p>• Moore’s exhibition at the Leicester Galleries is criticised by the press</p><p>• Moore is urged to offer his 8_______  and leave the Royal College.</p><p>1940s</p><p>• Moore turns to drawing because 9_______  for sculpting are not readily available</p><p>• While visiting his hometown, Moore does some drawings of 10_______ </p><p>• Moore is employed to produce a sculpture of a 11_______ </p><p>• 12_______  start to buy Moore’s work</p><p>• Moore’s increased 13_______  makes it possible for him to do more ambitious sculptures</p><p>1950s</p><p>• Moore’s series of bronze figures marks a further change in his style</p>",
        "questions": [
          {
            "number": 8,
            "prompt": "* Moore is urged to offer his 8_______  and leave the Royal College.",
            "options": [],
            "answerKey": "resignation",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "* Moore turns to drawing because 9_______  for sculpting are not readily available",
            "options": [],
            "answerKey": "materials",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "* While visiting his hometown, Moore does some drawings of 10_______ ",
            "options": [],
            "answerKey": "miners",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "* Moore is employed to produce a sculpture of a 11_______ ",
            "options": [],
            "answerKey": "family",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "* 12_______  start to buy Moore’s work",
            "options": [],
            "answerKey": "collectors",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "* Moore’s increased 13_______  makes it possible for him to do more ambitious sculptures",
            "options": [],
            "answerKey": "income",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 20,
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 14–20</h3><p>The Reading Passage has nine paragraphs, A-H</p><p>Choose the correct heading for each section from the list of headings below</p><p>Write the correct number, i-x, in boxes on your answer sheet.</p>",
        "config": {
          "headings": [
            "Getting the finance for production",
            "An unexpected benefit",
            "From initial inspiration to new product",
            "The range of potential customers for the device",
            "What makes the device different from alternatives",
            "Cleaning water from a range of sources",
            "Overcoming production difficulties",
            "Profit not the primary goal",
            "A warm welcome for the device",
            "The number of people affected by water shortages"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "iii",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "v",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "x",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "viii",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "Paragraph G",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 21,
        "to": 26,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 21–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>How the Desolenator works</p><p>The energy required to operate the Desolenator comes from sunlight. The device can be used in different locations, as it has 21_______ . Water is fed into a pipe, and a 22_______  of water flows over a solar panel. The water then enters a boiler, where it turns into steam. Any particles in the water are caught in a 23_______ . The purified water comes out through one tube, and all types of 24_______  come out through another.</p><p>A screen displays the 25_______  of the device, and transmits the information to the company so that they know when the Desolenator requires 26_______ .</p>",
        "questions": [
          {
            "number": 21,
            "prompt": "The energy required to operate the Desolenator comes from sunlight. The device can be used in different locations, as it has 21_______ . Water is fed into a pipe, and a 22_______  of water flows over a solar panel. The water then enters a boiler, where it turns into steam. Any particles in the water are caught in a 23_______ . The purified water comes out through one tube, and all types of 24_______  come out through another.",
            "options": [],
            "answerKey": "wheels",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "The energy required to operate the Desolenator comes from sunlight. The device can be used in different locations, as it has 21_______ . Water is fed into a pipe, and a 22_______  of water flows over a solar panel. The water then enters a boiler, where it turns into steam. Any particles in the water are caught in a 23_______ . The purified water comes out through one tube, and all types of 24_______  come out through another.",
            "options": [],
            "answerKey": "film",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "The energy required to operate the Desolenator comes from sunlight. The device can be used in different locations, as it has 21_______ . Water is fed into a pipe, and a 22_______  of water flows over a solar panel. The water then enters a boiler, where it turns into steam. Any particles in the water are caught in a 23_______ . The purified water comes out through one tube, and all types of 24_______  come out through another.",
            "options": [],
            "answerKey": "filter",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "The energy required to operate the Desolenator comes from sunlight. The device can be used in different locations, as it has 21_______ . Water is fed into a pipe, and a 22_______  of water flows over a solar panel. The water then enters a boiler, where it turns into steam. Any particles in the water are caught in a 23_______ . The purified water comes out through one tube, and all types of 24_______  come out through another.",
            "options": [],
            "answerKey": "waste",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "A screen displays the 25_______  of the device, and transmits the information to the company so that they know when the Desolenator requires 26_______ .",
            "options": [],
            "answerKey": "performance",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "A screen displays the 25_______  of the device, and transmits the information to the company so that they know when the Desolenator requires 26_______ .",
            "options": [],
            "answerKey": "servicing",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "matching",
        "displayType": "sentence-ending",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Complete each sentence with the correct ending, A-F, below.</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
        "config": {
          "sentenceEndings": [
            "may be provided through methods used in biological research.",
            "are the reason for their survival.",
            "show considerable global variation.",
            "contain animals which transform to become humans.",
            "were originally spoken rather than written.",
            "have been developed without factual basis."
          ]
        },
        "questionHtml": "<p>• In fairy tales, details of the plot 27_______ </p><p>• Tehrani rejects the idea that the useful lessons for life in fairy tales 28_______ </p><p>• Various theories about the social significance of fairy tales 29_______ </p><p>• Insights into the development of fairy tales 30_______ </p><p>• All the fairy tales analysed by Tehrani 31_______ </p>",
        "questions": [
          {
            "number": 27,
            "prompt": "• In fairy tales, details of the plot 27_______ ",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "• Tehrani rejects the idea that the useful lessons for life in fairy tales 28_______ ",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "• Various theories about the social significance of fairy tales 29_______ ",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "• Insights into the development of fairy tales 30_______ ",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "• All the fairy tales analysed by Tehrani 31_______ ",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 36,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 32–36</h3><p>Complete the summary using the list of words, A-I, below.</p><p>Write the correct letter, A-I, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "ending",
            "events",
            "warning",
            "links",
            "records",
            "variations",
            "horror",
            "people",
            "plot"
          ]
        },
        "questionHtml": "<p>Phylogenetic analysis of Little Red Riding Hood</p><p>Tehrani used techniques from evolutionary biology to find out if 32_______  existed among 58 stories from around the world. He also wanted to know which aspects of the stories had fewest 33_______ , as he believed these aspects would be the most important ones. Contrary to other beliefs, he found that some 34_______  that were included in a story tended to change over time, and that the middle of a story seemed no more important than the other parts.</p><p>He was also surprised that parts of a story which seemed to provide some sort of 35_______  were unimportant. The aspect that he found most important in a story’s survival was 36_______ </p>",
        "questions": [
          {
            "number": 32,
            "prompt": "Tehrani used techniques from evolutionary biology to find out if 32_______  existed among 58 stories from around the world. He also wanted to know which aspects of the stories had fewest 33_______ , as he believed these aspects would be the most important ones. Contrary to other beliefs, he found that some 34_______  that were included in a story tended to change over time, and that the middle of a story seemed no more important than the other parts.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Tehrani used techniques from evolutionary biology to find out if 32_______  existed among 58 stories from around the world. He also wanted to know which aspects of the stories had fewest 33_______ , as he believed these aspects would be the most important ones. Contrary to other beliefs, he found that some 34_______  that were included in a story tended to change over time, and that the middle of a story seemed no more important than the other parts.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Tehrani used techniques from evolutionary biology to find out if 32_______  existed among 58 stories from around the world. He also wanted to know which aspects of the stories had fewest 33_______ , as he believed these aspects would be the most important ones. Contrary to other beliefs, he found that some 34_______  that were included in a story tended to change over time, and that the middle of a story seemed no more important than the other parts.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "He was also surprised that parts of a story which seemed to provide some sort of 35_______  were unimportant. The aspect that he found most important in a story’s survival was 36_______ ",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "He was also surprised that parts of a story which seemed to provide some sort of 35_______  were unimportant. The aspect that he found most important in a story’s survival was 36_______ ",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 37,
        "to": 40,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "What method did Jamie Tehrani use to test his ideas about fairy tales?",
            "options": [
              "He compared oral and written forms of the same stories.",
              "He looked at many different forms of the same basic story.",
              "He looked at unrelated stories from many different countries.",
              "He contrasted the development of fairy tales with that of living creatures."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "When discussing Tehrani’s views, Jack Zipes suggests that",
            "options": [
              "Tehrani ignores key changes in the role of women.",
              "stories which are too horrific are not always taken seriously.",
              "Tehrani overemphasises the importance of violence in stories.",
              "features of stories only survive if they have a deeper significance."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Why does Tehrani refer to Chinese and Japanese fairy tales?",
            "options": [
              "to indicate that Jack Zipes’ theory is incorrect",
              "to suggest that crime is a global problem",
              "to imply that all fairy tales have a similar meaning",
              "to add more evidence for Jack Zipes’ ideas"
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "What does Mathias Clasen believe about fairy tales?",
            "options": [
              "They are a safe way of learning to deal with fear.",
              "They are a type of entertainment that some people avoid.",
              "They reflect the changing values of our society.",
              "They reduce our ability to deal with real-world problems."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-15-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-15-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "The return of the huarango",
        "contentHtml": "<h2>The return of the huarango</h2><p>The arid valleys of southern Peru are welcoming the return of a native plant</p><p>The south coast of Peru is a narrow, 2,000-kilometre-long strip of desert squeezed between the Andes and the Pacific Ocean. It is also one of the most fragile ecosystems on Earth. It hardly ever rains there, and the only year-round source of water is located tens of metres below the surface. This is why the huarango tree is so suited to life there: it has the longest roots of any tree in the world.</p><p>They stretch down 50-80 metres and, as well as sucking up water for the tree, they bring it into the higher subsoil, creating a water source for other plant life.</p><p>Dr David Beresford-Jones, archaeobotanist at Cambridge University, has been studying the role of the huarango tree in landscape change in the Lower Ica Valley in southern Peru. He believes the huarango was key to the ancient people’s diet and, because it could reach deep water sources, it allowed local people to withstand years of drought when their other crops failed. But over the centuries huarango trees were gradually replaced with crops.</p><p>Cutting down native woodland leads to erosion, as there is nothing to keep the soil in place. So when the huarangos go, the land turns into a desert. Nothing grows at all in the Lower Ica Valley now.</p><p>For centuries the huarango tree was vital to the people of the neighbouring Middle Ica Valley too. They grew vegetables under it and ate products made from its seed pods. Its leaves and bark were used for herbal remedies, while its branches were used for charcoal for cooking and heating, and its trunk was used to build houses. But now it is disappearing rapidly.</p><p>The majority of the huarango forests in the valley have already been cleared for fuel and agriculture – initially, these were smallholdings, but now they’re huge farms producing crops for the international market.</p><p>‘Of the forests that were here 1,000 years ago, 99 per cent have already gone,’ says botanist Oliver Whaley from Kew Gardens in London, who, together with ethnobotanist Dr William Milliken, is running a pioneering project to protect and restore the rapidly disappearing habitat. In order to succeed, Whaley needs to get the local people on board, and that has meant overcoming local prejudices.</p><p>‘Increasingly aspirational communities think that if you plant food trees in your home or street, it shows you are poor, and still need to grow your own food,’ he says. In order to stop the Middle Ica Valley going the same way as the Lower Ica Valley, Whaley is encouraging locals to love the huarangos again. ‘It’s a process of cultural resuscitation,’ he says.</p><p>He has already set up a huarango festival to reinstate a sense of pride in their eco-heritage, and has helped local schoolchildren plant thousands of trees.</p><p>‘In order to get people interested in habitat restoration, you need to plant a tree that is useful to them,’ says Whaley. So, he has been working with local families to attempt to create a sustainable income from the huarangos by turning their products into foodstuffs. ‘Boil up the beans and you get this thick brown syrup like molasses. You can also use it in drinks, soups or stews.’ The pods can be ground into flour to make cakes, and the seeds roasted into a sweet, chocolatey ‘coffee’.</p><p>‘It’s packed full of vitamins and minerals,’ Whaley says.</p><p>And some farmers are already planting huarangos. Alberto Benevides, owner of Ica Valley’s only certified organic farm, which Whaley helped set up, has been planting the tree for 13 years. He produces syrup and flour, and sells these products at an organic farmers’ market in Lima. His farm is relatively small and doesn’t yet provide him with enough to live on, but he hopes this will change. ‘The organic market is growing rapidly in Peru,’ Benevides says. ‘I am investing in the future.’</p><p>But even if Whaley can convince the local people to fall in love with the huarango again, there is still the threat of the larger farms. Some of these cut across the forests and break up the corridors that allow the essential movement of mammals, birds and pollen up and down the narrow forest strip. In the hope of counteracting this, he’s persuading farmers to let him plant forest corridors on their land.</p><p>He believes the extra woodland will also benefit the farms by reducing their water usage through a lowering of evaporation and providing a refuge for bio-control insects.</p><p>‘If we can record biodiversity and see how it all works, then we’re in a good position to move on from there. Desert habitats can reduce down to very little,’ Whaley explains. ‘It’s not like a rainforest that needs to have this huge expanse. Life has always been confined to corridors and islands here.</p><p>If you just have a few trees left, the population can grow up quickly because it’s used to exploiting water when it arrives.’ He sees his project as a model that has the potential to be rolled out across other arid areas around the world. ‘If we can do it here, in the most fragile system on Earth, then that’s a real message of hope for lots of places, including Africa, where there is drought and they just can’t afford to wait for rain.’</p>"
      },
      {
        "section": 2,
        "title": "Silbo Gomero – the whistle ‘language’ of the Canary Islands",
        "contentHtml": "<h2>Silbo Gomero – the whistle ‘language’ of the Canary Islands</h2><p>La Gomera is one of the Canary Islands situated in the Atlantic Ocean off the northwest coast of Africa. This small volcanic island is mountainous, with steep rocky slopes and deep, wooded ravines, rising to 1,487 metres at its highest peak. It is also home to the best known of the world’s whistle ‘languages’, a means of transmitting information over long distances which is perfectly adapted to the extreme terrain of the island.</p><p>This ‘language’, known as ‘Silbo’ or ‘Silbo Gomero’ – from the Spanish word for ‘whistle’ – is now shedding light on the language-processing abilities of the human brain, according to scientists. Researchers say that Silbo activates parts of the brain normally associated with spoken language, suggesting that the brain is remarkably flexible in its ability to interpret sounds as language.</p><p>‘Science has developed the idea of brain areas that are dedicated to language, and we are starting to understand the scope of signals that can be recognised as language,’ says David Corina, co-author of a recent study and associate professor of psychology at the University of Washington in Seattle.</p><p>Silbo is a substitute for Spanish, with individual words recoded into whistles which have high- and low-frequency tones. A whistler – or silbador – puts a finger in his or her mouth to increase the whistle’s pitch, while the other hand can be cupped to adjust the direction of the sound. ‘There is much more ambiguity in the whistled signal than in the spoken signal,’ explains lead researcher Manuel Carreiras, psychology professor at the University of La Laguna on the Canary island of Tenerife.</p><p>Because whistled ‘words’ can be hard to distinguish, silbadores rely on repetition, as well as awareness of context, to make themselves understood.</p><p>The silbadores of Gomera are traditionally shepherds and other isolated mountain folk, and their novel means of staying in touch allows them to communicate over distances of up to 10 kilometres. Carreiras explains that silbadores are able to pass a surprising amount of information via their whistles.</p><p>‘In daily life they use whistles to communicate short commands, but any Spanish sentence could be whistled.’ Silbo has proved particularly useful when fires have occurred on the island and rapid communication across large areas has been vital.</p><p>The study team used neuroimaging equipment to contrast the brain activity of silbadores while listening to whistled and spoken Spanish. Results showed the left temporal lobe of the brain, which is usually associated with spoken language, was engaged during the processing of Silbo. The researchers found that other key regions in the brain’s frontal lobe also responded to the whistles, including those activated in response to sign language among deaf people.</p><p>When the experiments were repeated with non-whistlers, however, activation was observed in all areas of the brain.</p><p>‘Our results provide more evidence about the flexibility of human capacity for language in a variety of forms,’ Corina says. ‘These data suggest that left-hemisphere language regions are uniquely adapted for communicative purposes, independent of the modality of signal. The non-Silbo speakers were not recognising Silbo as a language. They had nothing to grab onto, so multiple areas of their brains were activated.’</p><p>Carreiras says the origins of Silbo Gomero remain obscure, but that indigenous Canary Islanders, who were of North African origin, already had a whistled language when Spain conquered the volcanic islands in the 15th century. Whistled languages survive today in Papua New Guinea, Mexico, Vietnam, Guyana, China, Nepal, Senegal, and a few mountainous pockets in southern Europe. There are thought to be as many as 70 whistled languages still in use, though only 12 have been described and studied scientifically.</p><p>This form of communication is an adaptation found among cultures where people are often isolated from each other, according to Julien Meyer, a researcher at the Institute of Human Sciences in Lyon, France. ‘They are mostly used in mountains or dense forests,’ he says. ‘Whistled languages are quite clearly defined and represent an original adaptation of the spoken language for the needs of isolated human groups.’</p><p>But with modern communication technology now widely available, researchers say whistled languages like Silbo are threatened with extinction. With dwindling numbers of Gomera islanders still fluent in the language, Canaries’ authorities are taking steps to try to ensure its survival. Since 1999, Silbo Gomero has been taught in all of the island’s elementary schools. In addition, locals are seeking assistance from the United Nations Educational, Scientific and Cultural Organization (UNESCO).</p><p>‘The local authorities are trying to get an award from the organisation to declare [Silbo Gomero] as something that should be preserved for humanity,’ Carreiras adds.</p>"
      },
      {
        "section": 3,
        "title": "Environmental practices of big businesses",
        "contentHtml": "<h2>Environmental practices of big businesses</h2><p>The environmental practices of big businesses are shaped by a fundamental fact that for many of us offend our sense of justice. Depending on the circumstances, a business may maximize the amount of money it makes, at least in the short term, by damaging the environment and hurting people.</p><p>That is still the case today for fishermen in an unmanaged fishery without quotas, and for international logging companies with short-term leases on tropical rainforest land in places with corrupt officials and unsophisticated landowners. When government regulation is effective, and when the public is environmentally aware, environmentally clean big businesses may out-compete dirty ones, but the reverse is likely to be true if government regulation is ineffective and if the public doesn’t care.</p><p>It is easy for the rest of us to blame a business for helping itself by hurting other people. But blaming alone is unlikely to produce change. It ignores the fact that businesses are not charities but profit-making companies, and that publicly owned companies with shareholders are under obligation to those shareholders to maximize profits, provided that they do so by legal means.</p><p>US laws make a company’s directors legally liable for something termed ‘breach of fiduciary responsibility’ if they knowingly manage a company in a way that reduces profits. The car manufacturer Henry Ford was in fact successfully sued by shareholders in 1919 for raising the minimum wage of his workers to $5 per day: the courts declared that, while Ford’s humanitarian sentiments about his employees were nice, his business existed to make profits for its stockholders.</p><p>Our blaming of businesses also ignores the ultimate responsibility of the public for creating the condition that let a business profit through destructive environmental policies. In the long run, it is the public, either directly or through its politicians, that has the power to make such destructive policies unprofitable and illegal, and to make sustainable environmental policies profitable.</p><p>The public can do that by suing businesses for harming them, as happened after the Exxon Valdez disaster, in which over 40,000m^{3} of oil were spilled off the coast of Alaska.</p><p>The public may also make their opinion felt by preferring to buy sustainably harvested products; by making employees of companies with poor track records feel ashamed of their company and complain to their own management; by preferring their governments to award valuable contracts to businesses with a good environmental track record; and by pressing their governments to pass and enforce laws and regulations requiring good environmental practices.</p><p>In turn, big businesses can exert powerful pressure on any suppliers that might ignore public or government pressure. For instance, after the US public became concerned about the spread of a disease known as BSE, which was transmitted to humans through infected meat, the US government’s Food and Drug Administration introduced rules demanding that the meat industry abandon practices associated with the risk of the disease spreading.</p><p>But for five years the meat packers refused to follow these, claiming that they would be too expensive to obey. However, when a major fast-food company then made the same demands after customer purchases of its hamburgers plummeted, the meat industry complied within weeks. The public’s task is therefore to identify which links in the supply chain are sensitive to public pressure: for instance, fast-food chains or jewelry stores, but not meat packers or gold miners.</p><p>Some readers may be disappointed or outraged that I place the ultimate responsibility for business practices harming the public on the public itself. I also believe that the public must accept the necessity for higher prices for products to cover the added costs, if any, of sound environmental practices. My views may seem to ignore the belief that businesses should act in accordance with moral principles even if this leads to a reduction in their profits.</p><p>But I think we have to recognize that, throughout human history, in all politically complex human societies, government regulation has arisen precisely because it was found that not only did moral principles need to be made explicit, they also needed to be enforced.</p><p>To me, the conclusion that the public has the ultimate responsibility for the behavior of even the biggest businesses is empowering and hopeful, rather than disappointing. My conclusion is not a moralistic one about who is right or wrong, admirable or selfish, a good guy or a bad guy.</p><p>In the past, businesses have changed when the public came to expect and require different behavior, to reward businesses for behavior that the public wanted, and to make things difficult for businesses practicing behaviors that the public didn’t want. I predict that in the future, just as in the past, changes in public attitudes will be essential for changes in businesses’ environmental practices.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 5,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–5</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answer in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The importance of the huarango tree</p><p>• its roots can extend as far as 80 metres into the soil</p><p>• can access 1_______  deep below the surface</p><p>• was a crucial part of local inhabitants’ 2_______  a long time ago</p><p>• helped people to survive periods of 3_______ </p><p>• prevents 4_______  of the soil</p><p>• prevents land from becoming a 5_______ </p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* can access 1_______  deep below the surface",
            "options": [],
            "answerKey": "water",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* was a crucial part of local inhabitants’ 2_______  a long time ago",
            "options": [],
            "answerKey": "diet",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "* helped people to survive periods of 3_______ ",
            "options": [],
            "answerKey": "drought",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* prevents 4_______  of the soil",
            "options": [],
            "answerKey": "erosion",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* prevents land from becoming a 5_______ ",
            "options": [],
            "answerKey": "desert",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 6,
        "to": 8,
        "type": "fill",
        "displayType": "table-completion",
        "instructionHtml": "<h3>Questions 6–8</h3><p>Complete the table below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Traditional uses of the huarango tree</p><table><tbody><tr><td>Part of tree</td><td>Traditional use</td></tr><tr><td>6_______</td><td>Fuel</td></tr><tr><td>Leaves and 7_______</td><td>Medicine</td></tr><tr><td>8_______</td><td>construction</td></tr></tbody></table>",
        "questions": [
          {
            "number": 6,
            "prompt": "6_______  | Fuel",
            "options": [],
            "answerKey": "branches",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "Leaves and 7_______  | Medicine",
            "options": [],
            "answerKey": "bark",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "8_______  | construction",
            "options": [],
            "answerKey": "trunk",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 9–13</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 9,
            "prompt": "Local families have told Whaley about some traditional uses of huarango products.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Farmer Alberto Benevides is now making a good profit from growing huarangos.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Whaley needs the co-operation of farmers to help preserve the area’s wildlife.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "For Whaley’s project to succeed, it needs to be extended over a very large area.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Whaley has plans to go to Africa to set up a similar project.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 19,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 14–19</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "La Gomera is the most mountainous of all the Canary Islands.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "Silbo is only appropriate for short and simple messages.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "In the brain-activity study, silbadores and non-whistlers produced different results.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "The Spanish introduced Silbo to the islands in the 15th century.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "There is precise data available regarding all of the whistle languages in existence today.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "The children of Gomera now learn Silbo.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 20,
        "to": 26,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 20–26</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Silbo Gomero</p><p>How Silbo is produced</p><p>• high- and low-frequency tones represent different sounds in Spanish 20_______ </p><p>• pitch of whistle is controlled using silbador’s 21_______ </p><p>• 22_______  is changed with a cupped hand</p><p>How Silbo is used</p><p>• has long been used by shepherds and people living in secluded locations</p><p>• in everyday use for the transmission of brief 23_______ </p><p>• can relay essential information quickly, e.g. to inform people about 24_______ </p><p>The future of Silbo</p><p>• future under threat because of new 25_______ </p><p>• Canaries’ authorities hoping to receive a UNESCO 26_______  to help preserve it</p>",
        "questions": [
          {
            "number": 20,
            "prompt": "* high- and low-frequency tones represent different sounds in Spanish 20_______ ",
            "options": [],
            "answerKey": "words",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "* pitch of whistle is controlled using silbador’s 21_______ ",
            "options": [],
            "answerKey": "finger",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "* 22_______  is changed with a cupped hand",
            "options": [],
            "answerKey": "direction",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "* in everyday use for the transmission of brief 23_______ ",
            "options": [],
            "answerKey": "commands",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "* can relay essential information quickly, e.g. to inform people about 24_______ ",
            "options": [],
            "answerKey": "fires",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "* future under threat because of new 25_______ ",
            "options": [],
            "answerKey": "technology",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "* Canaries’ authorities hoping to receive a UNESCO 26_______  to help preserve it",
            "options": [],
            "answerKey": "award",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 31,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Complete the summary using the list of words, A-J, below.</p><p>Write the correct letter, A-J, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "funding",
            "trees",
            "rare species",
            "moral standards",
            "control",
            "involvement",
            "flooding",
            "overfishing",
            "worker support"
          ]
        },
        "questionHtml": "<p>Big businesses</p><p>Many big businesses today are prepared to harm people and the environment in order to make money, and they appear to have no 27_______ . Lack of 28_______  by governments and lack of public 29_______  can lead to environmental problems such as 30_______  or the destruction of 31_______ </p>",
        "questions": [
          {
            "number": 27,
            "prompt": "Many big businesses today are prepared to harm people and the environment in order to make money, and they appear to have no 27_______ . Lack of 28_______  by governments and lack of public 29_______  can lead to environmental problems such as 30_______  or the destruction of 31_______ ",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Many big businesses today are prepared to harm people and the environment in order to make money, and they appear to have no 27_______ . Lack of 28_______  by governments and lack of public 29_______  can lead to environmental problems such as 30_______  or the destruction of 31_______ ",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Many big businesses today are prepared to harm people and the environment in order to make money, and they appear to have no 27_______ . Lack of 28_______  by governments and lack of public 29_______  can lead to environmental problems such as 30_______  or the destruction of 31_______ ",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Many big businesses today are prepared to harm people and the environment in order to make money, and they appear to have no 27_______ . Lack of 28_______  by governments and lack of public 29_______  can lead to environmental problems such as 30_______  or the destruction of 31_______ ",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Many big businesses today are prepared to harm people and the environment in order to make money, and they appear to have no 27_______ . Lack of 28_______  by governments and lack of public 29_______  can lead to environmental problems such as 30_______  or the destruction of 31_______ ",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 34,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 32–34</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 32,
            "prompt": "The main idea of the third paragraph is that environmental damage",
            "options": [
              "requires political action if it is to be stopped.",
              "is the result of ignorance on the part of the public.",
              "could be prevented by the action of ordinary people.",
              "can only be stopped by educating business leaders."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "In the fourth paragraph, the writer describes ways in which the public can",
            "options": [
              "reduce their own individual impact on the environment.",
              "learn more about the impact of business of the environment.",
              "raise awareness of the effects of specific environmental disasters.",
              "influence the environmental policies of businesses and governments."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "What pressure was exerted by big business in the case of the disease BSE?",
            "options": [
              "Meat packers stopped supplying hamburgers to fast-food chains.",
              "A fast-food company forced their meat suppliers to follow the law.",
              "Meat packers persuaded the government to reduce their expenses.",
              "A fast-food company encouraged the government to introduce legislation."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 35,
        "to": 39,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 35–39</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 35,
            "prompt": "The public should be prepared to fund good environmental practices.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "There is a contrast between the moral principles of different businesses.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "It is important to make a clear distinction between acceptable and unacceptable behaviour.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "The public have successfully influenced businesses in the past.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "In the future, businesses will show more concern for the environment.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 40,
        "to": 40,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 40</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in box on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 40,
            "prompt": "What would be the best subheading for this passage?",
            "options": [
              "Will the world survive the threat caused by big businesses?",
              "How can big businesses be encouraged to be less driven by profit?",
              "What environmental dangers are caused by the greed of businesses?",
              "Are big businesses to blame for the damage they cause the environment?"
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  }
]$data$::jsonb)
  loop
    select id into strict exam_id from public.skill_tests where slug = exam_data->>'slug' and skill = 'reading';
    if exam_data->>'slug' = 'cam-11-2' then
      delete from public.skill_questions q using public.skill_question_groups g, public.skill_sections s
      where q.group_id = g.id and g.section_id = s.id and s.test_id = exam_id and s.section_no = 1
        and q.source_number = 14 and q.prompt = '' and q.answer_key = '' and q.question_html = '';
    end if;
    if (select count(*) from public.skill_questions q join public.skill_question_groups g on g.id = q.group_id join public.skill_sections s on s.id = g.section_id where s.test_id = exam_id) <> 40 then
      raise exception 'Expected 40 questions before repair: %', exam_data->>'slug';
    end if;
    update public.skill_questions q set order_index = q.source_number + 100
    from public.skill_question_groups g, public.skill_sections s
    where q.group_id = g.id and g.section_id = s.id and s.test_id = exam_id;
    for section_data in select value from jsonb_array_elements(exam_data->'sections')
    loop
      update public.skill_sections set title = section_data->>'title', content_html = section_data->>'contentHtml'
      where test_id = exam_id and section_no = (section_data->>'section')::integer
      returning id into strict section_id_value;
      group_order := 0;
      for group_data in select value from jsonb_array_elements(exam_data->'groups') where (value->>'section')::integer = (section_data->>'section')::integer
      loop
        group_order := group_order + 1;
        insert into public.skill_question_groups (section_id, order_index, instruction_html, display_type, config)
        values (section_id_value, group_order, group_data->>'instructionHtml', group_data->>'displayType', group_data->'config')
        on conflict (section_id, order_index) do update set instruction_html = excluded.instruction_html, display_type = excluded.display_type, config = excluded.config
        returning id into group_id_value;
        question_order := 0;
        for question_data in select value from jsonb_array_elements(group_data->'questions')
        loop
          question_order := question_order + 1;
          update public.skill_questions q set
            group_id = group_id_value, order_index = question_order,
            question_type = group_data->>'type', display_type = group_data->>'displayType',
            prompt = question_data->>'prompt', options = question_data->'options',
            question_html = case when question_order = 1 then group_data->>'questionHtml' else '' end,
            answer_key = question_data->>'answerKey',
            accepted_answers = array(select jsonb_array_elements_text(question_data->'acceptedAnswers'))
          from public.skill_question_groups old_group
          where old_group.id = q.group_id and old_group.section_id = section_id_value and q.source_number = (question_data->>'number')::integer;
          get diagnostics affected = row_count;
          if affected <> 1 then raise exception 'Expected one question: %/%', exam_data->>'slug', question_data->>'number'; end if;
        end loop;
      end loop;
      delete from public.skill_question_groups g where section_id = section_id_value and not exists (select 1 from public.skill_questions q where q.group_id = g.id);
    end loop;
    if (select count(*) from public.skill_questions q join public.skill_question_groups g on g.id = q.group_id join public.skill_sections s on s.id = g.section_id where s.test_id = exam_id) <> 40 then
      raise exception 'Expected 40 questions after repair: %', exam_data->>'slug';
    end if;
    update public.skill_tests set question_count = 40 where id = exam_id;
  end loop;
end $repair$;
insert into public.schema_migrations (name) values ('024_correct_cambridge_9_3_through_15_4.sql') on conflict do nothing;
commit;
