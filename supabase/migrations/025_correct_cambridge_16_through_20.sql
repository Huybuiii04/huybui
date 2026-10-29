-- Repair 20 Cambridge Academic Reading tests against the source URLs in this manifest.
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
    "slug": "cam-16-1",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-16-academic-reading-test-1/",
    "sections": [
      {
        "section": 1,
        "title": "Why we need to protect polar bears",
        "contentHtml": "<h2>Why we need to protect polar bears</h2><p>Polar bears are being increasingly threatened by the effects of climate change, but their disappearance could have far-reaching consequences. They are uniquely adapted to the extreme conditions of the Arctic Circle, where temperatures can reach —40°C. One reason for this is that they have up to 11 centimetres of fat underneath their skin. Humans with comparative levels of adipose tissue would be considered obese and would be likely to suffer from diabetes and heart disease.</p><p>Yet the polar bear experiences no such consequences.</p><p>A 2014 study by Shi Ping Liu and colleagues sheds light on this mystery. They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears. This allowed them to determine the genes that have allowed polar bears to survive in one of the toughest environments on Earth. Liu and his colleagues found the polar bears had a gene known as APoB, which reduces levels of low-density lipoproteins (LDLs) - a form of 'bad' cholesterol.</p><p>In humans, mutations of this gene are associated with increased risk of heart disease. Polar bears may therefore be an important study model to understand heart disease in humans.</p><p>The genome of the polar bear may also provide the solution for another condition, one that particularly affects our older generation: osteoporosis. This is a disease where bones show reduced density, usually caused by insufficient exercise, reduced calcium intake or food starvation. Bone tissue is constantly being remodelled, meaning that bone is added or removed, depending on nutrient availability and the stress that the bone is under.</p><p>Female polar bears, however, undergo extreme conditions during every pregnancy. Once autumn comes around, these females will dig maternity dens in the snow and will remain there throughout the winter, both before and after the birth of their cubs. This process results in about six months of fasting, where the female bears have to keep themselves and their cubs alive, depleting their own calcium and calorie reserves. Despite this, their bones remain strong and dense.</p><p>Physiologists Alanda Lennox and Allen Goodship found an explanation for this paradox in 2008. They discovered that pregnant bears were able to increase the density of their bones before they started to build their dens. In addition, six months later, when they finally emerged from the den with their cubs, there was no evidence of significant loss of bone density. Hibernating brown bears do not have this capacity and must therefore resort to major bone reformation in the following spring.</p><p>If the mechanism of bone remodelling in polar bears can be understood, many bedridden humans, and even astronauts, could potentially benefit.</p><p>The medical benefits of the polar bear for humanity certainly have their importance in our conservation efforts, but these should not be the only factors taken into consideration. We tend to want to protect animals we think are intelligent and possess emotions, such as elephants and primates. Bears, on the other hand, seem to be perceived as stupid and in many cases violent.</p><p>And yet anecdotal evidence from the field challenges those assumptions, suggesting for example that polar bears have good problem-solving abilities. A male bear called GoGo in Tennoji Zoo, Osaka, has even been observed making use of a tool to manipulate his environment. The bear used a tree branch on multiple occasions to dislodge a piece of meat hung out of his reach. Problem-solving ability has also been witnessed in wild polar bears, although not as obviously as with GoGo.</p><p>A calculated move by a male bear involved running and jumping onto barrels in an attempt to get to a photographer standing on a platform four metres high.</p><p>In other studies, such as one by Alison Annes in 2008, polar bears showed deliberate and focussed manipulation. For example, Annes observed bears putting objects in piles and then knocking them over in what appeared to be a game. The study demonstrates that bears are capable of agile and thought-out behaviours. These examples suggest bears have greater creativity and problem-solving abilities than previously thought.</p><p>As for emotions while the evidence is once again anecdotal, many bears have been seen to hit out at ice and snow — seemingly out of frustration — when they have just missed out on a kill. Moreover, polar bears can form unusual relationships with other species, including playing with the dogs used to pull sleds in the Arctic. Remarkably, one hand-raised polar bear called Agee has formed a close relationship with her owner Mark Dumas to the point where they even swim together.</p><p>This is even more astonishing since polar bears are known to actively hunt humans in the wild.</p><p>If climate change were to lead to their extinction, this would mean not only the loss of potential breakthroughs in human medicine, but more importantly, the disappearance of an intelligent, majestic animal.</p>"
      },
      {
        "section": 2,
        "title": "The Step Pyramid of Djoser",
        "contentHtml": "<h2>The Step Pyramid of Djoser</h2><p><strong>A</strong> The pyramids are the most famous monuments of ancient Egypt and still hold enormous interest for people in the present day. These grand, impressive tributes to the memory of the Egyptian kings have become linked with the country even though other cultures, such as the Chinese and Mayan, also built pyramids. The evolution of the pyramid form has been written and argued about for centuries.</p><p>However, there is no question that, as far as Egypt is concerned, it began with one monument to one king designed by one brilliant architect: the Step Pyramid of Djoser at Saqqara.</p><p><strong>B</strong> Djoser was the first king of the Third Dynasty of Egypt and the first to build in stone. Prior to Djoser’s reign, tombs were rectangular monuments made of dried clay brick, which covered underground passages where the deceased person was buried.</p><p>For reasons which remain unclear, Djoser’s main official, whose name was Imhotep, conceived of building a taller, more impressive tomb for his king by stacking stone slabs on top of one another, progressively making them smaller, to form the shape now known as the Step Pyramid. Djoser is thought to have reigned for 19 years, but some historians and scholars attribute a much longer time for his rule, owing to the number and size of the monuments he built.</p><p><strong>C</strong> The Step Pyramid has been thoroughly examined and investigated over the last century, and it is now known that the building process went through many different stages. Historian Marc Van de Mieroop comments on this, writing ‘Much experimentation was involved, which is especially clear in the construction of the pyramid in the center of the complex.</p><p>It had several plans … before it became the first Step Pyramid in history, piling six levels on top of one another … The weight of the enormous mass was a challenge for the builders, who placed the stones at an inward incline in order to prevent the monument breaking up.’</p><p><strong>D</strong> When finally completed, the Step Pyramid rose 62 meters high and was the tallest structure of its time. The complex in which it was built was the size of a city in ancient Egypt and included a temple, courtyards, shrines, and living quarters for the priests. It covered a region of 16 hectares and was surrounded by a wall 10.5 meters high.</p><p>The wall had 13 false doors cut into it with only one true entrance cut into the south-east corner; the entire wall was then ringed by a trench 750 meters long and 40 meters wide. The false doors and the trench were incorporated into the complex to discourage unwanted visitors. If someone wished to enter, he or she would have needed to know in advance how to find the location of the true opening in the wall.</p><p>Djoser was so proud of his accomplishment that he broke the tradition of having only his own name on the monument and had Imhotep’s name carved on it as well.</p><p><strong>E</strong> The burial chamber of the tomb, where the king’s body was laid to rest, was dug beneath the base of the pyramid, surrounded by a vast maze of long tunnels that had rooms off them to discourage robbers. One of the most mysterious discoveries found inside the pyramid was a large number of stone vessels. Over 40,000 of these vessels, of various forms and shapes, were discovered in storerooms of the pyramid’s underground passages.</p><p>They are inscribed with the names of rulers from the First and Second Dynasties of Egypt and made from different kinds of stone. There is no agreement among scholars and archaeologists on why the vessels were placed in the tomb of Djoser or what they were supposed to represent. The archaeologist Jean-Philippe Lauer, who excavated most of the pyramid and complex, believes they were originally stored and then given a ‘proper burial’ by Djoser in his pyramid to honor his predecessors.</p><p>There are other historians, however, who claim the vessels were dumped into the shafts as yet another attempt to prevent grave robbers from getting to the king’s burial chamber.</p><p><strong>F</strong> Unfortunately, all of the precautions and intricate design of the underground network did not prevent ancient robbers from finding a way in. Djoser’s grave goods, and even his body, were stolen at some point in the past and all archaeologists found were a small number of his valuables overlooked by the thieves. There was enough left throughout the pyramid and its complex, however, to astonish and amaze the archaeologists who excavated it.</p><p><strong>G</strong> Egyptologist Miroslav Verner writes, ‘Few monuments hold a place in human history as significant as that of the Step Pyramid in Saqqara … It can be said without exaggeration that this pyramid complex constitutes a milestone in the evolution of monumental stone architecture in Egypt and in the world as a whole.’ The Step Pyramid was a revolutionary advance in architecture and became the archetype which all the other great pyramid builders of Egypt would follow.</p>"
      },
      {
        "section": 3,
        "title": "The future of work",
        "contentHtml": "<h2>The future of work</h2><p>According to a leading business consultancy, 3—14% of the global workforce will need to switch to a different occupation within the next 10—15 years, and all workers will need to adapt as their occupations evolve alongside increasingly capable machines. Automation — or ‘embodied artificial intelligence (AI) — is one aspect of the disruptive effects of technology on the labour market. ‘Disembodied AI’, like the algorithms running in our smartphones, is another.</p><p>Dr Stella Pachidi from Cambridge Judge Business School believes that some of the most fundamental changes are happening as a result of the ‘algorithmication’ of jobs that are dependent on data rather than on production — the so-called knowledge economy. Algorithms are capable of learning from data to undertake tasks that previously needed human judgement, such as reading legal contracts, analysing medical scans and gathering market intelligence.</p><p>‘In many cases, they can outperform humans,’ says Pachidi. ‘Organisations are attracted to using algorithms because they want to make choices based on what they consider is “perfect information”, as well as to reduce costs and enhance productivity.’</p><p>‘But these enhancements are not without consequences,’ says Pachidi. ‘If routine cognitive tasks are taken over by AI, how do professions develop their future experts?’ she asks. ‘One way of learning about a job is “legitimate peripheral participation”— a novice stands next to experts and learns by observation. If this isn’t happening, then you need to find new ways to learn.’</p><p>Another issue is the extent to which the technology influences or even controls the workforce. For over two years, Pachidi monitored a telecommunications company. ‘The way telecoms salespeople work is through personal and frequent contact with clients, using the benefit of experience to assess a situation and reach a decision. However, the company had started using a[n] … algorithm that defined when account managers should contact certain customers about which kinds of campaigns and what to offer them.’</p><p>The algorithm — usually built by external designers — often becomes the keeper of knowledge, she explains. In cases like this, Pachidi believes, a short-sighted view begins to creep into working practices whereby workers learn through the ‘algorithm’s eyes’ and become dependent on its instructions. Alternative explorations — where experimentation and human instinct lead to progress and new ideas — are effectively discouraged.</p><p>Pachidi and colleagues even observed people developing strategies to make the algorithm work to their own advantage. ‘We are seeing cases where workers feed the algorithm with false data to reach their targets,’ she reports.</p><p>It’s scenarios like these that many researchers are working to avoid. Their objective is to make AI technologies more trustworthy and transparent, so that organisations and individuals understand how AI decisions are made. In the meantime, says Pachidi, ‘We need to make sure we fully understand the dilemmas that this new world raises regarding expertise, occupational boundaries and control.’</p><p>Economist Professor Hamish Low believes that the future of work will involve major transitions across the whole life course for everyone: ‘The traditional trajectory of full-time education followed by full-time work followed by a pensioned retirement is a thing of the past,’ says Low. Instead, he envisages a multistage employment life: one where retraining happens across the life course, and where multiple jobs and no job happen by choice at different stages.</p><p>On the subject of job losses, Low believes the predictions are founded on a fallacy: ‘It assumes that the number of jobs is fixed. If in 30 years, half of 100 jobs are being carried out by robots, that doesn’t mean we are left with just 50 jobs for humans. The number of jobs will increase: we would expect there to be 150 jobs.’</p><p>Dr Ewan McGaughey, at Cambridge’s Centre for Business Research and King’s College London, agrees that ‘apocalyptic’ views about the future of work are misguided. ‘It’s the laws that restrict the supply of capital to the job market, not the advent of new technologies that causes unemployment.’</p><p>His recently published research answers the question of whether automation, AI and robotics will mean a ‘jobless future’ by looking at the causes of unemployment. ‘History is clear that change can mean redundancies. But social policies can tackle this through retraining and redeployment.’</p><p>He adds: ‘If there is going to be change to jobs as a result of AI and robotics then I’d like to see governments seizing the opportunity to improve policy to enforce good job security. We can “reprogramme” the law to prepare for a fairer future of work and leisure.’ McGaughey’s findings are a call to arms to leaders of organisations, governments and banks to pre-empt the coming changes with bold new policies that guarantee full employment, fair incomes and a thriving economic democracy.</p><p>‘The promises of these new technologies are astounding. They deliver humankind the capacity to live in a way that nobody could have once imagined,’ he adds. 'Just as the industrial revolution brought people past subsistence agriculture, and the corporate revolution enabled mass production, a third revolution has been pronounced. But it will not only be one of technology. The next revolution will be social.'</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 7,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–7</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "Polar bears suffer from various health problems due to the build-up of fat under their skin.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "The study done by Liu and his colleagues compared different groups of polar bears.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Liu and colleagues were the first researchers to compare polar bears and brown bears genetically.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Polar bears are able to control their levels of bad cholesterol by genetic means.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Female polar bears are able to survive for about six months without food.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "It was found that the bones of female polar bears were very weak when they came out of their dens in spring.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "The polar bear’s mechanism for increasing bone density could also be used by people one day.",
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
        "instructionHtml": "<h3>Questions 8–13</h3><p>Complete the table below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes 8-13 on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<table><tbody><tr><td><p>Reasons why polar bears should be protected People think of bears as unintelligent and 8_______ . However, this may not be correct. For example:</p><p>• In Tennoji Zoo, a bear has been seen using a branch as a 9_______ . This allowed him to knock down some 10_______ .</p><p>• A wild polar bear worked out a method of reaching a platform where a 11_______  was located.</p><p>• Polar bears have displayed behaviour such as conscious manipulation of objects and activity similar to a 12_______ .</p><p>Bears may also display emotions. For example:</p><p>• They may make movements suggesting 13_______  if disappointed when hunting.</p><p>• They may form relationships with other species.</p></td></tr></tbody></table>",
        "questions": [
          {
            "number": 8,
            "prompt": "Reasons why polar bears should be protected People think of bears as unintelligent and 8_______ . However, this may not be correct. For example:",
            "options": [],
            "answerKey": "violent",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "* In Tennoji Zoo, a bear has been seen using a branch as a 9_______ . This allowed him to knock down some 10_______ .",
            "options": [],
            "answerKey": "tool",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "* In Tennoji Zoo, a bear has been seen using a branch as a 9_______ . This allowed him to knock down some 10_______ .",
            "options": [],
            "answerKey": "meat",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "* A wild polar bear worked out a method of reaching a platform where a 11_______  was located.",
            "options": [],
            "answerKey": "photographer",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "* Polar bears have displayed behaviour such as conscious manipulation of objects and activity similar to a 12_______ .",
            "options": [],
            "answerKey": "game",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "* They may make movements suggesting 13_______  if disappointed when hunting.",
            "options": [],
            "answerKey": "frustration",
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
        "instructionHtml": "<h3>Questions 14–20</h3><p>The Reading Passage has seven paragraphs, A-G.</p><p>Choose the correct heading for paragraphs from the list of headings below.</p><p>Write the correct number, i-ix, in boxes on your answer sheet.</p>",
        "config": {
          "headings": [
            "The areas and artefacts within the pyramid itself",
            "A difficult task for those involved",
            "A king who saved his people",
            "A single certainty among other less definite facts",
            "An overview of the external buildings and areas",
            "A pyramid design that others copied",
            "An idea for changing the design of burial structures",
            "An incredible experience despite the few remains",
            "The answers to some unexpected questions"
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
            "answerKey": "vii",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "ii",
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
            "answerKey": "viii",
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
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 21–24</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The Step Pyramid of Djoser</p><p>The complex that includes the Step Pyramid and its surroundings is considered to be as big as an Egyptian 21_______  of the past. The area outside the pyramid included accommodation that was occupied by 22_______ , along with many other buildings and features.</p><p>A wall ran around the outside of the complex and a number of false entrances were built into this. In addition, a long 23_______  encircled the wall. As a result, any visitors who had not been invited were cleverly prevented from entering the pyramid grounds unless they knew the 24_______  of the real entrance.</p>",
        "questions": [
          {
            "number": 21,
            "prompt": "The complex that includes the Step Pyramid and its surroundings is considered to be as big as an Egyptian 21_______  of the past. The area outside the pyramid included accommodation that was occupied by 22_______ , along with many other buildings and features.",
            "options": [],
            "answerKey": "city",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "The complex that includes the Step Pyramid and its surroundings is considered to be as big as an Egyptian 21_______  of the past. The area outside the pyramid included accommodation that was occupied by 22_______ , along with many other buildings and features.",
            "options": [],
            "answerKey": "priests",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "A wall ran around the outside of the complex and a number of false entrances were built into this. In addition, a long 23_______  encircled the wall. As a result, any visitors who had not been invited were cleverly prevented from entering the pyramid grounds unless they knew the 24_______  of the real entrance.",
            "options": [],
            "answerKey": "trench",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "A wall ran around the outside of the complex and a number of false entrances were built into this. In addition, a long 23_______  encircled the wall. As a result, any visitors who had not been invited were cleverly prevented from entering the pyramid grounds unless they knew the 24_______  of the real entrance.",
            "options": [],
            "answerKey": "location",
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
            "prompt": "Which TWO of the following points does the writer make about King Djoser?",
            "options": [
              "Initially he had to be persuaded to build in stone rather than clay.",
              "There is disagreement concerning the length of his reign.",
              "He failed to appreciate Imhotep’s part in the design of the Step Pyramid.",
              "A few of his possessions were still in his tomb when archaeologists found it.",
              "He criticised the design and construction of other pyramids in Egypt."
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 26,
            "prompt": "Which TWO of the following points does the writer make about King Djoser?",
            "options": [
              "Initially he had to be persuaded to build in stone rather than clay.",
              "There is disagreement concerning the length of his reign.",
              "He failed to appreciate Imhotep’s part in the design of the Step Pyramid.",
              "A few of his possessions were still in his tomb when archaeologists found it.",
              "He criticised the design and construction of other pyramids in Egypt."
            ],
            "answerKey": "D",
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
            "prompt": "The first paragraph tells us about",
            "options": [
              "the kinds of jobs that will be most affected by the growth of AI.",
              "the extent to which AI will after the nature of the work that people do.",
              "the proportion of the world’s labour force who will have jobs in AI in the future.",
              "the difference between ways that embodied and disembodied AI with impact on workers."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "According to the second paragraph, what is Stella Pachidi’s view of the ‘knowledge economy’?",
            "options": [
              "It is having an influence on the number of jobs available.",
              "It is changing people’s attitudes towards their occupations.",
              "It is the main reason why the production sector is declining.",
              "It is a key factor driving current developments in the workplace."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "What did Pachidi observe at the telecommunications company?",
            "options": [
              "staff disagreeing with the recommendations of AI",
              "staff feeling resentful about the intrusion of AI in their work",
              "staff making sure that AI produces the results that they want",
              "staff allowing AI to carry out tasks they ought to do themselves"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "In his recently published research, Ewan McGaughey",
            "options": [
              "challenges the idea that redundancy is a negative thing.",
              "shows the profound effect of mass unemployment on society.",
              "highlights some differences between past and future job losses.",
              "illustrates how changes in the job market can be successfully handled."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 31,
        "to": 34,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 31–34</h3><p>Complete the summary using the list of words, A-G, below.</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "pressure",
            "satisfaction",
            "intuition",
            "promotion",
            "reliance",
            "confidence",
            "information"
          ]
        },
        "questionHtml": "<p>The ‘algorithmication’ of jobs</p><p>Stella Pachidi of Cambridge Judge Business School has been focusing on the ‘algorithmication’ of jobs which rely not on production but on 31_______ .</p><p>While monitoring a telecommunications company, Pachidi observed a growing 32_______  on the recommendations made by AI, as workers begin to learn through the ‘algorithm’s eyes’. Meanwhile, staff are deterred from experimenting and using their own 33_______ , and are therefore prevented from achieving innovation.</p><p>To avoid the kind of situations which Pachidi observed, researchers are trying to make AI’s decision-making process easier to comprehend, and to increase users’ 34_______  with regard to the technology.</p>",
        "questions": [
          {
            "number": 31,
            "prompt": "Stella Pachidi of Cambridge Judge Business School has been focusing on the ‘algorithmication’ of jobs which rely not on production but on 31_______ .",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "While monitoring a telecommunications company, Pachidi observed a growing 32_______  on the recommendations made by AI, as workers begin to learn through the ‘algorithm’s eyes’. Meanwhile, staff are deterred from experimenting and using their own 33_______ , and are therefore prevented from achieving innovation.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "While monitoring a telecommunications company, Pachidi observed a growing 32_______  on the recommendations made by AI, as workers begin to learn through the ‘algorithm’s eyes’. Meanwhile, staff are deterred from experimenting and using their own 33_______ , and are therefore prevented from achieving innovation.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "To avoid the kind of situations which Pachidi observed, researchers are trying to make AI’s decision-making process easier to comprehend, and to increase users’ 34_______  with regard to the technology.",
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
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 35–40</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person, A, B or C.</p><p>Write the correct letter, A, B or C, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Stella Pachidi",
            "Hamish Low",
            "Ewan McGaughey"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 35,
            "prompt": "Greater levels of automation will not result in lower employment.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "There are several reasons why AI is appealing to businesses.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "AI’s potential to transform people’s lives has parallels with major cultural shifts which occurred in previous eras.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "It is important to be aware of the range of problems that AI causes.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "People are going to follow a less conventional career path than in the past.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Authorities should take measures to ensure that there will be adequately paid work for everyone",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-16-2",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-16-academic-reading-test-2/",
    "sections": [
      {
        "section": 1,
        "title": "The White Horse of Uffington",
        "contentHtml": "<h2>The White Horse of Uffington</h2><p>The cutting of huge figures or geoglyphs into the earth of English hillsides has taken place for more than 3,000 years. There are 56 hill figures scattered around England, with the vast majority on the chalk downlands of the country’s southern counties. The figures include giants, horses, crosses and regimental badges. Although the majority of these geoglyphs date within the last 300 years or so, there are one or two that are much older.</p><p>The most famous of these figures is perhaps also the most mysterious — the Uffington White Horse in Oxfordshire. The White Horse has recently been re-dated and shown to be even older than its previously assigned ancient pre-Roman Iron Age date. More controversial is the date of the enigmatic Long Man of Wilmington in Sussex.</p><p>While many historians are convinced the figure is prehistoric, others believe that it was the work of an artistic monk from a nearby priory and was created between the 11th and 15th centuries.</p><p>The method of cutting these huge figures was simply to remove the overlying grass to reveal the gleaming white chalk below. However, the grass would soon grow over the geoglyph again unless it was regularly cleaned or scoured by a fairly large team of people. One reason that the vast majority of hill figures have disappeared is that when the traditions associated with the figures faded, people no longer bothered or remembered to clear away the grass to expose the chalk outline.</p><p>Furthermore, over hundreds of years the outlines would sometimes change due to people not always cutting in exactly the same place, thus creating a different shape to the original geoglyph. The fact that any ancient hill figures survive at all in England today is testament to the strength and continuity of local customs and beliefs which, in one case at least, must stretch back over millennia.</p><p>The Uffington White Horse is a unique, stylised representation of a horse consisting of a long, sleek back, thin disjointed legs, a streaming tail, and a bird-like beaked head. The elegant creature almost melts into the landscape. The horse is situated 2.5 km from Uffington village on a steep slope close to the Late Bronze Age (c. 7th century BCE) hillfort of Uffington Castle and below the Ridgeway, a long-distance Neolithic track.</p><p>The Uffington Horse is also surrounded by Bronze Age burial mounds. It is not far from the Bronze Age cemetery of Lambourn Seven Barrows, which consists of more than 30 well-preserved burial mounds. The carving has been placed in such a way as to make it extremely difficult to see from close quarters, and like many geoglyphs is best appreciated from the air.</p><p>Nevertheless, there are certain areas of the Vale of the White Horse, the valley containing and named after the enigmatic creature, from which an adequate impression may be gained. Indeed on a clear day the carving can be seen from up to 30 km away.</p><p>The earliest evidence of a horse at Uffington is from the 1070s CE when ‘White Horse Hill’ is mentioned in documents from the nearby Abbey of Abingdon, and the first reference to the horse itself is soon after, in 1190 CE. However, the carving is believed to date back much further than that. Due to the similarity of the Uffington White Horse to the stylised depictions of horses on 1st century BCE coins, it had been thought that the creature must also date to that period.</p><p>However, in 1995 Optically Stimulated Luminescence (OSL) testing was carried out by the Oxford Archaeological Unit on soil from two of the lower layers of the horse’s body, and from another cut near the base. The result was a date for the horse’s construction somewhere between 1400 and 600 BCE — in other words, it had a Late Bronze Age or Early Iron Age origin.</p><p>The latter end of this date range would tie the carving of the horse in with occupation of the nearby Uffington hillfort, indicating that it may represent a tribal emblem marking the land of the inhabitants of the hillfort. Alternatively, the carving may have been carried out during a Bronze or Iron Age ritual. Some researchers see the horse as representing the Celtic horse goddess Epona, who was worshipped as a protector of horses, and for her associations with fertility.</p><p>However, the cult of Epona was not imported from Gaul (France) until around the first century CE. This date is at least six centuries after the Uffington Horse was probably carved. Nevertheless, the horse had great ritual and economic significance during the Bronze and Iron Ages, as attested by its depictions on jewellery and other metal objects.</p><p>It is possible that the carving represents a goddess in native mythology, such as Rhiannon, described in later Welsh mythology as a beautiful woman dressed in gold and riding a white horse.</p><p>The fact that geoglyphs can disappear easily, along with their associated rituals and meaning, indicates that they were never intended to be anything more than temporary gestures. But this does not lessen their importance. These giant carvings are a fascinating glimpse into the minds of their creators and how they viewed the landscape in which they lived.</p>"
      },
      {
        "section": 2,
        "title": "I contain multitudes",
        "contentHtml": "<h2>I contain multitudes</h2><p>Wendy Moore reviews Ed Yong’s book about microbes</p><p>Microbes, most of them bacteria, have populated this planet since long before animal life developed and they will outlive us. Invisible to the naked eye, they are ubiquitous. They inhabit the soil, air, rocks and water and are present within every form of life, from seaweed and coral to dogs and humans. And, as Yong explains in his utterly absorbing and hugely important book, we mess with them at our peril.</p><p>Every species has its own colony of microbes, called a ‘microbiome’, and these microbes vary not only between species but also between individuals and within different parts of each individual. What is amazing is that while the number of human cells in the average person is about 30 trillion, the number of microbial ones is higher — about 39 trillion. At best, Yong informs us, we are only 50 per cent human.</p><p>Indeed, some scientists even suggest we should think of each species and its microbes as a single unit, dubbed a ‘holobiont’.</p><p>In each human there are microbes that live only in the stomach, the mouth or the armpit and by and large they do so peacefully. So ‘bad’ microbes are just microbes out of context. Microbes that sit contentedly in the human gut (where there are more microbes than there are stars in the galaxy) can become deadly if they find their way into the bloodstream. These communities are constantly changing too. The right hand shares just one sixth of its microbes with the left hand.</p><p>And, of course, we are surrounded by microbes. Every time we eat, we swallow a million microbes in each gram of food; we are continually swapping microbes with other humans, pets and the world at large.</p><p>It’s a fascinating topic and Yong, a young British science journalist, is an extraordinarily adept guide. Writing with lightness and panache, he has a knack of explaining complex science in terms that are both easy to understand and totally enthralling. Yong is on a mission. Leading us gently by the hand, he takes us into the world of microbes — a bizarre, alien planet — in a bid to persuade us to love them as much as he does. By the end, we do.</p><p>For most of human history we had no idea that microbes existed. The first man to see these extraordinarily potent creatures was a Dutch lens-maker called Antony van Leeuwenhoek in the 1670s. Using microscopes of his own design that could magnify up to 270 times, he examined a drop of water from a nearby lake and found it teeming with tiny creatures he called ‘animalcules’.</p><p>It wasn’t until nearly two hundred years later that the research of French biologist Louis Pasteur indicated that some microbes caused disease. It was Pasteur’s ‘germ theory’ that gave bacteria the poor image that endures today.</p><p>Yong’s book is in many ways a plea for microbial tolerance, pointing out that while fewer than one hundred species of bacteria bring disease, many thousands more play a vital role in maintaining our health. The book also acknowledges that our attitude towards bacteria is not a simple one. We tend to see the dangers posed by bacteria, yet at the same time we are sold yoghurts and drinks that supposedly nurture ‘friendly’ bacteria.</p><p>In reality, says Yong, bacteria should not be viewed as either friends or foes, villains or heroes. Instead we should realise we have a symbiotic relationship, that can be mutually beneficial or mutually destructive.</p><p>What then do these millions of organisms do? The answer is pretty much everything. New research is now unravelling the ways in which bacteria aid digestion, regulate our immune systems, eliminate toxins, produce vitamins, affect our behaviour and even combat obesity. ‘They actually help us become who we are,’ says Yong. But we are facing a growing problem.</p><p>Our obsession with hygiene, our overuse of antibiotics and our unhealthy, low-fibre diets are disrupting the bacterial balance and may be responsible for soaring rates of allergies and immune problems, such as inflammatory bowel disease (IBD).</p><p>The most recent research actually turns accepted norms upside down. For example, there are studies indicating that the excessive use of household detergents and antibacterial products actually destroys the microbes that normally keep the more dangerous germs at bay. Other studies show that keeping a dog as a pet gives children early exposure to a diverse range of bacteria, which may help protect them against allergies later.</p><p>The readers of Yong’s book must be prepared for a decidedly unglamorous world. Among the less appealing case studies is one about a fungus that is wiping out entire populations of frogs and that can be halted by a rare microbial bacterium. Another is about squid that carry luminescent bacteria that protect them against predators. However, if you can overcome your distaste for some of the investigations, the reasons for Yong’s enthusiasm become clear. The microbial world is a place of wonder.</p><p>Already, in an attempt to stop mosquitoes spreading dengue fever — a disease that infects 400 million people a year — mosquitoes are being loaded with a bacterium to block the disease. In the future, our ability to manipulate microbes means we could construct buildings with useful microbes built into their walls to fight off infections. Just imagine a neonatal hospital ward coated in a specially mixed cocktail of microbes so that babies get the best start in life.</p>"
      },
      {
        "section": 3,
        "title": "How to make wise decisions",
        "contentHtml": "<h2>How to make wise decisions</h2><p>Across cultures, wisdom has been considered one of the most revered human qualities. Although the truly wise may seem few and far between, empirical research examining wisdom suggests that it isn’t an exceptional trait possessed by a small handful of bearded philosophers after all — in fact, the latest studies suggest that most of us have the ability to make wise decisions, given the right context.</p><p>‘It appears that experiential, situational, and cultural factors are even more powerful in shaping wisdom than previously imagined,’ says Associate Professor Igor Grossmann of the University of Waterloo in Ontario, Canada. ‘Recent empirical findings from cognitive, developmental, social, and personality psychology cumulatively suggest that people’s ability to reason wisely varies dramatically across experiential and situational contexts.</p><p>Understanding the role of such contextual factors offers unique insights into understanding wisdom in daily life, as well as how it can be enhanced and taught.’</p><p>It seems that it’s not so much that some people simply possess wisdom and others lack it, but that our ability to reason wisely depends on a variety of external factors. ‘It is impossible to characterize thought processes attributed to wisdom without considering the role of contextual factors,’ explains Grossmann. ‘In other words, wisdom is not solely an “inner quality” but rather unfolds as a function of situations people happen to be in. Some situations are more likely to promote wisdom than others.’</p><p>Coming up with a definition of wisdom is challenging, but Grossmann and his colleagues have identified four key characteristics as part of a framework of wise reasoning. One is intellectual humility or recognition of the limits of our own knowledge, and another is appreciation of perspectives wider than the issue at hand. Sensitivity to the possibility of change in social relations is also key, along with compromise or integration of different attitudes and beliefs.</p><p>Grossmann and his colleagues have also found that one of the most reliable ways to support wisdom in our own day-to-day decisions is to look at scenarios from a third-party perspective, as though giving advice to a friend. Research suggests that when adopting a first-person viewpoint we focus on ‘the focal features of the environment’ and when we adopt a third-person, ‘observer’ viewpoint we reason more broadly and focus more on interpersonal and moral ideals such as justice and impartiality.</p><p>Looking at problems from this more expansive viewpoint appears to foster cognitive processes related to wise decisions.</p><p>What are we to do, then, when confronted with situations like a disagreement with a spouse or negotiating a contract at work, that require us to take a personal stake? Grossmann argues that even when we aren’t able to change the situation, we can still evaluate these experiences from different perspectives.</p><p>For example, in one experiment that took place during the peak of a recent economic recession, graduating college seniors were asked to reflect on their job prospects. The students were instructed to imagine their career either ‘as if you were a distant observer’ or ‘before your own eyes as if you were right there’.</p><p>Participants in the group assigned to the ‘distant observer’ role displayed more wisdom-related reasoning (intellectual humility and recognition of change) than did participants in the control group.</p><p>In another study, couples in long-term romantic relationships were instructed to visualize an unresolved relationship conflict either through the eyes of an outsider or from their own perspective. Participants then discussed the incident with their partner for 10 minutes, after which they wrote down their thoughts about it.</p><p>Couples in the ‘other’s eyes’ condition were significantly more likely to rely on wise reasoning — recognizing others’ perspectives and searching for a compromise — compared to the couples in the egocentric condition.</p><p>‘Ego-decentering promotes greater focus on others and enables a bigger picture, conceptual view of the experience, affording recognition of intellectual humility and change,’ says Grossmann.</p><p>We might associate wisdom with intelligence or particular personality traits, but research shows only a small positive relationship between wise thinking and crystallized intelligence and the personality traits of openness and agreeableness.</p><p>‘It is remarkable how much people can vary in their wisdom from one situation to the next, and how much stronger such contextual effects are for understanding the relationship between wise judgment and its social and affective outcomes as compared to the generalized “traits”,’ Grossmann explains.</p><p>‘That is, knowing how wisely a person behaves in a given situation is more informative for understanding their emotions or likelihood to forgive [or] retaliate as compared to knowing whether the person may be wise “in general”.</p>"
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
            "prompt": "Most geoglyphs in England are located in a particular area of the country.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "There are more geoglyphs in the shape of a horse than any other creature.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "A recent dating of the Uffington White Horse indicates that people were mistaken about its age.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Historians have come to an agreement about the origins of the Long Man of Wilmington.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Geoglyphs were created by people placing white chalk on the hillside.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Many geoglyphs in England are no longer visible.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "The shape of some geoglyphs has been altered over time.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "The fame of the Uffington White Horse is due to its size.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 13,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 9–13</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The Uffington White Horse</p><p>The location of the Uffington White Horse:</p><p>• a distance of 2.5 km from Uffington village</p><p>• near an ancient road known as the 9_______ </p><p>• close to an ancient cemetery that has a number of burial mounds</p><p>Dating the Uffington White Horse:</p><p>• first reference to White Horse Hill appears in 10_______  from the 1070s</p><p>• horses shown on coins from the period 100 BCE – 1 BCE are similar in appearance</p><p>• according to analysis of the surrounding 11_______ , the Horse is Late Bronze Age / Early Iron Age</p><p>Possible reasons for creation of the Uffington White Horse:</p><p>• an emblem to indicate land ownership</p><p>• formed part of an ancient ritual</p><p>• was a representation of goddess Epona – associated with protection of horses and 12_______ </p><p>• was a representation of a Welsh goddess called 13_______ </p>",
        "questions": [
          {
            "number": 9,
            "prompt": "* near an ancient road known as the 9_______ ",
            "options": [],
            "answerKey": "Ridgeway",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "* first reference to White Horse Hill appears in 10_______  from the 1070s",
            "options": [],
            "answerKey": "documents",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "* according to analysis of the surrounding 11_______ , the Horse is Late Bronze Age / Early Iron Age",
            "options": [],
            "answerKey": "soil",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "* was a representation of goddess Epona – associated with protection of horses and 12_______ ",
            "options": [],
            "answerKey": "fertility",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "* was a representation of a Welsh goddess called 13_______ ",
            "options": [],
            "answerKey": "Rhiannon",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 16,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 14–16</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "What point does the writer make about microbes in the first paragraph?",
            "options": [
              "They adapt quickly to their environment.",
              "The risk they pose has been exaggerated.",
              "They are more plentiful in animal life than plant life.",
              "They will continue to exist for longer than the human race."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "In the second paragraph, the writer is impressed by the fact that",
            "options": [
              "each species tends to have vastly different microbes.",
              "some parts of the body contain relatively few microbes.",
              "the average individual has more microbial cells than human ones.",
              "scientists have limited understanding of how microbial cells behave."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "What is the writer doing in the fifth paragraph?",
            "options": [
              "explaining how a discovery was made",
              "comparing scientists’ theories about microbes",
              "describing confusion among scientists",
              "giving details of how microbes cause disease"
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 17,
        "to": 20,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 17–20</h3><p>Complete the summary using the list of words, A-H, below.</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "solution",
            "partnership",
            "destruction",
            "exaggeration",
            "cleanliness",
            "regulations",
            "illness",
            "nutrition"
          ]
        },
        "questionHtml": "<p>We should be more tolerant of microbes</p><p>Yong’s book argues that we should be more tolerant of microbes. Many have a beneficial effect, and only a relatively small number lead to 17_______ . And although it is misleading to think of microbes as ‘friendly’, we should also stop thinking of them as the enemy. In fact, we should accept that our relationship with microbes is one based on 18_______ .</p><p>New research shows that microbes have numerous benefits for humans. Amongst other things, they aid digestion, remove poisons, produce vitamins and may even help reduce obesity. However, there is a growing problem. Our poor 19_______ , our overuse of antibiotics, and our excessive focus on 20_______  are upsetting the bacterial balance and may be contributing to the huge increase in allergies and immune system problems.</p>",
        "questions": [
          {
            "number": 17,
            "prompt": "Yong’s book argues that we should be more tolerant of microbes. Many have a beneficial effect, and only a relatively small number lead to 17_______ . And although it is misleading to think of microbes as ‘friendly’, we should also stop thinking of them as the enemy. In fact, we should accept that our relationship with microbes is one based on 18_______ .",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "Yong’s book argues that we should be more tolerant of microbes. Many have a beneficial effect, and only a relatively small number lead to 17_______ . And although it is misleading to think of microbes as ‘friendly’, we should also stop thinking of them as the enemy. In fact, we should accept that our relationship with microbes is one based on 18_______ .",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "New research shows that microbes have numerous benefits for humans. Amongst other things, they aid digestion, remove poisons, produce vitamins and may even help reduce obesity. However, there is a growing problem. Our poor 19_______ , our overuse of antibiotics, and our excessive focus on 20_______  are upsetting the bacterial balance and may be contributing to the huge increase in allergies and immune system problems.",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "New research shows that microbes have numerous benefits for humans. Amongst other things, they aid digestion, remove poisons, produce vitamins and may even help reduce obesity. However, there is a growing problem. Our poor 19_______ , our overuse of antibiotics, and our excessive focus on 20_______  are upsetting the bacterial balance and may be contributing to the huge increase in allergies and immune system problems.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 21,
        "to": 26,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 21–26</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 21,
            "prompt": "It is possible that using antibacterial products in the home fails to have the desired effect.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "It is a good idea to ensure that children come into contact with as few bacteria as possible.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "Yong’s book contains more cause studies than are necessary.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "The case study about bacteria that prevent squid from being attacked may have limited appeal.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "Efforts to control dengue fever have been surprisingly successful",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "Microbes that reduce the risk of infection have already been put inside the walls of some hospital wards.",
            "options": [],
            "answerKey": "NO",
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
            "prompt": "What point does the writer make in the first paragraph?",
            "options": [
              "Wisdom appears to be unique to the human race.",
              "A basic assumption about wisdom may be wrong.",
              "Concepts of wisdom may depend on the society we belong to.",
              "There is still much to be discovered about the nature of wisdom."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "What does Igor Grossmann suggest about the ability to make wise decisions?",
            "options": [
              "It can vary greatly from one person to another.",
              "Earlier research into it was based on unreliable data.",
              "The importance of certain influences on it was underestimated.",
              "Various branches of psychology define it according to their own criteria."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "According to the third paragraph, Grossmann claims that the level of wisdom an individual shows",
            "options": [
              "can be greater than they think it is.",
              "will be different in different circumstances.",
              "may be determined by particular aspects of their personality.",
              "should develop over time as a result of their life experiences."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "What is described in the fifth paragraph?",
            "options": [
              "a difficulty encountered when attempting to reason wisely",
              "an example of the type of person who is likely to reason wisely",
              "a controversial view about the benefits of reasoning wisely",
              "a recommended strategy that can help people to reason wisely"
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 31,
        "to": 35,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 31–35</h3><p>Complete the summary using the list of words, A-J, below.</p><p>Write the correct letter, A-J, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "opinions",
            "confidence",
            "view",
            "modesty",
            "problems",
            "objectivity",
            "fairness",
            "experiences",
            "range",
            "reasons"
          ]
        },
        "questionHtml": "<p>The characteristics of wise reasoning</p><p>Igor Grossmann and colleagues have established four characteristics which enable us to make wise decisions. It is important to have a certain degree of 31_______  regarding the extent of our knowledge, and to take into account 32_______  which may not be the same as our own. We should also be able to take a broad 33_______  of any situation.</p><p>Another key characteristic is being aware of the likelihood of alterations in the way that people relate to each other.</p><p>Grossmann also believes that it is better to regard scenarios with 34_______ . By avoiding the first-person perspective, we focus more on 35_______  and on other moral ideals, which in turn leads to wiser decision-making.</p>",
        "questions": [
          {
            "number": 31,
            "prompt": "Igor Grossmann and colleagues have established four characteristics which enable us to make wise decisions. It is important to have a certain degree of 31_______  regarding the extent of our knowledge, and to take into account 32_______  which may not be the same as our own. We should also be able to take a broad 33_______  of any situation.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "Igor Grossmann and colleagues have established four characteristics which enable us to make wise decisions. It is important to have a certain degree of 31_______  regarding the extent of our knowledge, and to take into account 32_______  which may not be the same as our own. We should also be able to take a broad 33_______  of any situation.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Igor Grossmann and colleagues have established four characteristics which enable us to make wise decisions. It is important to have a certain degree of 31_______  regarding the extent of our knowledge, and to take into account 32_______  which may not be the same as our own. We should also be able to take a broad 33_______  of any situation.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Grossmann also believes that it is better to regard scenarios with 34_______ . By avoiding the first-person perspective, we focus more on 35_______  and on other moral ideals, which in turn leads to wiser decision-making.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Grossmann also believes that it is better to regard scenarios with 34_______ . By avoiding the first-person perspective, we focus more on 35_______  and on other moral ideals, which in turn leads to wiser decision-making.",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 36,
        "to": 40,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 36–40</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 36,
            "prompt": "Students participating in the job prospects experiment could choose one of two perspectives to take.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Participants in the couples experiment were aware that they were taking part in a study about wise reasoning.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "In the couples experiments, the length of the couples’ relationships had an impact on the results.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "In both experiments, the participants who looked at the situation from a more detached viewpoint tended to make wiser decisions.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Grossmann believes that a person’s wisdom is determined by their intelligence to only a very limited extent.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-16-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-16-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "Roman shipbuilding and navigation",
        "contentHtml": "<h2>Roman shipbuilding and navigation</h2><p>Shipbuilding today is based on science and ships are built using computers and sophisticated tools. Shipbuilding in ancient Rome, however, was more of an art relying on estimation, inherited techniques and personal experience. The Romans were not traditionally sailors but mostly land- based people, who learned to build ships from the people that they conquered, namely the Greeks and the Egyptians.</p><p>There are a few surviving written documents that give descriptions and representations of ancient Roman ships, including the sails and rigging. Excavated vessels also provide some clues about ancient shipbuilding techniques. Studies of these have taught us that ancient Roman shipbuilders built the outer hull first, then proceeded with the frame and the rest of the ship. Planks used to build the outer hull were initially sewn together.</p><p>Starting from the 6th century BCE, they were fixed using a method called mortise and tenon, whereby one plank locked into another without the need for stitching. Then in the first centuries of the current era, Mediterranean shipbuilders shifted to another shipbuilding method, still in use today, which consisted of building the frame first and then proceeding with the hull and the other components of the ship. This method was more systematic and dramatically shortened ship construction times.</p><p>The ancient Romans built large merchant ships and warships whose size and technology were unequalled until the 16th century CE.</p><p>Warships were built to be lightweight and very speedy. They had to be able to sail near the coast, which is why they had no ballast or excess load and were built with a long, narrow hull. They did not sink when damaged and often would lie crippled on the sea’s surface following naval battles. They had a bronze battering ram, which was used to pierce the timber hulls or break the oars of enemy vessels. Warships used both wind (sails) and human power (oarsmen) and were therefore very fast.</p><p>Eventually, Rome’s navy became the largest and most powerful in the Mediterranean, and the Romans had control over what they therefore called Mare Nostrum meaning ‘our sea’.</p><p>There were many kinds of warship. The ‘trireme' was the dominant warship from the 7th to 4th century BCE. It had rowers in the top, middle and lower levels, and approximately 50 rowers in each bank. The rowers at the bottom had the most uncomfortable position as they were under the other rowers and were exposed to the water entering through the oar-holes. It is worth noting that contrary to popular perception, rowers were not slaves but mostly Roman citizens enrolled in the military.</p><p>The trireme was superseded by larger ships with even more rowers.</p><p>Merchant ships were built to transport lots of cargo over long distances and at a reasonable cost. They had a wider hull, double planting and a solid interior for added stability. Unlike warships, their V-shaped hull was deep underwater, meaning that they could not sail too close to the coast. They usually had two huge side rudders located off the stern and controlled by a small tiller bar connected to a system of cables.</p><p>They had from one to three masts with large square sails and a small triangular sail at the bow. Just like warships, merchant ships used oarsmen, but coordinating the hundreds of rowers in both types of ship was not an easy task. In order to assist them, music would be played on an instrument, and oars would then keep time with this.</p><p>The cargo on merchant ships included raw materials (e.g. iron bars, copper, marble and granite), and agricultural products (e.g. grain from Egypt’s Nile valley). During the Empire, Rome was a huge city by ancient standards of about one million inhabitants. Goods from all over the world would come to the city through the port of Pozzuoli situated west of the bay of Naples in Italy and through the gigantic port of Ostia situated at the mouth of the Tiber River.</p><p>Large merchant ships would approach the destination port and, just like today, be intercepted by a number of towboats that would drag them to the quay.</p><p>The time of travel along the many sailing routes could vary widely. Navigation in ancient Rome did not rely on sophisticated instruments such as compasses but on experience, local knowledge and observation of natural phenomena. In conditions of good visibility, seamen in the Mediterranean often had the mainland or islands in sight, which greatly facilitated navigation. They sailed by noting their position relative to a succession of recognisable landmarks.</p><p>When weather conditions were not good or where land was no longer visible, Roman mariners estimated directions from the pole star or, with less accuracy, from the Sun at noon. They also estimated directions relative to the wind and swell. Overall, shipping in ancient Roman times resembled shipping today with large vessels regularly crossing the seas and bringing supplies from their Empire.</p>"
      },
      {
        "section": 2,
        "title": "Climate change reveals ancient artefacts in Norway’s glaciers",
        "contentHtml": "<h2>Climate change reveals ancient artefacts in Norway’s glaciers</h2><p><strong>A</strong> Well above the treeline in Norway’s highest mountains, ancient fields of ice are shrinking as Earth’s climate warms. As the ice has vanished, it has been giving up the treasures it has preserved in cold storage for the last 6,000 years — items such as ancient arrows and skis from Viking Age* traders. And those artefacts have provided archaeologists with some surprising insights into how ancient Norwegians made their livings.</p><p><strong>B</strong> Organic materials like textiles and hides are relatively rare finds at archaeological sites. This is because unless they’re protected from the microorganisms that cause decay, they tend not to last long. Extreme cold is one reliable way to keep artefacts relatively fresh for a few thousand years, but once thawed out, these materials experience degradation relatively swiftly.</p><p>With climate change shrinking ice cover around the world, glacial archaeologists need to race the clock to find newly revealed artefacts, preserve them, and study them. If something fragile dries and is windblown it might very soon be lost to science, or an arrow might be exposed and then covered again by the next snow and remain well-preserved. The unpredictability means that glacial archaeologists have to be systematic in their approach to fieldwork.</p><p><strong>C</strong> Over a nine-year period, a team of archaeologists, which included Lars Pilo of Oppland County Council, Norway, and James Barrett of the McDonald Institute for Archaeological Research, surveyed patches of ice in Oppland, an area of south-central Norway that is home to some of the country’s highest mountains. Reindeer once congregated on these icy patches in the later summer months to escape biting insects, and from the late Stone Age**, hunters followed.</p><p>In addition, trade routes threaded through the mountain passes of Oppland, linking settlements in Norway to the rest of Europe.</p><p>The slow but steady movement of glaciers tends to destroy anything at their bases, so the team focused on stationary patches of ice, mostly above 1,400 metres. That ice is found amid fields of frost-weathered boulders, fallen rocks, and exposed bedrock that for nine months of the year is buried beneath snow.</p><p>‘Fieldwork is hard work — hiking with all our equipment, often camping on permafrost — but very rewarding. You’re rescuing the archaeology, bringing the melting ice to wider attention, discovering a unique environmental history and really connecting with the natural environment,’ says Barrett.</p><p><strong>D</strong> At the edges of the contracting ice patches, archaeologists found more than 2,000 artefacts, which formed a material record that ran from 4,000 BCE to the beginnings of the Renaissance in the 14th century. Many of the artefacts are associated with hunting. Hunters would have easily misplaced arrows and they often discarded broken bows rather than take them all the way home.</p><p>Other items could have been used by hunters traversing the high mountain passes of Oppland: all-purpose items like tools, skis, and horse tack.</p><p><strong>E</strong> Barrett’s team radiocarbon-dated 153 of the artefacts and compared those dates to the timing of major environmental changes in the region — such as periods of cooling or warming — and major social and economic shifts — such as the growth of farming settlements and the spread of international trade networks leading up to the Viking Age. They found that some periods had produced lots of artefacts, which indicates that people had been pretty active in the mountains during those times.</p><p>But there were few or no signs of activity during other periods.</p><p><strong>F</strong> What was surprising, according to Barrett, was the timing of these periods. Oppland’s mountains present daunting terrain and in periods of extreme cold, glaciers could block the higher mountain passes and make travel in the upper reaches of the mountains extremely difficult. Archaeologists assumed people would stick to lower elevations during a time like the Late Antique Little Ice Age, a short period of deeper-than-usual cold from about 536-600 CE.</p><p>But it turned out that hunters kept regularly venturing into the mountains even when the climate turned cold, based on the amount of stuff they had apparently dropped there.</p><p>‘Remarkably, though, the finds from the ice may have continued through this period, perhaps suggesting that the importance of mountain hunting increased to supplement failing agricultural harvests in times of low temperatures,’ says Barrett. A colder turn in the Scandinavian climate would likely have meant widespread crop failures, so more people would have depended on hunting to make up for those losses.</p><p><strong>G</strong> Many of the artefacts Barrett’s team recovered date from the beginning of the Viking Age, the 700s through to the 900s CE. Trade networks connecting Scandinavia with Europe and the Middle East were expanding around this time. Although we usually think of ships when we think of Scandinavian expansion, these recent discoveries show that plenty of goods travelled on overland routes, like the mountain passes of Oppland.</p><p>And growing Norwegian towns, along with export markets, would have created a booming demand for hides to fight off the cold, as well as antlers to make useful things like combs. Business must have been good for hunters.</p><p><strong>H</strong> Norway’s mountains are probably still hiding a lot of history — and prehistory — in remote ice patches. When Barrett’s team looked at the dates for their sample of 153 artefacts, they noticed a gap with almost no artefacts from about 3,800 to 2,200 BCE. In fact, archaeological finds from that period are rare all over Norway. The researchers say that could be because many of those artefacts have already disintegrated or are still frozen in the ice.</p><p>That means archaeologists could be extracting some of those artefacts from retreating ice in years to come.</p>"
      },
      {
        "section": 3,
        "title": "Plant ‘thermometer’ triggers springtime growth by measuring night-time heat",
        "contentHtml": "<h2>Plant ‘thermometer’ triggers springtime growth by measuring night-time heat</h2><p>A photoreceptor molecule in plant cells has been found to have a second job as a thermometer after dark – allowing plants to read seasonal temperature changes. Scientists say the discovery could help breed crops that are more resilient to the temperatures expected to result from climate change.</p><p><strong>A</strong> An international team of scientists led by the University of Cambridge has discovered that the ‘thermometer’ molecule in plants enables them to develop according to seasonal temperature changes. Researchers have revealed that molecules called phytochromes — used by plants to detect light during the day actually change their function in darkness to become cellular temperature gauges that measure the heat of the night.</p><p>The new findings, published in the journal Science, show that phytochromes control genetic switches in response to temperature as well as light to dictate plant development.</p><p><strong>B</strong> At night, these molecules change states, and the pace at which they change is ‘directly proportional to temperature’, say scientists, who compare phytochromes to mercury in a thermometer. The warmer it is, the faster the molecular change — stimulating plant growth.</p><p><strong>C</strong> Farmers and gardeners have known for hundreds of years how responsive plants are to temperature: warm winters cause many trees and flowers to bud early, something humans have long used to predict weather and harvest times for the coming year. The latest research pinpoints for the first time a molecular mechanism in plants that reacts to temperature — often triggering the buds of spring we long to see at the end of winter.</p><p><strong>D</strong> With weather and temperatures set to become ever more unpredictable due to climate change, researchers say the discovery that this light-sensing molecule also functions as the internal thermometer in plant cells could help us breed tougher crops. ‘It is estimated that agricultural yields will need to double by 2050, but climate change is a major threat to achieving this. Key crops such as wheat and rice are sensitive to high temperatures.</p><p>Thermal stress reduces crop yields by around 10% for every one degree increase in temperature,’ says lead researcher Dr Philip Wigge from Cambridge’s Sainsbury Laboratory. ‘Discovering the molecules that allow plants to sense temperature has the potential to accelerate the breeding of crops resilient to thermal stress and climate change.’</p><p><strong>E</strong> In their active state, phytochrome molecules bind themselves to DNA to restrict plant growth. During the day, sunlight activates the molecules, slowing down growth. If a plant finds itself in shade, phytochromes are quickly inactivated — enabling it to grow faster to find sunlight again. This is how plants compete to escape each other’s shade. ‘Light-driven changes to phytochrome activity occur very fast, in less than a second,’ says Wigge.</p><p>At night, however, it’s a different story. Instead of a rapid deactivation following sundown, the molecules gradually change from their active to inactive state. This is called ‘dark reversion’. ‘Just as mercury rises in a thermometer, the rate at which phytochromes revert to their inactive state during the night is a direct measure of temperature,’ says Wigge.</p><p><strong>F</strong> ‘The lower the temperature, the slower the rate at which phytochromes revert to inactivity, so the molecules spend more time in their active, growth-suppressing state. This is why plants are slower to grow in winter.</p><p>Warm temperatures accelerate dark reversion, so that phytochromes rapidly reach an inactive state and detach themselves from the plant’s DNA — allowing genes to be expressed and plant growth to resume.’ Wigge believes phytochrome thermo-sensing evolved at a later stage, and co-opted the biological network already used for light-based growth during the downtime of night.</p><p><strong>G</strong> Some plants mainly use day length as an indicator of the season. Other species, such as daffodils, have considerable temperature sensitivity, and can flower months in advance during a warm winter. In fact, the discovery of the dual role of phytochromes provides the science behind a well-known rhyme long used to predict the coming season: oak before ash we’ll have a splash, ash before oak we’re in for a soak.</p><p>Wigge explains: ‘Oak trees rely much more on temperature, likely using phytochromes as thermometers to dictate development, whereas ash trees rely on measuring day length to determine their seasonal timing. A warmer spring, and consequently a higher likeliness of a hot summer, will result in oak leafing before ash. A cold spring will see the opposite. As the British know only too well, a colder summer is likely to be a rain-soaked one.’</p><p><strong>H</strong> The new findings are the culmination of twelve years of research involving scientists from Germany, Argentina and the US, as well as the Cambridge team. The work was done in a model system, using a mustard plant called Arabidopsis, but Wigge says the phytochrome genes necessary for temperature sensing are found in crop plants as well.</p><p>‘Recent advances in plant genetics now mean that scientists are able to rapidly identify the genes controlling these processes in crop plants, and even alter their activity using precise molecular “scalpels”,’ adds Wigge. ‘Cambridge is uniquely well-positioned to do this kind of research as we have outstanding collaborators nearby who work on more applied aspects of plant biology, and can help us transfer this new knowledge into the field.’</p>"
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
            "prompt": "The Romans’ shipbuilding skills were passed on to the Greeks and the Egyptians.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Skilled craftsmen were needed for the mortise and tenon method of fixing planks.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "The later practice used by Mediterranean shipbuilders involved building the hull before the frame.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "The Romans called the Mediterranean Sea Mare Nostrum because they dominated its use.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Most rowers on ships were people from the Roman army.",
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
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 6–13</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Warships and merchant ships</p><p>Warships were designed so that they were 6_______  and moved quickly. They often remained afloat after battles and were able to sail close to land as they lacked any additional weight. A battering ram made of 7_______  was included in the design for attacking and damaging the timber and oars of enemy ships. Warships, such as the ‘trireme’, had rowers on three different 8_______  .</p><p>Unlike warships, merchant ships had a broad 9_______  that lay far below the surface of the sea. Merchant ships were steered through the water with the help of large rudders and a tiller bar. They had both square and 10_______  sails. On merchant ships and warships, 11_______  was used to ensure rowers moved their oars in and out of the water at the same time.</p><p>Quantities of agricultural goods such as 12_______  were transported by merchant ships to two main ports in Italy. The ships were pulled to the shore by 13_______ . When the weather was clear and they could see islands or land, sailors used landmarks that they knew to help them navigate their route.</p>",
        "questions": [
          {
            "number": 6,
            "prompt": "Warships were designed so that they were 6_______  and moved quickly. They often remained afloat after battles and were able to sail close to land as they lacked any additional weight. A battering ram made of 7_______  was included in the design for attacking and damaging the timber and oars of enemy ships. Warships, such as the ‘trireme’, had rowers on three different 8_______  .",
            "options": [],
            "answerKey": "lightweight",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "Warships were designed so that they were 6_______  and moved quickly. They often remained afloat after battles and were able to sail close to land as they lacked any additional weight. A battering ram made of 7_______  was included in the design for attacking and damaging the timber and oars of enemy ships. Warships, such as the ‘trireme’, had rowers on three different 8_______  .",
            "options": [],
            "answerKey": "bronze",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Warships were designed so that they were 6_______  and moved quickly. They often remained afloat after battles and were able to sail close to land as they lacked any additional weight. A battering ram made of 7_______  was included in the design for attacking and damaging the timber and oars of enemy ships. Warships, such as the ‘trireme’, had rowers on three different 8_______  .",
            "options": [],
            "answerKey": "levels",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "Unlike warships, merchant ships had a broad 9_______  that lay far below the surface of the sea. Merchant ships were steered through the water with the help of large rudders and a tiller bar. They had both square and 10_______  sails. On merchant ships and warships, 11_______  was used to ensure rowers moved their oars in and out of the water at the same time.",
            "options": [],
            "answerKey": "hull",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Unlike warships, merchant ships had a broad 9_______  that lay far below the surface of the sea. Merchant ships were steered through the water with the help of large rudders and a tiller bar. They had both square and 10_______  sails. On merchant ships and warships, 11_______  was used to ensure rowers moved their oars in and out of the water at the same time.",
            "options": [],
            "answerKey": "triangular",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Unlike warships, merchant ships had a broad 9_______  that lay far below the surface of the sea. Merchant ships were steered through the water with the help of large rudders and a tiller bar. They had both square and 10_______  sails. On merchant ships and warships, 11_______  was used to ensure rowers moved their oars in and out of the water at the same time.",
            "options": [],
            "answerKey": "music",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Quantities of agricultural goods such as 12_______  were transported by merchant ships to two main ports in Italy. The ships were pulled to the shore by 13_______ . When the weather was clear and they could see islands or land, sailors used landmarks that they knew to help them navigate their route.",
            "options": [],
            "answerKey": "grain",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Quantities of agricultural goods such as 12_______  were transported by merchant ships to two main ports in Italy. The ships were pulled to the shore by 13_______ . When the weather was clear and they could see islands or land, sailors used landmarks that they knew to help them navigate their route.",
            "options": [],
            "answerKey": "towboats",
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
        "instructionHtml": "<h3>Questions 14–19</h3><p>The Reading Passage has eight sections, A-H.</p><p>Which section contains the following information?</p><p>Write the correct number, A-H, in boxes on your answer sheet.</p>",
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
            "prompt": "an explanation for weapons being left behind in the mountains",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "a reference to the physical difficulties involved in an archaeological expedition",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "an explanation of why less food may have been available",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "a reference to the possibility of future archaeological discoveries",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "examples of items that would have been traded",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "a reference to the pressure archaeologists are under to work quickly",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 20,
        "to": 22,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 20–22</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Interesting finds at an archaeological site</p><p>Organic materials such as animal skins and textiles are not discovered very often at archaeological sites. They have little protection against 20_______ , which means that they decay relatively quickly. But this is not always the case. If temperatures are low enough, fragile artefacts can be preserved for thousands of years.</p><p>A team of archaeologists have been working in the mountains in Oppland in Norway to recover artefacts revealed by shrinking ice cover. In the past, there were trade routes through these mountains and 21_______  gathered there in the summer months to avoid being attacked by 22_______  on lower ground. The people who used these mountains left things behind and it is those objects that are of interest to archaeologists.</p>",
        "questions": [
          {
            "number": 20,
            "prompt": "Organic materials such as animal skins and textiles are not discovered very often at archaeological sites. They have little protection against 20_______ , which means that they decay relatively quickly. But this is not always the case. If temperatures are low enough, fragile artefacts can be preserved for thousands of years.",
            "options": [],
            "answerKey": "MICROORGANISMS/ MICRO-ORGANISMS",
            "acceptedAnswers": [
              "microorganisms",
              "micro-organisms"
            ]
          },
          {
            "number": 21,
            "prompt": "A team of archaeologists have been working in the mountains in Oppland in Norway to recover artefacts revealed by shrinking ice cover. In the past, there were trade routes through these mountains and 21_______  gathered there in the summer months to avoid being attacked by 22_______  on lower ground. The people who used these mountains left things behind and it is those objects that are of interest to archaeologists.",
            "options": [],
            "answerKey": "reindeer",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "A team of archaeologists have been working in the mountains in Oppland in Norway to recover artefacts revealed by shrinking ice cover. In the past, there were trade routes through these mountains and 21_______  gathered there in the summer months to avoid being attacked by 22_______  on lower ground. The people who used these mountains left things behind and it is those objects that are of interest to archaeologists.",
            "options": [],
            "answerKey": "insects",
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
            "prompt": "Which TWO of the following statements does the writer make about the discoveries of Barrett’s team?",
            "options": [
              "Artefacts found in the higher mountain passes were limited to skiing equipment.",
              "Hunters went into the mountains even during periods of extreme cold.",
              "The number of artefacts from certain time periods was relatively low.",
              "Radiocarbon dating of artefacts produced some unreliable results.",
              "More artefacts were found in Oppland than at any other mountain site."
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "C"
            ]
          },
          {
            "number": 24,
            "prompt": "Which TWO of the following statements does the writer make about the discoveries of Barrett’s team?",
            "options": [
              "Artefacts found in the higher mountain passes were limited to skiing equipment.",
              "Hunters went into the mountains even during periods of extreme cold.",
              "The number of artefacts from certain time periods was relatively low.",
              "Radiocarbon dating of artefacts produced some unreliable results.",
              "More artefacts were found in Oppland than at any other mountain site."
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
            "prompt": "Which TWO of the following statements does the writer make about the Viking Age?",
            "options": [
              "Hunters at this time benefited from an increased demand for goods.",
              "The beginning of the period saw the greatest growth in the wealth of Vikings.",
              "Vikings did not rely on ships alone to transport goods.",
              "Norwegian towns at this time attracted traders from around the world.",
              "Vikings were primarily interested in their trading links with the Middle East."
            ],
            "answerKey": "A",
            "acceptedAnswers": [
              "C"
            ]
          },
          {
            "number": 26,
            "prompt": "Which TWO of the following statements does the writer make about the Viking Age?",
            "options": [
              "Hunters at this time benefited from an increased demand for goods.",
              "The beginning of the period saw the greatest growth in the wealth of Vikings.",
              "Vikings did not rely on ships alone to transport goods.",
              "Norwegian towns at this time attracted traders from around the world.",
              "Vikings were primarily interested in their trading links with the Middle East."
            ],
            "answerKey": "C",
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
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 27–32</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "The Cambridge scientists’ discovery of the ‘thermometer molecule’ caused surprise among other scientists.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "The target for agricultural production by 2050 could be missed.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Wheat and rice suffer from a rise in temperatures.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "It may be possible to develop crops that require less water.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Plants grow faster in sunlight than in shade.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "Phytochromes change their state at the same speed day and night.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 33,
        "to": 37,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 33–37</h3><p>The Reading Passage has eight sections, A-H.</p><p>Which section contains the following information?</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p>",
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
            "number": 33,
            "prompt": "mention of specialists who can make use of the research findings",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "a reference to a potential benefit of the research findings",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "scientific support for a traditional saying",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "a reference to people traditionally making plans based on plant behaviour",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "a reference to where the research has been reported",
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
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 38–40</h3><p>Complete the sentences below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• Daffodils are likely to flower early in response to 38_______  weather.</p><p>• If ash trees come into leaf before oak trees, the weather in 39_______  will probably be wet.</p><p>• The research was carried out using a particular species of 40_______ .</p>",
        "questions": [
          {
            "number": 38,
            "prompt": "* Daffodils are likely to flower early in response to 38_______  weather.",
            "options": [],
            "answerKey": "warm (WINTER)",
            "acceptedAnswers": [
              "warm",
              "warm winter"
            ]
          },
          {
            "number": 39,
            "prompt": "* If ash trees come into leaf before oak trees, the weather in 39_______  will probably be wet.",
            "options": [],
            "answerKey": "(COLDER) SUMMER",
            "acceptedAnswers": [
              "summer"
            ]
          },
          {
            "number": 40,
            "prompt": "* The research was carried out using a particular species of 40_______ .",
            "options": [],
            "answerKey": "MUSTARD/ MUSTARD PLANT(S)",
            "acceptedAnswers": [
              "mustard plant",
              "mustard plants",
              "mustard"
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-16-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-16-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "Roman tunnels",
        "contentHtml": "<h2>Roman tunnels</h2><p>The Romans, who once controlled areas of Europe, North Africa and Asia Minor, adopted the construction techniques of other civilizations to build tunnels in their territories</p><p>The Persians, who lived in present-day Iran, were one of the first civilizations to build tunnels that provided a reliable supply of water to human settlements in dry areas. In the early first millennium BCE, they introduced the qanat method of tunnel construction, which consisted of placing posts over a hill in a straight line, to ensure that the tunnel kept to its route, and then digging vertical shafts down into the ground at regular intervals.</p><p>Underground, workers removed the earth from between the ends of the shafts, creating a tunnel. The excavated soil was taken up to the surface using the shafts, which also provided ventilation during the work. Once the tunnel was completed, it allowed water to flow from the top of a hillside down towards a canal, which supplied water for human use. Remarkably, some qanats built by the Persians 2,700 years ago are still in use today.</p><p>They later passed on their knowledge to the Romans, who also used the qanat method to construct water-supply tunnels for agriculture. Roman qanat tunnels were constructed with vertical shafts dug at intervals of between 30 and 60 meters. The shafts were equipped with handholds and footholds to help those climbing in and out of them and were covered with a wooden or stone lid.</p><p>To ensure that the shafts were vertical, Romans hung a plumb line from a rod placed across the top of each shaft and made sure that the weight at the end of it hung in the center of the shaft. Plumb lines were also used to measure the depth of the shaft and to determine the slope of the tunnel. The 5.6 kilometer Long Claudius tunnel, built in 41 CE to drain the Fucine Lake in central Italy, had shafts that were up to 122 meters deep, took 11 years to build and involved approximately 30,000 workers.</p><p>By the 6th century BCE, a second method of tunnel construction appeared called the counter- excavation method, in which the tunnel was constructed from both ends. It was used to cut through high mountains when the qanat method was not a practical alternative. This method required greater planning and advanced knowledge of surveying, mathematics and geometry as both ends of a tunnel had to meet correctly at the center of the mountain.</p><p>Adjustments to the direction of the tunnel also had to be made whenever builders encountered geological problems or when it deviated from its set path. They constantly checked the tunnel’s advancing direction.</p><p>For example, by looking back at the light that penetrated through the tunnel mouth, and made corrections whenever necessary. Large deviations could happen, and they could result in one end of the tunnel not being usable.</p><p>An inscription written on the side of a 428-meter tunnel, built by the Romans as part of the Saldae aqueduct system in modern-day Algeria, describes how the two teams of builders missed each other in the mountain and how the later construction of a lateral link between both corridors corrected the initial error.</p><p>The Romans dug tunnels for their roads using the counter-excavation method, whenever they encountered obstacles such as hills or mountains that were too high for roads to pass over. An example is the 37-meter-long, 6-meter-high, Furlo Pass Tunnel built in Italy in 69-79 CE. Remarkably, a modern road still uses this tunnel today. Tunnels were also built for mineral extraction. Miners would locate a mineral vein and then pursue it with shafts and tunnels underground.</p><p>Traces of such tunnels used to mine gold can still be found at the Dolaucothi mines in Wales. When the sole purpose of a tunnel was mineral extraction, construction required less planning, as the tunnel route was determined by the mineral vein.</p><p>Roman tunnel projects were carefully planned and carried out. The length of time it took to construct a tunnel depended on the method being used and the type of rock being excavated. The qanat construction method was usually faster than the counter-excavation method as it was more straightforward. This was because the mountain could be excavated not only from the tunnel mouths but also from shafts. The type of rock could also influence construction times.</p><p>When the rock was hard, the Romans employed a technique called fire quenching which consisted of heating the rock with fire, and then suddenly cooling it with cold water so that it would crack.</p><p>Progress through hard rock could be very slow, and it was not uncommon for tunnels to take years, if not decades, to be built. Construction marks left on a Roman tunnel in Bologna show that the rate of advance through solid rock was 30 centimeters per day. In contrast, the rate of advance of the Claudius tunnel can be calculated at 1.4 meters per day. Most tunnels had inscriptions showing the names of patrons who ordered construction and sometimes the name of the architect.</p><p>For example, the 1.4-kilometer Cevlik tunnel in Turkey, built to divert the floodwater threatening the harbor of the ancient city of Seleuceia Pieria, had inscriptions on the entrance, still visible today, that also indicate that the tunnel was started in 69 CE and was completed in 81 CE.</p>"
      },
      {
        "section": 2,
        "title": "Changes in reading habits",
        "contentHtml": "<h2>Changes in reading habits</h2><p>What are the implications of the way we read today?</p><p>Look around on your next plane trip. The iPad is the new pacifier for babies and toddlers. Younger school-aged children read stories on smartphones; older kids don’t read at all, but hunch over video games. Parents and other passengers read on tablets or skim a flotilla of email and news feeds.</p><p>Unbeknown to most of us, an invisible, game-changing transformation links everyone in this picture: the neuronal circuit that underlies the brain’s ability to read is subtly, rapidly changing and this has implications for everyone from the pre-reading toddler to the expert adult.</p><p>As work in neurosciences indicates, the acquisition of literacy necessitated a new circuit in our species’ brain more than 6,000 years ago. That circuit evolved from a very simple mechanism for decoding basic information, like the number of goats in one’s herd, to the present, highly elaborated reading brain.</p><p>My research depicts how the present reading brain enables the development of some of our most important intellectual and affective processes: internalized knowledge, analogical reasoning, and inference; perspective-taking and empathy; critical analysis and the generation of insight. Research surfacing in many parts of the world now cautions that each of these essential ‘deep reading’ processes may be under threat as we move into digital- based modes of reading.</p><p>This is not a simple, binary issue of print versus digital reading and technological innovation. As MIT scholar Sherry Turkle has written, we do not err as a society when we innovate but when we ignore what we disrupt or diminish while innovating. In this hinge moment between print and digital cultures, society needs to confront what is diminishing in the expert reading circuit, what our children and older students are not developing, and what we can do about it.</p><p>We know from research that the reading circuit is not given to human beings through a genetic blueprint like vision or language; it needs an environment to develop. Further, it will adapt to that environment’s requirements — from different writing systems to the characteristics of whatever medium is used. If the dominant medium advantages processes that are fast, multi-task oriented and well-suited for large volumes of information, like the current digital medium, so will the reading circuit.</p><p>As UCLA psychologist Patricia Greenfield writes, the result is that less attention and time will be allocated to slower, time-demanding deep reading processes.</p><p>Increasing reports from educators and from researchers in psychology and the humanities bear this out. English literature scholar and teacher Mark Edmundson describes how many college students actively avoid the classic literature of the 19th and 20th centuries in favour of something simpler as they no longer have the patience to read longer, denser, more difficult texts.</p><p>We should be less concerned with students’ ‘cognitive impatience’, however, than by what may underlie it: the potential inability of large numbers of students to read with a level of critical analysis sufficient to comprehend the complexity of thought and argument found in more demanding texts.</p><p>Multiple studies show that digital screen use may be causing a variety of troubling downstream effects on reading comprehension in older high school and college students. In Stavanger, Norway, psychologist Anne Mangen and her colleagues studied how high school students comprehend the same material in different mediums. Mangen’s group asked subjects questions about a short story whose plot had universal student appeal; half of the students read the story on a tablet, the other half in paperback.</p><p>Results indicated that students who read on print were superior in their comprehension to screen-reading peers, particularly in their ability to sequence detail and reconstruct the plot in chronological order.</p><p>Ziming Liu from San Jose State University has conducted a series of studies which indicate that the ‘new norm’ in reading is skimming, involving word-spotting and browsing through the text. Many readers now use a pattern when reading in which they sample the first line and then word- spot through the rest of the text. When the reading brain skims like this, it reduces time allocated to deep reading processes.</p><p>In other words, we don’t have time to grasp complexity, to understand another’s feelings, to perceive beauty, and to create thoughts of the reader’s own.</p><p>The possibility that critical analysis, empathy and other deep reading processes could become the unintended ‘collateral damage’ of our digital culture is not a straightforward binary issue about print versus digital reading. It is about how we all have begun to read on various mediums and how that changes not only what we read, but also the purposes for which we read. Nor is it only about the young. The subtle atrophy of critical analysis and empathy affects us all equally.</p><p>It affects our ability to navigate a constant bombardment of information. It incentivizes a retreat to the most familiar stores of unchecked information, which require and receive no analysis, leaving us susceptible to false information and irrational ideas.</p><p>There’s an old rule in neuroscience that does not alter with age: use it or lose it. It is a very hopeful principle when applied to critical thought in the reading brain because it implies choice. The story of the changing reading brain is hardly finished. We possess both the science and the technology to identify and redress the changes in how we read before they become entrenched.</p><p>If we work to understand exactly what we will lose, alongside the extraordinary new capacities that the digital world has brought us, there is as much reason for excitement as caution.</p>"
      },
      {
        "section": 3,
        "title": "Attitudes towards Artificial Intelligence",
        "contentHtml": "<h2>Attitudes towards Artificial Intelligence</h2><p><strong>A</strong> Artificial intelligence (AI) can already predict the future. Police forces are using it to map when and where crime is likely to occur. Doctors can use it to predict when a patient is most likely to have a heart attack or stroke. Researchers are even trying to give AI imagination so it can plan for unexpected consequences.</p><p>Many decisions in our lives require a good forecast, and AI is almost always better at forecasting than we are. Yet for all these technological advances, we still seem to deeply lack confidence in Al predictions. Recent cases show that people don’t like relying on AI and prefer to trust human experts, even if these experts are wrong.</p><p>If we want AI to really benefit people, we need to find a way to get people to trust it. To do that, we need to understand why people are so reluctant to trust AI in the first place.</p><p><strong>B</strong> Take the case of Watson for Oncology, one of technology giant IBM’s supercomputer programs. Their attempt to promote this program to cancer doctors was a PR disaster. The AI promised to deliver top-quality recommendations on the treatment of 12 cancers that accounted for 80% of the world’s eases. But when doctors first interacted with Watson, they found themselves in a rather difficult situation.</p><p>On the one hand, if Watson provided guidance about a treatment that coincided with their own opinions, physicians did not see much point in Watson’s recommendations. The supercomputer was simply telling them what they already knew, and these recommendations did not change the actual treatment.</p><p>On the other hand, if Watson generated a recommendation that contradicted the experts’ opinion, doctors would typically conclude that Watson wasn’t competent. And the machine wouldn’t be able to explain why its treatment was plausible because its machine-learning algorithms were simply too complex to be fully understood by humans. Consequently, this has caused even more suspicion and disbelief, leading many doctors to ignore the seemingly outlandish AI recommendations and stick to their own expertise.</p><p><strong>C</strong> This is just one example of people's lack of confidence in AI and their reluctance to accept what AI has to offer. Trust in other people is often based on our understanding of how others think and having experience of their reliability. This helps create a psychological feeling of safety. AI, on the other hand, is still fairly new and unfamiliar to most people.</p><p>Even if it can be technically explained (and that’s not always the case), AI’s decision-making process is usually too difficult for most people to comprehend. And interacting with something we don’t understand can cause anxiety and give us a sense that we’re losing control.</p><p>Many people are also simply not familiar with many instances of AI actually working, because it often happens in the background. Instead they are acutely aware of instances where AI goes wrong. Embarrassing AI failures receive a disproportionate amount of media attention, emphasising the message that we cannot rely on technology. Machine learning is not foolproof, in part because the humans who design it aren’t.</p><p><strong>D</strong> Feelings about AI run deep. In a recent experiment, people from a range of backgrounds were given various sci-fi films about AI to watch and then asked questions about automation in everyday life. It was found that, regardless of whether the film they watched depicted AI in a positive or negative light, simply watching a cinematic vision of our technological future polarised the participants’ attitudes. Optimists became more extreme in their enthusiasm for AI and sceptics became even more guarded.</p><p>This suggests people use relevant evidence about AI in a biased manner to support their existing attitudes, a deep-rooted human tendency known as “confirmation bias”. As AI is represented more and more in media and entertainment, it could lead to a society split between those who benefit from AI and those who reject it. More pertinently, refusing to accept the advantages offered by AI could place a large group of people at a serious disadvantage.</p><p><strong>E</strong> Fortunately, we already have some ideas about how to improve trust in AI. Simply having previous experience with AI can significantly improve people’s opinions about the technology, as was found in the study mentioned above. Evidence also suggests the more you use other technologies such as the internet, the more you trust them.</p><p>Another solution may be to reveal more about the algorithms which AI uses and the purposes they serve. Several high-profile social media companies and online marketplaces already release transparency reports about government requests and surveillance disclosures. A similar practice for AI could help people have a better understanding of the way algorithmic decisions are made.</p><p><strong>F</strong> Research suggests that allowing people some control over AI decision-making could also improve trust and enable AI to learn from human experience. For example, one study showed that when people were allowed the freedom to slightly modify an algorithm, they felt more satisfied with its decisions, more likely to believe it was superior and more likely to use it in the future.</p><p>We don’t need to understand the intricate inner workings of AI systems, but if people are given a degree of responsibility for how they are implemented, they will be more willing to accept AI into their lives.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 6,
        "type": "fill",
        "displayType": "fill-blank",
        "instructionHtml": "<h3>Questions 1–6</h3><p>Label the diagrams below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p style=\"text-align:center;margin:12px 0\"><img src=\"https://pub-c71988294a9b45099e83dad66bb73426.r2.dev/images/migrated/ielts-website/blog/sylwwypi5kak0xqg5oue.webp\" style=\"max-width:100%;height:auto;border-radius:6px\" alt=\"diagram\" /></p><ul><li>1_______ to direct the tunnelling</li><li>water runs into a 2_______ used by local people</li><li>vertical shafts to remove earth and for 3_______</li><li>4_______ made of wood or stone</li><li>5_______ attached to the plumb line</li><li>handholds and footholds used for 6_______</li></ul>",
        "questions": [
          {
            "number": 1,
            "prompt": "1. ___________",
            "options": [],
            "answerKey": "posts",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "2. ___________",
            "options": [],
            "answerKey": "canal",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "3. ___________",
            "options": [],
            "answerKey": "ventilation",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "4. ___________",
            "options": [],
            "answerKey": "lid",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "5. ___________",
            "options": [],
            "answerKey": "weight",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "6. ___________",
            "options": [],
            "answerKey": "climbing",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 7,
        "to": 10,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 7–10</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 7,
            "prompt": "The counter-excavation method completely replaced the qanat method in the 6th century BCE.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Only experienced builders were employed to construct a tunnel using the counter-excavation method.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "The information about a problem that occurred during the construction of the Saldae aqueduct system was found in an ancient book.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "The mistake made by the builders of the Saldae aqueduct system was that the two parts of the tunnel failed to meet.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 11,
        "to": 13,
        "type": "fill",
        "displayType": "fill-blank",
        "instructionHtml": "<h3>Questions 11–13</h3><p>Answer the questions below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 11,
            "prompt": "What type of mineral were the Dolaucothi mines in Wales built to extract?",
            "options": [],
            "answerKey": "gold",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "In addition to the patron, whose name might be carved onto a tunnel?",
            "options": [],
            "answerKey": "architect",
            "acceptedAnswers": [
              "architect's",
              "architect's name",
              "architect name",
              "the architect",
              "the architect's",
              "the architect's name",
              "the architect name"
            ]
          },
          {
            "number": 13,
            "prompt": "What part of Seleuceia Pieria was the Çevlik tunnel built to protect?",
            "options": [],
            "answerKey": "(THE) HARBOUR/ HARBOR",
            "acceptedAnswers": [
              "harbour",
              "harbor",
              "the harbour",
              "the harbor"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 17,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 14–17</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "What is the writer’s main point in the first paragraph?",
            "options": [
              "Our use of technology is having a hidden effect on us.",
              "Technology can be used to help youngsters to read.",
              "Travellers should be encouraged to use technology on planes.",
              "Playing games is a more popular use of technology than reading."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "What main point does Sherry Turkle make about innovation?",
            "options": [
              "Technological innovation has led to a reduction in print reading.",
              "We should pay attention to what might be lost when innovation occurs.",
              "We should encourage more young people to become involved in innovation.",
              "There is a difference between developing products and developing ideas."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "What point is the writer making in the fourth paragraph?",
            "options": [
              "Humans have an inborn ability to read and write.",
              "Reading can be done using many different mediums.",
              "Writing systems make unexpected demands on the brain.",
              "Some brain circuits adjust to whatever is required of them."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "According to Mark Edmundson, the attitude of college students",
            "options": [
              "has changed the way he teaches.",
              "has influenced what they select to read.",
              "does not worry him as much as it does others.",
              "does not match the views of the general public."
            ],
            "answerKey": "B",
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
        "instructionHtml": "<h3>Questions 18–22</h3><p>Complete the summary using the list of words, A-H, below.</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "fast",
            "isolated",
            "emotional",
            "worrying",
            "many",
            "hard",
            "combined",
            "thorough"
          ]
        },
        "questionHtml": "<p>Studies on digital screen use</p><p>There have been many studies on digital screen use, showing some 18_______  trends. Psychologist Anne Mangen gave high-school students a short story to read, half using digital and half using print mediums. Her team then used a question-and-answer technique to find out how 19_______  each group’s understanding of the plot was.</p><p>The findings showed a clear pattern in the responses, with those who read screens finding the order of information 20_______  to recall.</p><p>Studies by Ziming Liu show that students are tending to read 21_______  words and phrases in a text to save time. This approach, she says, gives the reader a superficial understanding of the 22_______  content of material, leaving no time for thought.</p>",
        "questions": [
          {
            "number": 18,
            "prompt": "There have been many studies on digital screen use, showing some 18_______  trends. Psychologist Anne Mangen gave high-school students a short story to read, half using digital and half using print mediums. Her team then used a question-and-answer technique to find out how 19_______  each group’s understanding of the plot was.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "There have been many studies on digital screen use, showing some 18_______  trends. Psychologist Anne Mangen gave high-school students a short story to read, half using digital and half using print mediums. Her team then used a question-and-answer technique to find out how 19_______  each group’s understanding of the plot was.",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "The findings showed a clear pattern in the responses, with those who read screens finding the order of information 20_______  to recall.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "Studies by Ziming Liu show that students are tending to read 21_______  words and phrases in a text to save time. This approach, she says, gives the reader a superficial understanding of the 22_______  content of material, leaving no time for thought.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Studies by Ziming Liu show that students are tending to read 21_______  words and phrases in a text to save time. This approach, she says, gives the reader a superficial understanding of the 22_______  content of material, leaving no time for thought.",
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
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 23–26</h3><p>Do the following statements agree with the claims of the writer in The Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "The medium we use to read can affect our choice of reading content.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "Some age groups are more likely to lose their complex reading skills than others.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "False information has become more widespread in today’s digital era.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "We still have opportunities to rectify the problems that technology is presenting.",
            "options": [],
            "answerKey": "YES",
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
            "An increasing divergence of attitudes towards AI",
            "Reasons why we have more faith in human judgement than in AI",
            "The superiority of AI projections over those made by humans",
            "The process by which AI can help us make good decisions",
            "The advantages of involving users in AI processes",
            "Widespread distrust of an AI innovation",
            "Encouraging openness about how AI functions",
            "A surprisingly successful AI application"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "iii",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "vi",
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
            "answerKey": "i",
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
            "answerKey": "v",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 33,
        "to": 35,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 33–35</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 33,
            "prompt": "What is the writer doing in Section A?",
            "options": [
              "providing a solution to a concern",
              "justifying an opinion about an issue",
              "highlighting the existence of a problem",
              "explaining the reasons for a phenomenon"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "According to Section C, why might some people be reluctant to accept AI?",
            "options": [
              "They are afraid it will replace humans in decision-making jobs.",
              "Its complexity makes them feel that they are at a disadvantage.",
              "They would rather wait for the technology to be tested over a period of time.",
              "Misunderstandings about how it works make it seem more challenging than it is."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "What does the writer say about the media in Section C of the text?",
            "options": [
              "It leads the public to be mistrustful of AI.",
              "It devotes an excessive amount of attention to AI.",
              "Its reports of incidents involving AI are often inaccurate.",
              "It gives the impression that AI failures are due to designer error."
            ],
            "answerKey": "A",
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
        "instructionHtml": "<h3>Questions 36–40</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 36,
            "prompt": "Subjective depictions of AI in sci-fi films make people change their opinions about automation.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Portrayals of AI in media and entertainment are likely to become more positive.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "Rejection of the possibilities of AI may have a negative effect on many people’s lives.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Familiarity with AI has very little impact on people’s attitudes to the technology.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "AI applications which users are able to modify are more likely to gain consumer approval.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-17-1",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-17-academic-reading-test-1/",
    "sections": [
      {
        "section": 1,
        "title": "The development of the London underground railway",
        "contentHtml": "<h2>The development of the London underground railway</h2><p>In the first half of the 1800s, London’s population grew at an astonishing rate, and the central area became increasingly congested. In addition, the expansion of the overground railway network resulted in more and more passengers arriving in the capital. However, in 1846, a Royal Commission decided that the railways should not be allowed to enter the City, the capital’s historic and business centre. The result was that the overground railway stations formed a ring around the City.</p><p>The area within consisted of poorly built, overcrowded slums and the streets were full of horse-drawn traffic. Crossing the City became a nightmare. It could take an hour and a half to travel 8 km by horse-drawn carriage or bus. Numerous schemes were proposed to resolve these problems, but few succeeded.</p><p>Amongst the most vocal advocates for a solution to London’s traffic problems was Charles Pearson, who worked as a solicitor for the City of London. He saw both social and economic advantages in building an underground railway that would link the overground railway stations together and clear London slums at the same time. His idea was to relocate the poor workers who lived in the inner-city slums to newly constructed suburbs, and to provide cheap rail travel for them to get to work.</p><p>Pearson’s ideas gained support amongst some businessmen and in 1851 he submitted a plan to Parliament. It was rejected, but coincided with a proposal from another group for an underground connecting line, which Parliament passed.</p><p>The two groups merged and established the Metropolitan Railway Company in August 1854. The company’s plan was to construct an underground railway line from the Great Western Railway’s (GWR) station at Paddington to the edge of the City at Farringdon Street - a distance of almost 5 km. The organisation had difficulty in raising the funding for such a radical and expensive scheme, not least because of the critical articles printed by the press.</p><p>Objectors argued that the tunnels would collapse under the weight of traffic overhead, buildings would be shaken and passengers would be poisoned by the emissions from the train engines. However, Pearson and his partners persisted.</p><p>The GWR, aware that the new line would finally enable them to run trains into the heart of the City, invested almost £250,000 in the scheme. Eventually, over a five-year period, £1m was raised. The chosen route ran beneath existing main roads to minimise the expense of demolishing buildings. Originally scheduled to be completed in 21 months, the construction of the underground line took three years. It was built just below street level using a technique known as ‘cut and cover’.</p><p>A trench about ten metres wide and six metres deep was dug, and the sides temporarily held up with timber beams. Brick walls were then constructed, and finally a brick arch was added to create a tunnel. A two-metre-deep layer of soil was laid on top of the tunnel and the road above rebuilt.</p><p>The Metropolitan line, which opened on 10 January 1863, was the world’s first underground railway. On its first day, almost 40,000 passengers were carried between Paddington and Farringdon, the journey taking about 18 minutes. By the end of the Metropolitan’s first year of operation, 9.5 million journeys had been made.</p><p>Even as the Metropolitan began operation, the first extensions to the line were being authorised; these were built over the next five years, reaching Moorgate in the east of London and Hammersmith in the west. The original plan was to pull the trains with steam locomotives, using firebricks in the boilers to provide steam, but these engines were never introduced. Instead, the line used specially designed locomotives that were fitted with water tanks in which steam could be condensed.</p><p>However, smoke and fumes remained a problem, even though ventilation shafts were added to the tunnels.</p><p>Despite the extension of the underground railway, by the 1880s, congestion on London’s streets had become worse. The problem was partly that the existing underground lines formed a circuit around the centre of London and extended to the suburbs, but did not cross the capital’s centre. The ‘cut and cover’ method of construction was not an option in this part of the capital. The only alternative was to tunnel deep underground.</p><p>Although the technology to create these tunnels existed, steam locomotives could not be used in such a confined space. It wasn’t until the development of a reliable electric motor, and a means of transferring power from the generator to a moving train, that the world’s first deep-level electric railway, the City &amp; South London, became possible. The line opened in 1890, and ran from the City to Stockwell, south of the River Thames. The trains were made up of three carriages and driven by electric engines.</p><p>The carriages were narrow and had tiny windows just below the roof because it was thought that passengers would not want to look out at the tunnel walls. The line was not without its problems, mainly caused by an unreliable power supply. Although the City &amp; South London Railway was a great technical achievement, it did not make a profit. Then, in 1900, the Central London Railway, known as the ‘Tuppenny Tube’, began operation using new electric locomotives.</p><p>It was very popular and soon afterwards new railways and extensions were added to the growing tube network. By 1907, the heart of today’s Underground system was in place.</p>"
      },
      {
        "section": 2,
        "title": "Stadiums: past, present and future",
        "contentHtml": "<h2>Stadiums: past, present and future</h2><p><strong>A</strong> Stadiums are among the oldest forms of urban architecture: vast stadiums where the public could watch sporting events were at the centre of western city life as far back as the ancient Greek and Roman Empires, well before the construction of the great medieval cathedrals and the grand 19th- and 20th-century railway stations which dominated urban skylines in later eras.</p><p>Today, however, stadiums are regarded with growing scepticism. Construction costs can soar above £1 billion, and stadiums finished for major events such as the Olympic Games or the FIFA World Cup have notably fallen into disuse and disrepair.</p><p>But this need not be the case. History shows that stadiums can drive urban development and adapt to the culture of every age. Even today, architects and planners are finding new ways to adapt the mono-functional sports arenas which became emblematic of modernisation during the 20th century.</p><p><strong>B</strong> The amphitheatre* of Arles in southwest France, with a capacity of 25,000 spectators, is perhaps the best example of just how versatile stadiums can be. Built by the Romans in 90 AD, it became a fortress with four towers after the fifth century, and was then transformed into a village containing more than 200 houses.</p><p>With the growing interest in conservation during the 19th century, it was converted back into an arena for the staging of bullfights, thereby returning the structure to its original use as a venue for public spectacles.</p><p>Another example is the imposing arena of Verona in northern Italy, with space for 30,000 spectators, which was built 60 years before the Arles amphitheatre and 40 years before Rome’s famous Colosseum. It has endured the centuries and is currently considered one of the world’s prime sites for opera, thanks to its outstanding acoustics.</p><p><strong>C</strong> The area in the centre of the Italian town of Lucca, known as the Piazza dell’Anfiteatro, is yet another impressive example of an amphitheatre becoming absorbed into the fabric of the city. The site evolved in a similar way to Arles and was progressively filled with buildings from the Middle Ages until the 19th century, variously used as houses, a salt depot and a prison. But rather than reverting to an arena, it became a market square, designed by Romanticist architect Lorenzo Nottolini.</p><p>Today, the ruins of the amphitheatre remain embedded in the various shops and residences surrounding the public square.</p><p><strong>D</strong> There are many similarities between modern stadiums and the ancient amphitheatres intended for games. But some of the flexibility was lost at the beginning of the 20th century, as stadiums were developed using new products such as steel and reinforced concrete, and made use of bright lights for night-time matches.</p><p>Many such stadiums are situated in suburban areas, designed for sporting use only and surrounded by parking lots. These factors mean that they may not be as accessible to the general public, require more energy to run and contribute to urban heat.</p><p><strong>E</strong> But many of today’s most innovative architects see scope for the stadium to help improve the city. Among the current strategies, two seem to be having particular success: the stadium as an urban hub, and as a power plant.</p><p>There’s a growing trend for stadiums to be equipped with public spaces and services that serve a function beyond sport, such as hotels, retail outlets, conference centres, restaurants and bars, children’s playgrounds and green space. Creating mixed-use developments such as this reinforces compactness and multi-functionality, making more efficient use of land and helping to regenerate urban spaces.</p><p>This opens the space up to families and a wider cross-section of society, instead of catering only to sportspeople and supporters. There have been many examples of this in the UK: the mixed-use facilities at Wembley and Old Trafford have become a blueprint for many other stadiums in the world.</p><p><strong>F</strong> The phenomenon of stadiums as power stations has arisen from the idea that energy problems can be overcome by integrating interconnected buildings by means of a smart grid, which is an electricity supply network that uses digital communications technology to detect and react to local changes in usage, without significant energy losses.</p><p>Stadiums are ideal for these purposes, because their canopies have a large surface area for fitting photovoltaic panels and rise high enough (more than 40 metres) to make use of micro wind turbines.</p><p>Freiburg Mage Solar Stadium in Germany is the first of a new wave of stadiums as power plants, which also includes the Amsterdam Arena and the Kaohsiung Stadium. The latter, inaugurated in 2009, has 8,844 photovoltaic panels producing up to 1.14 GWh of electricity annually. This reduces the annual output of carbon dioxide by 660 tons and supplies up to 80 percent of the surrounding area when the stadium is not in use.</p><p>This is proof that a stadium can serve its city, and have a decidedly positive impact in terms of reduction of CO2 emissions.</p><p><strong>G</strong> Sporting arenas have always been central to the life and culture of cities. In every era, the stadium has acquired new value and uses: from military fortress to residential village, public space to theatre and most recently a field for experimentation in advanced engineering. The stadium of today now brings together multiple functions, thus helping cities to create a sustainable future.</p><p>*amphitheatre: (especially in Greek and Roman architecture) an open circular or oval building with a central space surrounded by tiers of seats for spectators, for the presentation of dramatic or sporting events</p>"
      },
      {
        "section": 3,
        "title": "To catch a king",
        "contentHtml": "<h2>To catch a king</h2><p>Anna Keay reviews Charles Spencers hook about the hunt for King Charles II during the English Civil War of the seventeenth century</p><p>Charles Spencer’s latest book, To Catch a King, tells us the story of the hunt for King Charles II in the six weeks after his resounding defeat at the Battle of Worcester in September 1651. And what a story it is. After his father was executed by the Parliamentarians in 1649, the young Charles II sacrificed one of the very principles his father had died for and did a deal with the Scots, thereby accepting Presbyterianism* as the national religion in return for being crowned King of Scots.</p><p>His arrival in Edinburgh prompted the English Parliamentary army to invade Scotland in a pre-emptive strike. This was followed by a Scottish invasion of England. The two sides finally faced one another at Worcester in the west of England in 1651. After being comprehensively defeated on the meadows outside the city by the Parliamentarian army, the 21-year-old king found himself the subject of a national manhunt, with a huge sum offered for his capture.</p><p>Over the following six weeks he managed, through a series of heart-poundingly close escapes, to evade the Parliamentarians before seeking refuge in France. For the next nine years, the penniless and defeated Charles wandered around Europe with only a small group of loyal supporters.</p><p>Years later, after his restoration as king, the 50-year-old Charles II requested a meeting with the writer and diarist Samuel Pepys. His intention when asking Pepys to commit his story to paper was to ensure that this most extraordinary episode was never forgotten. Over two three-hour sittings, the king related to him in great detail his personal recollections of the six weeks he had spent as a fugitive.</p><p>As the king and secretary settled down (a scene that is surely a gift for a future scriptwriter), Charles commenced his story: ‘After the battle was so absolutely lost as to be beyond hope of recovery, I began to think of the best way of saving myself.’</p><p>One of the joys of Spencer’s book, a result not least of its use of Charles II’s own narrative as well as those of his supporters, is just how close the reader gets to the action. The day-by-day retelling of the fugitives’ doings provides delicious details: the cutting of the king’s long hair with agricultural shears, the use of walnut leaves to dye his pale skin, and the day Charles spent lying on a branch of the great oak tree in Boscobel Wood as the Parliamentary soldiers scoured the forest floor below.</p><p>Spencer draws out both the humour - such as the preposterous refusal of Charles’s friend Henry Wilmot to adopt disguise on the grounds that it was beneath his dignity - and the emotional tension when the secret of the king’s presence was cautiously revealed to his supporters.</p><p>Charles’s adventures after losing the Battle of Worcester hide the uncomfortable truth that whilst almost everyone in England had been appalled by the execution of his father, they had not welcomed the arrival of his son with the Scots army, but had instead firmly bolted their doors. This was partly because he rode at the head of what looked like a foreign invasion force and partly because, after almost a decade of civil war, people were desperate to avoid it beginning again.</p><p>This makes it all the more interesting that Charles II himself loved the story so much ever after. As well as retelling it to anyone who would listen, causing eye-rolling among courtiers, he set in train a series of initiatives to memorialise it. There was to be a new order of chivalry, the Knights of the Royal Oak. A series of enormous oil paintings depicting the episode were produced, including a two-metre-wide canvas of Boscobel Wood and a set of six similarly enormous paintings of the king on the run.</p><p>In 1660, Charles II commissioned the artist John Michael Wright to paint a flying squadron of cherubs* carrying an oak tree to the heavens on the ceiling of his bedchamber. It is hard to imagine many other kings marking the lowest point in their life so enthusiastically, or indeed pulling off such an escape in the first place.</p><p>Charles Spencer is the perfect person to pass the story on to a new generation. His pacey, readable prose steers deftly clear of modern idioms and elegantly brings to life the details of the great tale. He has even-handed sympathy for both the fugitive king and the fierce republican regime that hunted him, and he succeeds in his desire to explore far more of the background of the story than previous books on the subject have done.</p><p>Indeed, the opening third of the book is about how Charles II found himself at Worcester in the first place, which for some will be reason alone to read To Catch a King.</p><p>The tantalising question left, in the end, is that of what it all meant. Would Charles II have been a different king had these six weeks never happened? The days and nights spent in hiding must have affected him in some way. Did the need to assume disguises, to survive on wit and charm alone, to use trickery and subterfuge to escape from tight corners help form him? This is the one area where the book doesn’t quite hit the mark.</p><p>Instead its depiction of Charles II in his final years as an ineffective, pleasure-loving monarch doesn’t do justice to the man (neither is it accurate), or to the complexity of his character. But this one niggle aside, To Catch a King is an excellent read, and those who come to it knowing little of the famous tale will find they have a treat in store.</p><p>*Presbyterianism: part of the reformed Protestant religion</p><p>*cherub: an image of angelic children used in paintings</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 6,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–6</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
        "config": {},
        "questionHtml": "<p>The London underground railway</p><p>The problem</p><p>• The 1_______  of London increased rapidly between 1800 and 1850</p><p>• The streets were full of horse-drawn vehicles</p><p>The proposed solution</p><p>• Charles Pearson, a solicitor, suggested building an underground railway</p><p>• Building the railway would make it possible to move people to better housing in the 2_______ </p><p>• A number of 3_______  agreed with Pearson’s idea</p><p>• The company initially had problems getting the 4_______  needed for the project</p><p>• Negative articles about the project appeared in the 5_______ </p><p>The construction</p><p>• The chosen route did not require many buildings to be pulled down</p><p>• The ‘cut and cover’ method was used to construct the tunnels</p><p>• With the completion of the brick arch, the tunnel was covered with 6_______ </p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* The 1_______  of London increased rapidly between 1800 and 1850",
            "options": [],
            "answerKey": "population",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* Building the railway would make it possible to move people to better housing in the 2_______ ",
            "options": [],
            "answerKey": "suburbs",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "* A number of 3_______  agreed with Pearson’s idea",
            "options": [],
            "answerKey": "businessmen",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* The company initially had problems getting the 4_______  needed for the project",
            "options": [],
            "answerKey": "funding",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* Negative articles about the project appeared in the 5_______ ",
            "options": [],
            "answerKey": "press",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "* With the completion of the brick arch, the tunnel was covered with 6_______ ",
            "options": [],
            "answerKey": "soil",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 7,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 7–13</h3><p>Do the following statements agree with the information given in the passage?</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 7,
            "prompt": "Other countries had built underground railways before the Metropolitan line opened.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "More people than predicted travelled on the Metropolitan line on the first day.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "The use of ventilation shafts failed to prevent pollution in the tunnels.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "A different approach from the ‘cut and cover’ technique was required in London’s central area.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "The windows on City & South London trains were at eye level.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "The City & South London Railway was a financial success.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Trains on the ‘Tuppenny Tube’ nearly always ran on time.",
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
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–17</h3><p>The passage has seven paragraphs, A-G.</p><p>Which section contains the following information?</p><p>NB You may use any letter more than once.</p>",
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
            "prompt": "a mention of negative attitudes towards stadium building projects",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "figures demonstrating the environmental benefits of a certain stadium",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "examples of the wide range of facilities available at some new stadiums",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "reference to the disadvantages of the stadiums built during a certain era",
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
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 18–22</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
        "config": {},
        "questionHtml": "<p>Roman amphitheatres</p><p>The Roman stadium of Europe have proved very versatile. The amphitheatre of Arles, for example, was converted first into a 18_______ , then into a residential area and finally into an arena where spectators could watch 19_______ . Meanwhile, the arena in Verona, one of the oldest Roman amphitheatres, is famous today as a venue where 20_______  is performed. The site of Lucca’s amphitheatre has also been used for many purposes over the centuries, including the storage of 21_______ .</p><p>It is now a market square with 22_______  and homes incorporated into the remains of the Roman amphitheatre.</p>",
        "questions": [
          {
            "number": 18,
            "prompt": "The Roman stadium of Europe have proved very versatile. The amphitheatre of Arles, for example, was converted first into a 18_______ , then into a residential area and finally into an arena where spectators could watch 19_______ . Meanwhile, the arena in Verona, one of the oldest Roman amphitheatres, is famous today as a venue where 20_______  is performed. The site of Lucca’s amphitheatre has also been used for many purposes over the centuries, including the storage of 21_______ .",
            "options": [],
            "answerKey": "fortress",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "The Roman stadium of Europe have proved very versatile. The amphitheatre of Arles, for example, was converted first into a 18_______ , then into a residential area and finally into an arena where spectators could watch 19_______ . Meanwhile, the arena in Verona, one of the oldest Roman amphitheatres, is famous today as a venue where 20_______  is performed. The site of Lucca’s amphitheatre has also been used for many purposes over the centuries, including the storage of 21_______ .",
            "options": [],
            "answerKey": "bullfights",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "The Roman stadium of Europe have proved very versatile. The amphitheatre of Arles, for example, was converted first into a 18_______ , then into a residential area and finally into an arena where spectators could watch 19_______ . Meanwhile, the arena in Verona, one of the oldest Roman amphitheatres, is famous today as a venue where 20_______  is performed. The site of Lucca’s amphitheatre has also been used for many purposes over the centuries, including the storage of 21_______ .",
            "options": [],
            "answerKey": "opera",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "The Roman stadium of Europe have proved very versatile. The amphitheatre of Arles, for example, was converted first into a 18_______ , then into a residential area and finally into an arena where spectators could watch 19_______ . Meanwhile, the arena in Verona, one of the oldest Roman amphitheatres, is famous today as a venue where 20_______  is performed. The site of Lucca’s amphitheatre has also been used for many purposes over the centuries, including the storage of 21_______ .",
            "options": [],
            "answerKey": "salt",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "It is now a market square with 22_______  and homes incorporated into the remains of the Roman amphitheatre.",
            "options": [],
            "answerKey": "shops",
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
        "instructionHtml": "<h3>Questions 23–24</h3><p>Choose TWO letters, A-E.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "When comparing twentieth-century stadiums to ancient amphitheatres in Section D, which TWO negative features does the writer mention?",
            "options": [
              "They are less imaginatively designed.",
              "They are less spacious.",
              "They are in less convenient locations.",
              "They are less versatile.",
              "They are made of less durable materials"
            ],
            "answerKey": "C",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 24,
            "prompt": "When comparing twentieth-century stadiums to ancient amphitheatres in Section D, which TWO negative features does the writer mention?",
            "options": [
              "They are less imaginatively designed.",
              "They are less spacious.",
              "They are in less convenient locations.",
              "They are less versatile.",
              "They are made of less durable materials"
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
        "instructionHtml": "<h3>Questions 25–26</h3><p>Choose TWO letters, A-E.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 25,
            "prompt": "Which TWO advantages of modern stadium design does the writer mention?",
            "options": [
              "offering improved amenities for the enjoyment of sports events",
              "bringing community life back into the city environment",
              "facilitating research into solar and wind energy solutions",
              "enabling local residents to reduce their consumption of electricity",
              "providing a suitable site for the installation of renewable power generators"
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "E"
            ]
          },
          {
            "number": 26,
            "prompt": "Which TWO advantages of modern stadium design does the writer mention?",
            "options": [
              "offering improved amenities for the enjoyment of sports events",
              "bringing community life back into the city environment",
              "facilitating research into solar and wind energy solutions",
              "enabling local residents to reduce their consumption of electricity",
              "providing a suitable site for the installation of renewable power generators"
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
        "to": 31,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Complete the summary using the list of phrases, A-J, below.</p>",
        "config": {
          "phraseOptions": [
            "military innovation",
            "large reward",
            "widespread conspiracy",
            "relative safety",
            "new government",
            "decisive victory",
            "political debate",
            "strategic alliance",
            "popular solution",
            "religious conviction"
          ]
        },
        "questionHtml": "<p>The story behind the hunt for Charles II</p><p>Charles II’s father was executed by the Parliamentarian forces in 1649. Charles II then formed a 27_______  with the Scots, and in order to become King of Scots, he abandoned an important 28_______  that was held by his father and had contributed to his father’s death. The opposing sides then met outside Worcester in 1651. The battle led to a 29_______  for the Parliamentarians and Charles had to flee for his life.</p><p>A 30_______  was offered for Charles’s capture, but after six weeks spent in hiding, he eventually managed to reach the 31_______  of continental Europe.</p>",
        "questions": [
          {
            "number": 27,
            "prompt": "Charles II’s father was executed by the Parliamentarian forces in 1649. Charles II then formed a 27_______  with the Scots, and in order to become King of Scots, he abandoned an important 28_______  that was held by his father and had contributed to his father’s death. The opposing sides then met outside Worcester in 1651. The battle led to a 29_______  for the Parliamentarians and Charles had to flee for his life.",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Charles II’s father was executed by the Parliamentarian forces in 1649. Charles II then formed a 27_______  with the Scots, and in order to become King of Scots, he abandoned an important 28_______  that was held by his father and had contributed to his father’s death. The opposing sides then met outside Worcester in 1651. The battle led to a 29_______  for the Parliamentarians and Charles had to flee for his life.",
            "options": [],
            "answerKey": "J",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Charles II’s father was executed by the Parliamentarian forces in 1649. Charles II then formed a 27_______  with the Scots, and in order to become King of Scots, he abandoned an important 28_______  that was held by his father and had contributed to his father’s death. The opposing sides then met outside Worcester in 1651. The battle led to a 29_______  for the Parliamentarians and Charles had to flee for his life.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "A 30_______  was offered for Charles’s capture, but after six weeks spent in hiding, he eventually managed to reach the 31_______  of continental Europe.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "A 30_______  was offered for Charles’s capture, but after six weeks spent in hiding, he eventually managed to reach the 31_______  of continental Europe.",
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
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 32–35</h3><p>Do the following statements agree with the claims of the writer in the passage?</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 32,
            "prompt": "Charles chose Pepys for the task because he considered him to be trustworthy.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Charles’s personal recollection of the escape lacked sufficient detail.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Charles indicated to Pepys that he had planned his escape before the battle.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "The inclusion of Charles’s account is a positive aspect of the book.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 36,
        "to": 40,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 36–40</h3><p>Choose the correct letter, A, B, C, or D.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 36,
            "prompt": "What is the reviewer’s main purpose in the first paragraph?",
            "options": [
              "to describe what happened during the Battle of Worcester",
              "to give an account of the circumstances leading to Charles II’s escape",
              "to provide details of the Parliamentarians’ political views",
              "to compare Charles II’s beliefs with those of his father"
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Why does the reviewer include examples of the fugitives’ behaviour in the third paragraph?",
            "options": [
              "to explain how close Charles II came to losing his life",
              "to suggest that Charles II’s supporters were badly prepared",
              "to illustrate how the events of the six weeks are brought to life",
              "to argue that certain aspects are not as well known as they should be"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "What point does the reviewer make about Charles II in the fourth paragraph?",
            "options": [
              "He chose to celebrate what was essentially a defeat.",
              "He misunderstood the motives of his opponents.",
              "He aimed to restore people’s faith in the monarchy.",
              "He was driven by a desire to be popular."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "What does the reviewer say about Charles Spencer in the fifth paragraph?",
            "options": [
              "His decision to write the book comes as a surprise.",
              "He takes an unbiased approach to the subject matter.",
              "His descriptions of events would be better if they included more detail.",
              "He chooses language that is suitable for a twenty-first-century audience."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "When the reviewer says the book ‘doesn’t quite hit the mark’, she is making the point that",
            "options": [
              "it overlooks the impact of events on ordinary people.",
              "it lacks an analysis of prevalent views on monarchy.",
              "it omits any references to the deceit practised by Charles II during his time in hiding.",
              "it fails to address whether Charles II’s experiences had a lasting influence on him."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-17-2",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-17-academic-reading-test-2/",
    "sections": [
      {
        "section": 1,
        "title": "The Dead Sea Scrolls",
        "contentHtml": "<h2>The Dead Sea Scrolls</h2><p>In late 1946 or early 1947, three Bedouin teenagers were tending their goats and sheep near the ancient settlement of Qumran, located on the northwest shore of the Dead Sea in what is now known as the West Bank. One of these young shepherds tossed a rock into an opening on the side of a cliff and was surprised to hear a shattering sound. He and his companions later entered the cave and stumbled across a collection of large clay jars, seven of which contained scrolls with writing on them.</p><p>The teenagers took the seven scrolls to a nearby town where they were sold for a small sum to a local antiquities dealer. Word of the find spread, and Bedouins and archaeologists eventually unearthed tens of thousands of additional scroll fragments from 10 nearby caves; together they make up between 800 and 900 manuscripts. It soon became clear that this was one of the greatest archaeological discoveries ever made.</p><p>The origin of the Dead Sea Scrolls, which were written around 2,000 years ago between 150 BCE and 70 CE, is still the subject of scholarly debate even today. According to the prevailing theory, they are the work of a population that inhabited the area until Roman troops destroyed the settlement around 70 CE. The area was known as Judea at that time, and the people are thought to have belonged to a group called the Essenes, a devout Jewish sect.</p><p>The majority of the texts on the Dead Sea Scrolls are in Hebrew, with some fragments written in an ancient version of its alphabet thought to have fallen out of use in the fifth century BCE. But there are other languages as well. Some scrolls are in Aramaic, the language spoken by many inhabitants of the region from the sixth century BCE to the siege of Jerusalem in 70 CE. In addition, several texts feature translations of the Hebrew Bible into Greek.</p><p>The Dead Sea Scrolls include fragments from every book of the Old Testament of the Bible except for the Book of Esther. The only entire book of the Hebrew Bible preserved among the manuscripts from Qumran is Isaiah; this copy, dated to the first century BCE, is considered the earliest biblical manuscript still in existence. Along with biblical texts, the scrolls include documents about sectarian regulations and religious writings that do not appear in the Old Testament.</p><p>The writing on the Dead Sea Scrolls is mostly in black or occasionally red ink, and the scrolls themselves are nearly all made of either parchment (animal skin) or an early form of paper called ‘papyrus’. The only exception is the scroll numbered 3Q15, which was created out of a combination of copper and tin. Known as the Copper Scroll, this curious document features letters chiselled onto metal - perhaps, as some have theorized, to better withstand the passage of time.</p><p>One of the most intriguing manuscripts from Qumran, this is a sort of ancient treasure map that lists dozens of gold and silver caches. Using an unconventional vocabulary and odd spelling, it describes 64 underground hiding places that supposedly contain riches buried for safekeeping. None of these hoards have been recovered, possibly because the Romans pillaged Judea during the first century CE.</p><p>According to various hypotheses, the treasure belonged to local people, or was rescued from the Second Temple before its destruction or never existed to begin with.</p><p>Some of the Dead Sea Scrolls have been on interesting journeys. In 1948, a Syrian Orthodox archbishop known as Mar Samuel acquired four of the original seven scrolls from a Jerusalem shoemaker and part-time antiquity dealer, paying less than $100 for them. He then travelled to the United States and unsuccessfully offered them to a number of universities, including Yale.</p><p>Finally, in 1954, he placed an advertisement in the business newspaper The Wall Street Journal - under the category ‘Miscellaneous Items for Sale’ - that read: ‘Biblical Manuscripts dating back to at least 200 B.C. are for sale. This would be an ideal gift to an educational or religious institution by an individual or group.’ Fortunately, Israeli archaeologist and statesman Yigael Yadin negotiated their purchase and brought the scrolls back to Jerusalem, where they remain to this day.</p><p>In 2017, researchers from the University of Haifa restored and deciphered one of the last untranslated scrolls. The university’s Eshbal Ratson and Jonathan Ben-Dov spent one year reassembling the 60 fragments that make up the scroll. Deciphered from a band of coded text on parchment, the find provides insight into the community of people who wrote it and the 364-day calendar they would have used.</p><p>The scroll names celebrations that indicate shifts in seasons and details two yearly religious events known from another Dead Sea Scroll. Only one more known scroll remains untranslated.</p>"
      },
      {
        "section": 2,
        "title": "A second attempt at domesticating the tomato",
        "contentHtml": "<h2>A second attempt at domesticating the tomato</h2><p><strong>A</strong> It took at least 3,000 years for humans to learn how to domesticate the wild tomato and cultivate it for food. Now two separate teams in Brazil and China have done it all over again in less than three years. And they have done it better in some ways, as the re-domesticated tomatoes are more nutritious than the ones we eat at present.</p><p>This approach relies on the revolutionary CRISPR genome editing technique, in which changes are deliberately made to the DNA of a living cell, allowing genetic material to be added, removed or altered. The technique could not only improve existing crops, but could also be used to turn thousands of wild plants into useful and appealing foods. In fact, a third team in the US has already begun to do this with a relative of the tomato called the groundcherry.</p><p>This fast-track domestication could help make the world’s food supply healthier and far more resistant to diseases, such as the rust fungus devastating wheat crops.</p><p>'This could transform what we eat,' says Jorg Kudla at the University of Munster in Germany, a member of the Brazilian team. 'There are 50,000 edible plants in the world, but 90 percent of our energy comes from just 15 crops.'</p><p>‘We can now mimic the known domestication course of major crops like rice, maize, sorghum or others,’ says Caixia Gao of the Chinese Academy of Sciences in Beijing. Then we might try to domesticate plants that have never been domesticated.’</p><p><strong>B</strong> Wild tomatoes, which are native to the Andes region in South America, produce pea-sized fruits. Over many generations, peoples such as the Aztecs and Incas transformed the plant by selecting and breeding plants with mutations* in their genetic structure, which resulted in desirable traits such as larger fruit.</p><p>But every time a single plant with a mutation is taken from a larger population for breeding, much genetic diversity is lost. And sometimes the desirable mutations come with less desirable traits. For instance, the tomato strains grown for supermarkets have lost much of their flavour.</p><p>By comparing the genomes of modern plants to those of their wild relatives, biologists have been working out what genetic changes occurred as plants were domesticated. The teams in Brazil and China have now used this knowledge to reintroduce these changes from scratch while maintaining or even enhancing the desirable traits of wild strains.</p><p><strong>C</strong> Kudla’s team made six changes altogether. For instance, they tripled the size of fruit by editing a gene called FRUIT WEIGHT, and increased the number of tomatoes per truss by editing another called MULTIFLORA.</p><p>While the historical domestication of tomatoes reduced levels of the red pigment lycopene - thought to have potential health benefits - the team in Brazil managed to boost it instead. The wild tomato has twice as much lycopene as cultivated ones; the newly domesticated one has five times as much.</p><p>'They are quite tasty,' says Kudla. ‘A little bit strong. And very aromatic.’</p><p>The team in China re-domesticated several strains of wild tomatoes with desirable traits lost in domesticated tomatoes. In this way they managed to create a strain resistant to a common disease called bacterial spot race, which can devastate yields. They also created another strain that is more salt tolerant - and has higher levels of vitamin C.</p><p><strong>D</strong> Meanwhile, Joyce Van Eck at the Boyce Thompson Institute in New York state decided to use the same approach to domesticate the groundcherry or goldenberry (Physalis pruinosa) for the first time. This fruit looks similar to the closely related Cape gooseberry (Physalis peruviana).</p><p>Groundcherries are already sold to a limited extent in the US but they are hard to produce because the plant has a sprawling growth habit and the small fruits fall off the branches when ripe. Van Eck’s team has edited the plants to increase fruit size, make their growth more compact and to stop fruits dropping. ‘There’s potential for this to be a commercial crop,’ says Van Eck.</p><p>But she adds that taking the work further would be expensive because of the need to pay for a licence for the CRISPR technology and get regulatory approval.</p><p><strong>E</strong> This approach could boost the use of many obscure plants, says Jonathan Jones of the Sainsbury Lab in the UK. But it will be hard for new foods to grow so popular with farmers and consumers that they become new staple crops, he thinks.</p><p>The three teams already have their eye on other plants that could be ‘catapulted into the mainstream’, including foxtail, oat-grass and cowpea. By choosing wild plants that are drought or heat tolerant, says Gao, we could create crops that will thrive even as the planet warms.</p><p>But Kudla didn’t want to reveal which species were in his team’s sights, because CRISPR has made the process so easy. ‘Any one with the right skills could go to their lab and do this.’</p><p>*mutations: changes in an organism’s genetic structure that can be passed down to later generations</p>"
      },
      {
        "section": 3,
        "title": "Insight or evolution?",
        "contentHtml": "<h2>Insight or evolution?</h2><p>Two scientists consider the origins of discoveries and other innovative behavior</p><p>Scientific discovery is popularly believed to result from the sheer genius of such intellectual stars as naturalist Charles Darwin and theoretical physicist Albert Einstein. Our view of such unique contributions to science often disregards the person’s prior experience and the efforts of their lesser-known predecessors. Conventional wisdom also places great weight on insight in promoting breakthrough scientific achievements, as if ideas spontaneously pop into someone’s head - fully formed and functional.</p><p>There may be some limited truth to this view. However, we believe that it largely misrepresents the real nature of scientific discovery, as well as that of creativity and innovation in many other realms of human endeavor.</p><p>Setting aside such greats as Darwin and Einstein - whose monumental contributions are duly celebrated - we suggest that innovation is more a process of trial and error, where two steps forward may sometimes come with one step back, as well as one or more steps to the right or left. This evolutionary view of human innovation undermines the notion of creative genius and recognizes the cumulative nature of scientific progress.</p><p>Consider one unheralded scientist: John Nicholson, a mathematical physicist working in the 1910s who postulated the existence of‘proto-elements’ in outer space. By combining different numbers of weights of these proto-elements’ atoms, Nicholson could recover the weights of all the elements in the then-known periodic table. These successes are all the more noteworthy given the fact that Nicholson was wrong about the presence of proto-elements: they do not actually exist.</p><p>Yet, amid his often fanciful theories and wild speculations, Nicholson also proposed a novel theory about the structure of atoms. Niels Bohr, the Nobel prize-winning father of modern atomic theory, jumped off from this interesting idea to conceive his now-famous model of the atom.</p><p>What are we to make of this story? One might simply conclude that science is a collective and cumulative enterprise. That may be true, but there may be a deeper insight to be gleaned. We propose that science is constantly evolving, much as species of animals do. In biological systems, organisms may display new characteristics that result from random genetic mutations. In the same way, random, arbitrary or accidental mutations of ideas may help pave the way for advances in science.</p><p>If mutations prove beneficial, then the animal or the scientific theory will continue to thrive and perhaps reproduce.</p><p>Support for this evolutionary view of behavioral innovation comes from many domains. Consider one example of an influential innovation in US horseracing. The so-called ‘acey-deucy’ stirrup placement, in which the rider’s foot in his left stirrup is placed as much as 25 centimeters lower than the right, is believed to confer important speed advantages when turning on oval tracks. It was developed by a relatively unknown jockey named Jackie Westrope.</p><p>Had Westrope conducted methodical investigations or examined extensive film records in a shrewd plan to outrun his rivals? Had he foreseen the speed advantage that would be conferred by riding acey-deucy? No. He suffered a leg injury, which left him unable to fully bend his left knee. His modification just happened to coincide with enhanced left-hand turning performance.</p><p>This led to the rapid and widespread adoption of riding acey-deucy by many riders, a racing style which continues in today’s thoroughbred racing.</p><p>Plenty of other stories show that fresh advances can arise from error, misadventure, and also pure serendipity - a happy accident. For example, in the early 1970s, two employees of the company 3M each had a problem: Spencer Silver had a product - a glue which was only slightly sticky - and no use for it, while his colleague Art Fry was trying to figure out how to affix temporary bookmarks in his hymn book without damaging its pages.</p><p>The solution to both these problems was the invention of the brilliantly simple yet phenomenally successful Post-It note. Such examples give lie to the claim that ingenious, designing minds are responsible for human creativity and invention. Far more banal and mechanical forces may be at work; forces that are fundamentally connected to the laws of science.</p><p>The notions of insight, creativity and genius are often invoked, but they remain vague and of doubtful scientific utility, especially when one considers the diverse and enduring contributions of individuals such as Plato, Leonardo da Vinci, Shakespeare, Beethoven, Galileo, Newton, Kepler, Curie, Pasteur and Edison. These notions merely label rather than explain the evolution of human innovations. We need another approach, and there is a promising candidate.</p><p>The Law of Effect was advanced by psychologist Edward Thorndike in 1898, some 40 years after Charles Darwin published his groundbreaking work on biological evolution, On the Origin of Species. This simple law holds that organisms tend to repeat successful behaviors and to refrain from performing unsuccessful ones. Just like Darwin’s Law of Natural Selection, the Law of Effect involves an entirely mechanical process of variation and selection, without any end objective in sight.</p><p>Of course, the origin of human innovation demands much further study. In particular, the provenance of the raw material on which the Law of Effect operates is not as clearly known as that of the genetic mutations on which the Law of Natural Selection operates. The generation of novel ideas and behaviors may not be entirely random, but constrained by prior successes and failures - of the current individual (such as Bohr) or of predecessors (such as Nicholson).</p><p>The time seems right for abandoning the naive notions of intelligent design and genius, and for scientifically exploring the true origins of creative behavior.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 5,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–5</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The Dead Sea Scrolls</p><p>Discovery</p><p>Qumran, 1946/7</p><p>• three Bedouin shepherds in their teens were near an opening on side of cliff</p><p>• heard a noise of breaking when one teenager threw a 1_______ </p><p>• teenagers went into the 2_______  and found a number of containers made of 3_______ </p><p>The scrolls</p><p>• date from between 150 BCE and 70 CE</p><p>• thought to have been written by group of people known as the 4_______ </p><p>• written mainly in the 5_______  language</p><p>• most are on religious topics, written using ink on parchment or papyrus</p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* heard a noise of breaking when one teenager threw a 1_______ ",
            "options": [],
            "answerKey": "rock",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* teenagers went into the 2_______  and found a number of containers made of 3_______ ",
            "options": [],
            "answerKey": "cave",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "* teenagers went into the 2_______  and found a number of containers made of 3_______ ",
            "options": [],
            "answerKey": "clay",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* thought to have been written by group of people known as the 4_______ ",
            "options": [],
            "answerKey": "Essenes",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* written mainly in the 5_______  language",
            "options": [],
            "answerKey": "Hebrew",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 6,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 6–13</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 6,
            "prompt": "The Bedouin teenagers who found the scrolls were disappointed by how little money they received for them.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "There is agreement among academics about the origin of the Dead Sea Scrolls.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Most of the books of the Bible written on the scrolls are incomplete.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "The information on the Copper Scroll is written in an unusual way.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Mar Samuel was given some of the scrolls as a gift.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "In the early 1950s, a number of educational establishments in the US were keen to buy scrolls from Mar Samuel.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "The scroll that was pieced together in 2017 contains information about annual occasions in the Qumran area 2,000 years ago.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Academics at the University of Haifa are currently researching how to decipher the final scroll.",
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
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–18</h3><p>The Reading Passage has five paragraphs, A-E.</p><p>Which section contains the following information?</p><p>Write the correct letter, A-E, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "a reference to a type of tomato that can resist a dangerous infection.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "an explanation of how problems can arise from focusing only on a certain type of tomato plant.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "a number of examples of plants that are not cultivated at present but could be useful as food sources.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "a comparison between the early domestication of the tomato and more recent research",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "a personal reaction to the flavour of a tomato that has been genetically edited",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 23,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 19–23</h3><p>Look at the following statements and the list of researchers below.</p><p>Match each statement with the correct researcher, A-D.</p><p>Write the correct letter, A-D, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Jorg Kudla",
            "Caixia Gao",
            "Joyce Van Eck",
            "Jonathan Jones"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 19,
            "prompt": "Domestication of certain plants could allow them to adapt to future environmental challenges.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "The idea of growing and eating unusual plants may not be accepted on a large scale.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "It is not advisable for the future direction of certain research to be made public.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Present efforts to domesticate one wild fruit are limited by the costs involved.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "Humans only make use of a small proportion of the plant food available on Earth.",
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
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 24–26</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• An undesirable trait such as loss of 24_______  may be caused by a mutation in a tomato gene.</p><p>• By modifying one gene in a tomato plant, researchers made the tomato three times its original 25_______ </p><p>• A type of tomato which was not badly affected by 26_______ , and was rich in vitamin C, was produced by a team of researchers in China.</p>",
        "questions": [
          {
            "number": 24,
            "prompt": "* An undesirable trait such as loss of 24_______  may be caused by a mutation in a tomato gene.",
            "options": [],
            "answerKey": "flavour",
            "acceptedAnswers": [
              "flavor"
            ]
          },
          {
            "number": 25,
            "prompt": "* By modifying one gene in a tomato plant, researchers made the tomato three times its original 25_______ ",
            "options": [],
            "answerKey": "size",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "* A type of tomato which was not badly affected by 26_______ , and was rich in vitamin C, was produced by a team of researchers in China.",
            "options": [],
            "answerKey": "salt",
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
            "prompt": "The purpose of the first paragraph is to",
            "options": [
              "defend particular ideas.",
              "compare certain beliefs.",
              "disprove a widely held view.",
              "outline a common assumption."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "What are the writers doing in the second paragraph?",
            "options": [
              "criticising an opinion",
              "justifying a standpoint",
              "explaining an approach",
              "supporting an argument"
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "In the third paragraph, what do the writers suggest about Darwin and Einstein?",
            "options": [
              "They represent an exception to a general rule.",
              "Their way of working has been misunderstood.",
              "They are an ideal which others should aspire to.",
              "Their achievements deserve greater recognition."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "John Nicholson is an example of a person whose idea",
            "options": [
              "established his reputation as an influential scientist.",
              "was only fully understood at a later point in history.",
              "laid the foundations for someone else’s breakthrough.",
              "initially met with scepticism from the scientific community."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "What is the key point of interest about the ‘acey-deucy’ stirrup placement?",
            "options": [
              "the simple reason why it was invented",
              "the enthusiasm with which it was adopted",
              "the research that went into its development",
              "the cleverness of the person who first used it"
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
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 32–36</h3><p>Do the following statements agree with the claims of the writer in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 32,
            "prompt": "Acknowledging people such as Plato or da Vinci as geniuses will help us understand the process by which great minds create new ideas.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "The Law of Effect was discovered at a time when psychologists were seeking a scientific reason why creativity occurs.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "The Law of Effect states that no planning is involved in the behaviour of organisms.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "The Law of Effect sets out clear explanations about the sources of new ideas and behaviours.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Many scientists are now turning away from the notion of intelligent design and genius.",
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
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Complete the summary using the list of words, A-G, below.</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "invention",
            "goals",
            "compromise",
            "mistakes",
            "luck",
            "inspiration",
            "experiments"
          ]
        },
        "questionHtml": "<p>The origins of creative behaviour</p><p>The traditional view of scientific discovery is that breakthroughs happen when a single great mind has sudden 37_______  . Although this can occur, it is not often the case. Advances are more likely to be the result of a longer process. In some cases, this process involves 38_______ , such as Nicholson’s theory about proto-elements. In others, simple necessity may provoke innovation, as with Westrope’s decision to modify the position of his riding stirrups.</p><p>There is also often an element of 39_______ , for example, the coincidence of ideas that led to the invention of the Post-It note. With both the Law of Natural Selection and the Law of Effect, there may be no clear 40_______  involved, but merely a process of variation and selection.</p>",
        "questions": [
          {
            "number": 37,
            "prompt": "The traditional view of scientific discovery is that breakthroughs happen when a single great mind has sudden 37_______  . Although this can occur, it is not often the case. Advances are more likely to be the result of a longer process. In some cases, this process involves 38_______ , such as Nicholson’s theory about proto-elements. In others, simple necessity may provoke innovation, as with Westrope’s decision to modify the position of his riding stirrups.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "The traditional view of scientific discovery is that breakthroughs happen when a single great mind has sudden 37_______  . Although this can occur, it is not often the case. Advances are more likely to be the result of a longer process. In some cases, this process involves 38_______ , such as Nicholson’s theory about proto-elements. In others, simple necessity may provoke innovation, as with Westrope’s decision to modify the position of his riding stirrups.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "There is also often an element of 39_______ , for example, the coincidence of ideas that led to the invention of the Post-It note. With both the Law of Natural Selection and the Law of Effect, there may be no clear 40_______  involved, but merely a process of variation and selection.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "There is also often an element of 39_______ , for example, the coincidence of ideas that led to the invention of the Post-It note. With both the Law of Natural Selection and the Law of Effect, there may be no clear 40_______  involved, but merely a process of variation and selection.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-17-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-17-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "The thylacine",
        "contentHtml": "<h2>The thylacine</h2><p>The extinct thylacine, also known as the Tasmanian tiger, was a marsupial* that bore a superficial resemblance to a dog. Its most distinguishing feature was the 13-19 dark brown stripes over its back, beginning at the rear of the body and extending onto the tail. The thylacine’s average nose-to-tail length for adult males was 162.6 cm, compared to 153.7 cm for females.</p><p>The thylacine appeared to occupy most types of terrain except dense rainforest, with open eucalyptus forest thought to be its prime habitat. In terms of feeding, it was exclusively carnivorous, and its stomach was muscular with an ability to distend so that it could eat large amounts of food at one time, probably an adaptation to compensate for long periods when hunting was unsuccessful and food scarce. The thylacine was not a fast runner and probably caught its prey by exhausting it during a long pursuit.</p><p>During long-distance chases, thylacines were likely to have relied more on scent than any other sense. They emerged to hunt during the evening, night and early morning and tended to retreat to the hills and forest for shelter during the day. Despite the common name ‘tiger’, the thylacine had a shy, nervous temperament. Although mainly nocturnal, it was sighted moving during the day and some individuals were even recorded basking in the sun.</p><p>The thylacine had an extended breeding season from winter to spring, with indications that some breeding took place throughout the year. The thylacine, like all marsupials, was tiny and hairless when born. Newborns crawled into the pouch on the belly of their mother, and attached themselves to one of the four teats, remaining there for up to three months. When old enough to leave the pouch, the young stayed in a lair such as a deep rocky cave, well-hidden nest or hollow log, whilst the mother hunted.</p><p>Approximately 4,000 years ago, the thylacine was widespread throughout New Guinea and most of mainland Australia, as well as the island of Tasmania. The most recent, well-dated occurrence of a thylacine on the mainland is a carbon-dated fossil from Murray Cave in Western Australia, which is around 3,100 years old. Its extinction coincided closely with the arrival of wild dogs called dingoes in Australia and a similar predator in New Guinea.</p><p>Dingoes never reached Tasmania, and most scientists see this as the main reason for the thylacine’s survival there.</p><p>The dramatic decline of the thylacine in Tasmania, which began in the 1830s and continued for a century, is generally attributed to the relentless efforts of sheep farmers and bounty hunters** with shotguns. While this determined campaign undoubtedly played a large part, it is likely that various other factors also contributed to the decline and eventual extinction of the species.</p><p>These include competition with wild dogs introduced by European settlers, loss of habitat along with the disappearance of prey species, and a distemper-like disease which may also have affected the thylacine.</p><p>There was only one successful attempt to breed a thylacine in captivity, at Melbourne Zoo in 1899. This was despite the large numbers that went through some zoos, particularly London Zoo and Tasmania’s Hobart Zoo.</p><p>The famous naturalist John Gould foresaw the thylacine’s demise when he published his Mammals of Australia between 1848 and 1863, writing, ‘The numbers of this singular animal will speedily diminish, extermination will have its full sway, and it will then, like the wolf of England and Scotland, be recorded as an animal of the past.’</p><p>However, there seems to have been little public pressure to preserve the thylacine, nor was much concern expressed by scientists at the decline of this species in the decades that followed. A notable exception was T.T. Flynn, Professor of Biology at the University of Tasmania. In 1914, he was sufficiently concerned about the scarcity of the thylacine to suggest that some should be captured and placed on a small island.</p><p>But it was not until 1929, with the species on the very edge of extinction, that Tasmania’s Animals and Birds Protection Board passed a motion protecting thylacines only for the month of December, which was thought to be their prime breeding season. The last known wild thylacine to be killed was shot by a farmer in the north-east of Tasmania in 1930, leaving just captive specimens.</p><p>Official protection of the species by the Tasmanian government was introduced in July 1936, 59 days before the last known individual died in Hobart Zoo on 7th September, 1936.</p><p>There have been numerous expeditions and searches for the thylacine over the years, none of which has produced definitive evidence that thylacines still exist. The species was declared extinct by the Tasmanian government in 1986.</p><p>*marsupial: a mammal, such as a kangaroo, whose young are born incompletely developed and are typically carried and suckled in a</p><p>pouch on the mother's belly</p><p>**bounty hunters: people who are paid a reward for killing a wild animal</p>"
      },
      {
        "section": 2,
        "title": "Palm oil",
        "contentHtml": "<h2>Palm oil</h2><p><strong>A</strong> Palm oil is an edible oil derived from the fruit of the African oil palm tree, and is currently the most consumed vegetable oil in the world. It’s almost certainly in the soap we wash with in the morning, the sandwich we have for lunch, and the biscuits we snack on during the day.</p><p>Why is palm oil so attractive for manufacturers? Primarily because its unique properties - such as remaining solid at room temperature - make it an ideal ingredient for long-term preservation, allowing many packaged foods on supermarket shelves to have ‘best before’ dates of months, even years, into the future.</p><p><strong>B</strong> Many farmers have seized the opportunity to maximise the planting of oil palm trees. Between 1990 and 2012, the global land area devoted to growing oil palm trees grew from 6 to 17 million hectares, now accounting for around ten percent of total cropland in the entire world.</p><p>From a mere two million tonnes of palm oil being produced annually globally 50 years ago, there are now around 60 million tonnes produced every single year, a figure looking likely to double or even triple by the middle of the century.</p><p><strong>C</strong> However, there are multiple reasons why conservationists cite the rapid spread of oil palm plantations as a major concern. There are countless news stories of deforestation, habitat destruction and dwindling species populations, all as a direct result of land clearing to establish oil palm tree monoculture on an industrial scale, particularly in Malaysia and Indonesia.</p><p>Endangered species - most famously the Sumatran orangutan, but also rhinos, elephants, tigers, and numerous other fauna - have suffered from the unstoppable spread of oil palm plantations.</p><p><strong>D</strong> ‘Palm oil is surely one of the greatest threats to global biodiversity,’ declares Dr Farnon Ellwood of the University of the West of England, Bristol. ‘Palm oil is replacing rainforest, and rainforest is where all the species are. That’s a problem.’ This has led to some radical questions among environmentalists, such as whether consumers should try to boycott palm oil entirely.</p><p>Meanwhile Bhavani Shankar, Professor at London’s School of Oriental and African Studies, argues, ‘It’s easy to say that palm oil is the enemy and we should be against it. It makes for a more dramatic story, and it’s very intuitive. But given the complexity of the argument, I think a much more nuanced story is closer to the truth.’</p><p><strong>E</strong> One response to the boycott movement has been the argument for the vital role palm oil plays in lifting many millions of people in the developing world out of poverty. Is it desirable to have palm oil boycotted, replaced, eliminated from the global supply chain, given how many low-income people in developing countries depend on it for their livelihoods? How best to strike a utilitarian balance between these competing factors has become a serious bone of contention.</p><p><strong>F</strong> Even the deforestation argument isn’t as straightforward as it seems. Oil palm plantations produce at least four and potentially up to ten times more oil per hectare than soybean, rapeseed, sunflower or other competing oils. That immensely high yield - which is predominantly what makes it so profitable - is potentially also an ecological benefit.</p><p>If ten times more palm oil can be produced from a patch of land than any competing oil, then ten times more land would need to be cleared in order to produce the same volume of oil from that competitor.</p><p>As for the question of carbon emissions, the issue really depends on what oil palm trees are replacing. Crops vary in the degree to which they sequester carbon - in other words, the amount of carbon they capture from the atmosphere and store within the plant. The more carbon a plant sequesters, the more it reduces the effect of climate change. As Shankar explains: ‘[Palm oil production] actually sequesters more carbon in some ways than other alternatives.</p><p>[...] Of course, if you’re cutting down virgin forest it’s terrible - that’s what’s happening in Indonesia and Malaysia, it’s been allowed to get out of hand. But if it’s replacing rice, for example, it might actually sequester more carbon.’</p><p><strong>G</strong> The industry is now regulated by a group called the Roundtable on Sustainable Palm Oil (RSPO), consisting of palm growers, retailers, product manufacturers, and other interested parties. Over the past decade or so, an agreement has gradually been reached regarding standards that producers of palm oil have to meet in order for their product to be regarded as officially ‘sustainable’. The RSPO insists upon no virgin forest clearing, transparency and regular assessment of carbon stocks, among other criteria.</p><p>Only once these requirements are fully satisfied is the oil allowed to be sold as certified sustainable palm oil (CSPO). Recent figures show that the RSPO now certifies around 12 million tonnes of palm oil annually, equivalent to roughly 21 percent of the world’s total palm oil production.</p><p><strong>H</strong> There is even hope that oil palm plantations might not need to be such sterile monocultures, or ‘green deserts’, as Ellwood describes them. New research at Ellwood’s lab hints at one plant which might make all the difference. The bird’s nest fern (Asplenium nidus) grows on trees in an epiphytic fashion (meaning it’s dependent on the tree only for support, not for nutrients), and is native to many tropical regions, where as a keystone species it performs a vital ecological role.</p><p>Ellwood believes that reintroducing the bird’s nest fern into oil palm plantations could potentially allow these areas to recover their biodiversity, providing a home for all manner of species, from fungi and bacteria, to invertebrates such as insects, amphibians, reptiles and even mammals.</p>"
      },
      {
        "section": 3,
        "title": "Building the Skyline: The Birth and Growth of Manhattan’s Skyscrapers",
        "contentHtml": "<h2>Building the Skyline: The Birth and Growth of Manhattan’s Skyscrapers</h2><p>Katharine L. Shester reviews a book by Jason Barr about the development of New York City</p><p>In Building the Skyline, Jason Barr takes the reader through a detailed history of New York City. The book combines geology, history, economics, and a lot of data to explain why business clusters developed where they did and how the early decisions of workers and firms shaped the skyline we see today. Building the Skyline is organized into two distinct parts.</p><p>The first is primarily historical and addresses New York’s settlement and growth from 1609 to 1900; the second deals primarily with the 20th century and is a compilation of chapters commenting on different aspects of New York’s urban development. The tone and organization of the book changes somewhat between the first and second parts, as the latter chapters incorporate aspects of Barr’s related research papers.</p><p>Barr begins chapter one by taking the reader on a ‘helicopter time-machine’ ride - giving a fascinating account of how the New York landscape in 1609 might have looked from the sky. He then moves on to a subterranean walking tour of the city, indicating the location of rock and water below the subsoil, before taking the reader back to the surface.</p><p>His love of the city comes through as he describes various fun facts about the location of the New York residence of early 19th-century vice-president Aaron Burr as well as a number of legends about the city.</p><p>Chapters two and three take the reader up to the Civil War (1861-1865), with chapter two focusing on the early development of land and the implementation of a grid system in 1811. Chapter three focuses on land use before the Civil War. Both chapters are informative and well researched and set the stage for the economic analysis that comes later in the book.</p><p>I would have liked Barr to expand upon his claim that existing tenements* prevented skyscrapers in certain neighborhoods because ‘likely no skyscraper developer was interested in performing the necessary “slum clearance’”. Later in the book, Barr makes the claim that the depth of bedrock** was not a limiting factor for developers, as foundation costs were a small fraction of the cost of development.</p><p>At first glance, it is not obvious why slum clearance would be limiting, while more expensive foundations would not.</p><p>Chapter four focuses on immigration and the location of neighborhoods and tenements in the late 19th century. Barr identifies four primary immigrant enclaves and analyzes their locations in terms of the amenities available in the area. Most of these enclaves were located on the least valuable land, between the industries located on the waterfront and the wealthy neighborhoods bordering Central Park.</p><p>Part two of the book begins with a discussion of the economics of skyscraper height. In chapter five, Barr distinguishes between engineering height, economic height, and developer height — where engineering height is the tallest building that can be safely made at a given time, economic height is the height that is most efficient from society’s point of view, and developer height is the actual height chosen by the developer, who is attempting to maximize return on investment.</p><p>Chapter five also has an interesting discussion of the technological advances that led to the construction of skyscrapers. For example, the introduction of iron and steel skeletal frames made thick, load-bearing walls unnecessary, expanding the usable square footage of buildings and increasing the use of windows and availability of natural light. Chapter six then presents data on building height throughout the 20th century and uses regression analysis to ‘predict’ building construction.</p><p>While less technical than the research paper on which the chapter is based, it is probably more technical than would be preferred by a general audience.</p><p>Chapter seven tackles the ‘bedrock myth’, the assumption that the absence of bedrock close to the surface between Downtown and Midtown New York is the reason for skyscrapers not being built between the two urban centers. Rather, Barr argues that while deeper bedrock does increase foundation costs, these costs were neither prohibitively high nor were they large compared to the overall cost of building a skyscraper.</p><p>What I enjoyed the most about this chapter was Barr’s discussion of how foundations are actually built. He describes the use of caissons, which enable workers to dig down for considerable distances, often below the water table, until they reach bedrock. Barr’s thorough technological history discusses not only how caissons work, but also the dangers involved. While this chapter references empirical research papers, it is a relatively easy read.</p><p>Chapters eight and nine focus on the birth of Midtown and the building boom of the 1920s. Chapter eight contains lengthy discussions of urban economic theory that may serve as a distraction to readers primarily interested in New York. However, they would be well-suited for undergraduates learning about the economics of cities. In the next chapter, Barr considers two of the primary explanations for the building boom of the 1920s — the first being exuberance, and the second being financing.</p><p>He uses data to assess the viability of these two explanations and finds that supply and demand factors explain much of the development of the 1920s; though it enabled the boom, cheap credit was not, he argues, the primary cause.</p><p>In the final chapter (chapter 10), Barr discusses another of his empirical papers that estimates Manhattan land values from the mid-19th century to the present day. The data work that went into these estimations is particularly impressive. Toward the end of the chapter, Barr assesses ‘whether skyscrapers are a cause or an effect of high land values’. He finds that changes in land values predict future building height, but the reverse is not true.</p><p>The book ends with an epilogue, in which Barr discusses the impact of climate change on the city and makes policy suggestions for New York going forward.</p><p>*a tenement: a multi-occupancy building of any sort, but particularly a run-down apartment building or slum building</p><p>**bedrock: the solid, hard rock in the ground that lies under a loose layer of soil</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 5,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–5</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The thylacine</p><p>Appearance and behaviour</p><p>• looked rather like a dog</p><p>• had a series of stripes along its body and tail</p><p>• ate an entirely 1_______  diet</p><p>• probably depended mainly on 2_______  when hunting</p><p>• young spent first months of life inside its mother’s 3_______ </p><p>Decline and extinction</p><p>• last evidence in mainland Australia is a 3,100-year-old 4_______ </p><p>• probably went extinct in mainland Australia due to animals known as dingoes</p><p>• reduction in 5_______  and available sources of food were partly responsible for decline in Tasmania</p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* ate an entirely 1_______  diet",
            "options": [],
            "answerKey": "carnivorous",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* probably depended mainly on 2_______  when hunting",
            "options": [],
            "answerKey": "scent",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "* young spent first months of life inside its mother’s 3_______ ",
            "options": [],
            "answerKey": "pouch",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* last evidence in mainland Australia is a 3,100-year-old 4_______ ",
            "options": [],
            "answerKey": "fossil",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* reduction in 5_______  and available sources of food were partly responsible for decline in Tasmania",
            "options": [],
            "answerKey": "habitat",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 6,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 6–13</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 6,
            "prompt": "Significant numbers of thylacines were killed by humans from the 1830s onwards.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "Several thylacines were born in zoos during the late 1800s.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "John Gould’s prediction about the thylacine surprised some biologists.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "In the early 1900s, many scientists became worried about the possible extinction of the thylacine.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "T.T. Flynn’s proposal to rehome captive thylacines on an island proved to be impractical.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "There were still reasonable numbers of thylacines in existence when a piece of legislation protecting the species during their breeding season was passed.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "From 1930 to 1936, the only known living thylacines were all in captivity.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Attempts to find living thylacines are now rarely made.",
            "options": [],
            "answerKey": "NOT GIVEN",
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
        "instructionHtml": "<h3>Questions 14–20</h3><p>The Reading Passage has eight paragraphs, A-H.</p><p>Which section contains the following information?</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p>",
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
            "prompt": "examples of a range of potential environmental advantages of oil palm tree cultivation",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "description of an organisation which controls the environmental impact of palm oil production",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "examples of the widespread global use of palm oil",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "reference to a particular species which could benefit the ecosystem of oil palm plantations",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "figures illustrating the rapid expansion of the palm oil industry",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "an economic justification for not opposing the palm oil industry",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "examples of creatures badly affected by the establishment of oil palm plantations",
            "options": [],
            "answerKey": "C",
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
        "instructionHtml": "<h3>Questions 21–22</h3><p>Choose TWO letters, A-E.</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 21,
            "prompt": "Which TWO statements are made about the Roundtable on Sustainable Palm Oil (RSPO)?",
            "options": [
              "Its membership has grown steadily over the course of the last decade.",
              "It demands that certified producers be open and honest about their practices.",
              "It took several years to establish its set of criteria for sustainable palm oil certification.",
              "Its regulations regarding sustainability are stricter than those governing other industries.",
              "It was formed at the request of environmentalists concerned about the loss of virgin forests."
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "C"
            ]
          },
          {
            "number": 22,
            "prompt": "Which TWO statements are made about the Roundtable on Sustainable Palm Oil (RSPO)?",
            "options": [
              "Its membership has grown steadily over the course of the last decade.",
              "It demands that certified producers be open and honest about their practices.",
              "It took several years to establish its set of criteria for sustainable palm oil certification.",
              "Its regulations regarding sustainability are stricter than those governing other industries.",
              "It was formed at the request of environmentalists concerned about the loss of virgin forests."
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
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 23–26</h3><p>Complete the sentences below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• One advantage of palm oil for manufacturers is that it stays 23_______  even when not refrigerated.</p><p>• The 24_______  is the best known of the animals suffering habitat loss as a result of the spread of oil palm plantations.</p><p>• As one of its criteria for the certification of sustainable palm oil, the RSPO insists that growers check 25_______  on a routine basis.</p><p>• Ellwood and his researchers are looking into whether the bird’s nest fern could restore 26_______  in areas where oil palm trees are grown.</p>",
        "questions": [
          {
            "number": 23,
            "prompt": "* One advantage of palm oil for manufacturers is that it stays 23_______  even when not refrigerated.",
            "options": [],
            "answerKey": "solid",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "* The 24_______  is the best known of the animals suffering habitat loss as a result of the spread of oil palm plantations.",
            "options": [],
            "answerKey": "Sumatran orangutan",
            "acceptedAnswers": [
              "orangutan",
              "Sumatran orang-utan",
              "orang-utan"
            ]
          },
          {
            "number": 25,
            "prompt": "* As one of its criteria for the certification of sustainable palm oil, the RSPO insists that growers check 25_______  on a routine basis.",
            "options": [],
            "answerKey": "carbon stocks",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "* Ellwood and his researchers are looking into whether the bird’s nest fern could restore 26_______  in areas where oil palm trees are grown.",
            "options": [],
            "answerKey": "biodiversity",
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
            "prompt": "What point does Shester make about Barr’s book in the first paragraph?",
            "options": [
              "It gives a highly original explanation for urban development.",
              "Elements of Barr’s research papers are incorporated throughout the book.",
              "Other books that are available on the subject have taken a different approach.",
              "It covers a range of factors that affected the development of New York."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "How does Shester respond to the information in the book about tenements?",
            "options": [
              "She describes the reasons for Barr’s interest.",
              "She indicates a potential problem with Barr’s analysis.",
              "She compares Barr’s conclusion with that of other writers.",
              "She provides details about the sources Barr used for his research."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "What does Shester say about chapter six of the book?",
            "options": [
              "It contains conflicting data.",
              "It focuses too much on possible trends.",
              "It is too specialised for most readers.",
              "It draws on research that is out of date."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "What does Shester suggest about the chapters focusing on the 1920s building boom?",
            "options": [
              "The information should have been organised differently.",
              "More facts are needed about the way construction was financed.",
              "The explanation that is given for the building boom is unlikely.",
              "Some parts will have limited appeal to certain people."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "What impresses Shester the most about the chapter on land values?",
            "options": [
              "the broad time period that is covered",
              "the interesting questions that Barr asks",
              "the nature of the research into the topic",
              "the recommendations Barr makes for the future"
            ],
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
            "prompt": "The description in the first chapter of how New York probably looked from the air in the early 1600s lacks interest.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Chapters two and three prepare the reader well for material yet to come.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "The biggest problem for many nineteenth-century New York immigrant neighbourhoods was a lack of amenities.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "In the nineteenth century, New York’s immigrant neighbourhoods tended to concentrate around the harbour.",
            "options": [],
            "answerKey": "NO",
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
        "instructionHtml": "<h3>Questions 36–40</h3><p>Complete the summary using the list of phrases, A-J, below.</p><p>Write the correct letter, A-J, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "development plans",
            "deep excavations",
            "great distance",
            "excessive expense",
            "impossible tasks",
            "associated risks",
            "water level",
            "specific areas",
            "total expenditure",
            "construction guidelines"
          ]
        },
        "questionHtml": "<p>The bedrock myth</p><p>In chapter seven, Barr indicates how the lack of bedrock close to the surface does not explain why skyscrapers are absent from 36_______ . He points out that although the cost of foundations increases when bedrock is deep below the surface, this cannot be regarded as 37_______ , especially when compared to 38_______ .</p><p>A particularly enjoyable part of the chapter was Barr’s account of how foundations are built. He describes not only how 39_______  are made possible by the use of caissons, but he also discusses their 40_______ . The chapter is well researched but relatively easy to understand.</p>",
        "questions": [
          {
            "number": 36,
            "prompt": "In chapter seven, Barr indicates how the lack of bedrock close to the surface does not explain why skyscrapers are absent from 36_______ . He points out that although the cost of foundations increases when bedrock is deep below the surface, this cannot be regarded as 37_______ , especially when compared to 38_______ .",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "In chapter seven, Barr indicates how the lack of bedrock close to the surface does not explain why skyscrapers are absent from 36_______ . He points out that although the cost of foundations increases when bedrock is deep below the surface, this cannot be regarded as 37_______ , especially when compared to 38_______ .",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "In chapter seven, Barr indicates how the lack of bedrock close to the surface does not explain why skyscrapers are absent from 36_______ . He points out that although the cost of foundations increases when bedrock is deep below the surface, this cannot be regarded as 37_______ , especially when compared to 38_______ .",
            "options": [],
            "answerKey": "I",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "A particularly enjoyable part of the chapter was Barr’s account of how foundations are built. He describes not only how 39_______  are made possible by the use of caissons, but he also discusses their 40_______ . The chapter is well researched but relatively easy to understand.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "A particularly enjoyable part of the chapter was Barr’s account of how foundations are built. He describes not only how 39_______  are made possible by the use of caissons, but he also discusses their 40_______ . The chapter is well researched but relatively easy to understand.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-17-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-17-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "Bats to the rescue",
        "contentHtml": "<h2>Bats to the rescue</h2><p>How Madagascar’s bats are helping to save the rainforest</p><p>There are few places in the world where relations between agriculture and conservation are more strained. Madagascar’s forests are being converted to agricultural land at a rate of one percent every year. Much of this destruction is fuelled by the cultivation of the country’s main staple crop: rice. And a key reason for this destruction is that insect pests are destroying vast quantities of what is grown by local subsistence farmers, leading them to clear forest to create new paddy fields.</p><p>The result is devastating habitat and biodiversity loss on the island, but not all species are suffering. In fact, some of the island’s insectivorous bats are currently thriving and this has important implications for farmers and conservationists alike.</p><p>Enter University of Cambridge zoologist Ricardo Rocha. He’s passionate about conservation, and bats. More specifically, he’s interested in how bats are responding to human activity and deforestation in particular. Rocha’s new study shows that several species of bats are giving Madagascar’s rice farmers a vital pest control service by feasting on plagues of insects. And this, he believes, can ease the financial pressure on farmers to turn forest into fields.</p><p>Bats comprise roughly one-fifth of all mammal species in Madagascar and thirty-six recorded bat species are native to the island, making it one of the most important regions for conservation of this animal group anywhere in the world.</p><p>Co-leading an international team of scientists, Rocha found that several species of indigenous bats are taking advantage of habitat modification to hunt insects swarming above the country’s rice fields. They include the Malagasy mouse-eared bat, Major’s long-fingered bat, the Malagasy white-bellied free-tailed bat and Peters’ wrinkle-lipped bat.</p><p>‘These winner species are providing a valuable free service to Madagascar as biological pest suppressors,’ says Rocha. ‘We found that six species of bat are preying on rice pests, including the paddy swarming caterpillar and grass webworm. The damage which these insects cause puts the island’s farmers under huge financial pressure and that encourages deforestation.’</p><p>The study, now published in the journal Agriculture, Ecosystems and Environment, set out to investigate the feeding activity of insectivorous bats in the farmland bordering the Ranomafana National Park in the southeast of the country.</p><p>Rocha and his team used state-of-the-art ultrasonic recorders to record over a thousand bat ‘feeding buzzes’ (echolocation sequences used by bats to target their prey) at 54 sites, in order to identify the favourite feeding spots of the bats. They next used DNA barcoding techniques to analyse droppings collected from bats at the different sites.</p><p>The recordings revealed that bat activity over rice fields was much higher than it was in continuous forest - seven times higher over rice fields which were on flat ground, and sixteen times higher over fields on the sides of hills - leaving no doubt that the animals are preferentially foraging in these man-made ecosystems. The researchers suggest that the bats favour these fields because lack of water and nutrient run-off make these crops more susceptible to insect pest infestations.</p><p>DNA analysis showed that all six species of bat had fed on economically important insect pests. While the findings indicated that rice farming benefits most from the bats, the scientists also found indications that the bats were consuming pests of other crops, including the black twig borer (which infests coffee plants), the sugarcane cicada, the macadamia nut-borer, and the sober tabby (a pest of citrus fruits).</p><p>‘The effectiveness of bats as pest controllers has already been proven in the USA and Catalonia,’ said co-author James Kemp, from the University of Lisbon. ‘But our study is the first to show this happening in Madagascar, where the stakes for both farmers and conservationists are so high.’</p><p>Local people may have a further reason to be grateful to their bats. While the animal is often associated with spreading disease, Rocha and his team found evidence that Malagasy bats feed not just on crop pests but also on mosquitoes - carriers of malaria, Rift Valley fever virus and elephantiasis - as well as blackflies, which spread river blindness.</p><p>Rocha points out that the relationship is complicated. When food is scarce, bats become a crucial source of protein for local people. Even the children will hunt them. And as well as roosting in trees, the bats sometimes roost in buildings, but are not welcomed there because they make them unclean. At the same time, however, they are associated with sacred caves and the ancestors, so they can be viewed as beings between worlds, which makes them very significant in the culture of the people.</p><p>And one potential problem is that while these bats are benefiting from farming, at the same time deforestation is reducing the places where they can roost, which could have long-term effects on their numbers. Rocha says, ‘With the right help, we hope that farmers can promote this mutually beneficial relationship by installing bat houses.’</p><p>Rocha and his colleagues believe that maximising bat populations can help to boost crop yields and promote sustainable livelihoods. The team is now calling for further research to quantify this contribution. ‘I’m very optimistic,’ says Rocha. ‘If we give nature a hand, we can speed up the process of regeneration.’</p>"
      },
      {
        "section": 2,
        "title": "Does education fuel economic growth?",
        "contentHtml": "<h2>Does education fuel economic growth?</h2><p><strong>A</strong> Over the last decade, a huge database about the lives of southwest German villagers between 1600 and 1900 has been compiled by a team led by Professor Sheilagh Ogilvie at Cambridge University’s Faculty of Economics. It includes court records, guild ledgers, parish registers, village censuses, tax lists and - the most recent addition - 9,000 handwritten inventories listing over a million personal possessions belonging to ordinary women and men across three centuries.</p><p>Ogilvie, who discovered the inventories in the archives of two German communities 30 years ago, believes they may hold the answer to a conundrum that has long puzzled economists: the lack of evidence for a causal link between education and a country’s economic growth.</p><p><strong>B</strong> As Ogilvie explains, ‘Education helps us to work more productively, invent better technology, and earn more ... surely it must be critical for economic growth? But, if you look back through history, there’s no evidence that having a high literacy rate made a country industrialise earlier.’ Between 1600 and 1900, England had only mediocre literacy rates by European standards, yet its economy grew fast and it was the first country to industrialise.</p><p>During this period, Germany and Scandinavia had excellent literacy rates, but their economies grew slowly and they industrialised late. ‘Modern cross-country analyses have also struggled to find evidence that education causes economic growth, even though there is plenty of evidence that growth increases education,’ she adds.</p><p><strong>C</strong> In the handwritten inventories that Ogilvie is analysing are the belongings of women and men at marriage, remarriage and death. From badger skins to Bibles, sewing machines to scarlet bodices - the villagers’ entire worldly goods are included. Inventories of agricultural equipment and craft tools reveal economic activities; ownership of books and education-related objects like pens and slates suggests how people learned.</p><p>In addition, the tax lists included in the database record the value of farms, workshops, assets and debts; signatures and people’s estimates of their age indicate literacy and numeracy levels; and court records reveal obstacles (such as the activities of the guilds*) that stifled industry.</p><p>Previous studies usually had just one way of linking education with economic growth - the presence of schools and printing presses, perhaps, or school enrolment, or the ability to sign names. According to Ogilvie, the database provides multiple indicators for the same individuals, making it possible to analyse links between literacy, numeracy, wealth, and industriousness, for individual women and men over the long term.</p><p><strong>D</strong> Ogilvie and her team have been building the vast database of material possessions on top of their full demographic reconstruction of the people who lived in these two German communities. ‘We can follow the same people - and their descendants - across 300 years of educational and economic change,’ she says. Individual lives have unfolded before their eyes.</p><p>Stories like that of the 24-year-olds Ana Regina and Magdalena Riethmullerin, who were chastised in 1707 for reading books in church instead of listening to the sermon. ‘This tells us they were continuing to develop their reading skills at least a decade after leaving school,’ explains Ogilvie.</p><p>The database also reveals the case of Juliana Schweickherdt, a 50-year-old spinster living in the small Black Forest community of Wildberg, who was reprimanded in 1752 by the local weavers’ guild for ‘weaving cloth and combing wool, counter to the guild ordinance’. When Juliana continued taking jobs reserved for male guild members, she was summoned before the guild court and told to pay a fine equivalent to one third of a servant’s annual wage.</p><p>It was a small act of defiance by today’s standards, but it reflects a time when laws in Germany and elsewhere regulated people’s access to labour markets. The dominance of guilds not only prevented people from using their skills, but also held back even the simplest industrial innovation.</p><p><strong>E</strong> The data-gathering phase of the project has been completed and now, according to Ogilvie, it is time ‘to ask the big questions’. One way to look at whether education causes economic growth is to ‘hold wealth constant’. This involves following the lives of different people with the same level of wealth over a period of time.</p><p>If wealth is constant, it is possible to discover whether education was, for example, linked to the cultivation of new crops, or to the adoption of industrial innovations like sewing machines. The team will also ask what aspect of education helped people engage more with productive and innovative activities. Was it, for instance, literacy, numeracy, book ownership, years of schooling? Was there a threshold level - a tipping point - that needed to be reached to affect economic performance?</p><p><strong>F</strong> Ogilvie hopes to start finding answers to these questions over the next few years. One thing is already clear, she says: the relationship between education and economic growth is far from straightforward. ‘German-speaking central Europe is an excellent laboratory for testing theories of economic growth,’ she explains. Between 1600 and 1900, literacy rates and book ownership were high and yet the region remained poor.</p><p>It was also the case that local guilds and merchant associations were extremely powerful and legislated against anything that undermined their monopolies. In villages throughout the region, guilds blocked labour migration and resisted changes that might reduce their influence.</p><p>‘Early findings suggest that the potential benefits of education for the economy can be held back by other barriers, and this has implications for today,’ says Ogilvie. ‘Huge amounts are spent improving education in developing countries, but this spending can fail to deliver economic growth if restrictions block people - especially women and the poor - from using their education in economically productive ways. If economic institutions are poorly set up, for instance, education can’t lead to growth.’</p><p>*guild: an association of artisans or merchants which oversees the practice of their craft or trade in a particular area</p>"
      },
      {
        "section": 3,
        "title": "Timur Gareyev - blindfold chess champion",
        "contentHtml": "<h2>Timur Gareyev - blindfold chess champion</h2><p><strong>A</strong> Next month, a chess player named Timur Gareyev will take on nearly 50 opponents at once. But that is not the hard part. While his challengers will play the games as normal, Gareyev himself will be blindfolded. Even by world record standards, it sets a high bar for human performance. The 28-year-old already stands out in the rarefied world of blindfold chess. He has a fondness for bright clothes and unusual hairstyles, and he gets his kicks from the adventure sport of BASE jumping.</p><p>He has already proved himself a strong chess player, too. In a 10-hour chess marathon in 2013, Gareyev played 33 games in his head simultaneously. He won 29 and lost none. The skill has become his brand: he calls himself the Blindfold King.</p><p><strong>B</strong> But Gareyev’s prowess has drawn interest from beyond the chess-playing community. In the hope of understanding how he and others like him can perform such mental feats, researchers at the University of California in Los Angeles (UCLA) called him in for tests. They now have their first results. The ability to play a game of chess with your eyes closed is not a far reach for most accomplished players,’ said Jesse Rissman, who runs a memory lab at UCLA.</p><p>‘But the thing that’s so remarkable about Timur and a few other individuals is the number of games they can keep active at once. To me it is simply astonishing.’</p><p><strong>C</strong> Gareyev learned to play chess in his native Uzbekistan when he was six years old. Tutored by his grandfather, he entered his first tournament aged eight and soon became obsessed with competitions. At 16, he was crowned Asia’s youngest ever chess grandmaster. He moved to the US soon after, and as a student helped his university win its first national chess championship. In 2013, Gareyev was ranked the third best chess player in the US.</p><p><strong>D</strong> To the uninitiated, blindfold chess seems to call for superhuman skill. But displays of the feat go back centuries. The first recorded game in Europe was played in 13th-century Florence. In 1947, the Argentinian grandmaster Miguel Najdorf played 45 simultaneous games in his mind, winning 39 in the 24-hour session.</p><p><strong>E</strong> Accomplished players can develop the skill of playing blind even without realising it. The nature of the game is to run through possible moves in the mind to see how they play out. From this, regular players develop a memory for the patterns the pieces make, the defences and attacks. ‘You recreate it in your mind,’ said Gareyev. ‘A lot of players are capable of doing what I’m doing.’ The real mental challenge comes from playing multiple games at once in the head.</p><p>Not only must the positions of each piece on every board be memorised, they must be recalled faithfully when needed, updated with each player’s moves, and then reliably stored again, so the brain can move on to the next board. First moves can be tough to remember because they are fairly uninteresting. But the ends of games are taxing too, as exhaustion sets in. When Gareyev is tired, his recall can get patchy. He sometimes makes moves based on only a fragmented memory of the pieces’ positions.</p><p><strong>F</strong> The scientists first had Gareyev perform some standard memory tests. These assessed his ability to hold numbers, pictures and words in mind. One classic test measures how many numbers a person can repeat, both forwards and backwards, soon after hearing them. Most people manage about seven. ‘He was not exceptional on any of these standard tests,’ said Rissman. ‘We didn’t find anything other than playing chess that he seems to be supremely gifted at.’ But next came the brain scans.</p><p>With Gareyev lying down in the machine, Rissman looked at how well connected the various regions of the chess player’s brain were. Though the results are tentative and as yet unpublished, the scans found much greater than average communication between parts of Gareyev’s brain that make up what is called the frontoparietal control network. Of 63 people scanned alongside the chess player, only one or two scored more highly on the measure. ‘You use this network in almost any complex task.</p><p>It helps you to allocate attention, keep rules in mind, and work out whether you should be responding or not,’ said Rissman.</p><p><strong>G</strong> It was not the only hint of something special in Gareyev’s brain. The scans also suggest that Gareyev’s visual network is more highly connected to other brain parts than usual. Initial results suggest that the areas of his brain that process visual images - such as chess boards - may have stronger links to other brain regions, and so be more powerful than normal. While the analyses are not finalised yet, they may hold the first clues to Gareyev’s extraordinary ability.</p><p><strong>H</strong> For the world record attempt, Gareyev hopes to play 47 blindfold games at once in about 16 hours. He will need to win 80% to claim the title. ‘I don’t worry too much about the winning percentage, that’s never been an issue for me,’ he said. ‘The most important part of blindfold chess for me is that I have found the one thing that I can fully dedicate myself to. I miss having an obsession.’</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 6,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–6</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "Many Madagascan forests are being destroyed by attacks from insects.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Loss of habitat has badly affected insectivorous bats in Madagascar.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Ricardo Rocha has carried out studies of bats in different parts of the world.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Habitat modification has resulted in indigenous bats in Madagascar becoming useful to farmers.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "The Malagasy mouse-eared bat is more common than other indigenous bat species in Madagascar.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Bats may feed on paddy swarming caterpillars and grass webworms.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 7,
        "to": 13,
        "type": "fill",
        "displayType": "table-completion",
        "instructionHtml": "<h3>Questions 7–13</h3><p>Complete the table below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The study carried out by Rocha’s team</p><table><tbody><tr><td>Aim</td><td><p>• to investigate the feeding habits of bats in farmland near the Ranomafana National Park</p></td></tr><tr><td>Method</td><td><p>• ultrasonic recording to identify favourite feeding spots</p><p>• DNA analysis of bat 7_______ </p></td></tr><tr><td>Findings</td><td><p>• the bats</p><p>– were most active in rice fields located on hills – ate pests of rice, 8_______ , sugarcane, nuts and fruit – prevent the spread of disease by eating 9_______  and blackflies</p><p>• local attitudes to bats are mixed:</p><p>– they provide food rich in 10_______  – the buildings where they roost become 11_______  – they play an important role in local 12_______ </p></td></tr><tr><td>Recommendation</td><td><p>• farmers should provide special 13_______  to support the bat population</p></td></tr></tbody></table>",
        "questions": [
          {
            "number": 7,
            "prompt": "* DNA analysis of bat 7_______ ",
            "options": [],
            "answerKey": "droppings",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "– were most active in rice fields located on hills – ate pests of rice, 8_______ , sugarcane, nuts and fruit – prevent the spread of disease by eating 9_______  and blackflies",
            "options": [],
            "answerKey": "coffee",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "– were most active in rice fields located on hills – ate pests of rice, 8_______ , sugarcane, nuts and fruit – prevent the spread of disease by eating 9_______  and blackflies",
            "options": [],
            "answerKey": "mosquitoes",
            "acceptedAnswers": [
              "mosquitos"
            ]
          },
          {
            "number": 10,
            "prompt": "– they provide food rich in 10_______  – the buildings where they roost become 11_______  – they play an important role in local 12_______ ",
            "options": [],
            "answerKey": "protein",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "– they provide food rich in 10_______  – the buildings where they roost become 11_______  – they play an important role in local 12_______ ",
            "options": [],
            "answerKey": "unclean",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "– they provide food rich in 10_______  – the buildings where they roost become 11_______  – they play an important role in local 12_______ ",
            "options": [],
            "answerKey": "culture",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "* farmers should provide special 13_______  to support the bat population",
            "options": [],
            "answerKey": "houses",
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
        "instructionHtml": "<h3>Questions 14–18</h3><p>The Reading Passage has six paragraphs, A-F.</p><p>Which section contains the following information?</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
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
            "prompt": "an explanation of the need for research to focus on individuals with a fairly consistent income",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "examples of the sources the database has been compiled from",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "an account of one individual’s refusal to obey an order",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "a reference to a region being particularly suited to research into the link between education and economic growth",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "examples of the items included in a list of personal possessions",
            "options": [],
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
        "instructionHtml": "<h3>Questions 19–22</h3><p>Complete the summary below.</p><p>Choose ONE WORD from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Demographic reconstruction of two German communities</p><p>The database that Ogilvie and her team has compiled sheds light on the lives of a range of individuals, as well as those of their 19_______ , over a 300-year period. For example, Ana Regina and Magdalena Riethmüllerin were reprimanded for reading while they should have been paying attention to a 20_______ .</p><p>There was also Juliana Schweickherdt, who came to the notice of the weavers’ guild in the year 1752 for breaking guild rules. As a punishment, she was later given a 21_______ . Cases like this illustrate how the guilds could prevent 22_______  and stop skilled people from working</p>",
        "questions": [
          {
            "number": 19,
            "prompt": "The database that Ogilvie and her team has compiled sheds light on the lives of a range of individuals, as well as those of their 19_______ , over a 300-year period. For example, Ana Regina and Magdalena Riethmüllerin were reprimanded for reading while they should have been paying attention to a 20_______ .",
            "options": [],
            "answerKey": "descendants",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "The database that Ogilvie and her team has compiled sheds light on the lives of a range of individuals, as well as those of their 19_______ , over a 300-year period. For example, Ana Regina and Magdalena Riethmüllerin were reprimanded for reading while they should have been paying attention to a 20_______ .",
            "options": [],
            "answerKey": "sermon",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "There was also Juliana Schweickherdt, who came to the notice of the weavers’ guild in the year 1752 for breaking guild rules. As a punishment, she was later given a 21_______ . Cases like this illustrate how the guilds could prevent 22_______  and stop skilled people from working",
            "options": [],
            "answerKey": "fine",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "There was also Juliana Schweickherdt, who came to the notice of the weavers’ guild in the year 1752 for breaking guild rules. As a punishment, she was later given a 21_______ . Cases like this illustrate how the guilds could prevent 22_______  and stop skilled people from working",
            "options": [],
            "answerKey": "innovation",
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
            "prompt": "Which TWO of the following statements does the writer make about literacy rates in Section B?",
            "options": [
              "Very little research has been done into the link between high literacy rates and improved earnings.",
              "Literacy rates in Germany between 1600 and 1900 were very good.",
              "There is strong evidence that high literacy rates in the modern world result in economic growth.",
              "England is a good example of how high literacy rates helped a country industrialise.",
              "Economic growth can help to improve literacy rates."
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "E"
            ]
          },
          {
            "number": 24,
            "prompt": "Which TWO of the following statements does the writer make about literacy rates in Section B?",
            "options": [
              "Very little research has been done into the link between high literacy rates and improved earnings.",
              "Literacy rates in Germany between 1600 and 1900 were very good.",
              "There is strong evidence that high literacy rates in the modern world result in economic growth.",
              "England is a good example of how high literacy rates helped a country industrialise.",
              "Economic growth can help to improve literacy rates."
            ],
            "answerKey": "E",
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
        "instructionHtml": "<h3>Questions 25–26</h3><p>Choose TWO letters, A-E.</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 25,
            "prompt": "Which TWO of the following statements does the writer make in Section F about guilds in German-speaking Central Europe between 1600 and 1900?",
            "options": [
              "They helped young people to learn a skill.",
              "They were opposed to people moving to an area for work.",
              "They kept better records than guilds in other parts of the world.",
              "They opposed practices that threatened their control over a trade.",
              "They predominantly consisted of wealthy merchants."
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 26,
            "prompt": "Which TWO of the following statements does the writer make in Section F about guilds in German-speaking Central Europe between 1600 and 1900?",
            "options": [
              "They helped young people to learn a skill.",
              "They were opposed to people moving to an area for work.",
              "They kept better records than guilds in other parts of the world.",
              "They opposed practices that threatened their control over a trade.",
              "They predominantly consisted of wealthy merchants."
            ],
            "answerKey": "D",
            "acceptedAnswers": [
              "B"
            ]
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 32,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 27–32</h3><p>The Reading Passage has eight paragraphs, A-H.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
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
            "prompt": "a reference to earlier examples of blindfold chess",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "an outline of what blindfold chess involves",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "a claim that Gareyev’s skill is limited to chess",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "why Gareyev’s skill is of interest to scientists",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "an outline of Gareyev’s priorities",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "a reason why the last part of a game may be difficult",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 33,
        "to": 36,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 33–36</h3><p>Do the following statements agree with the information given in the Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 33,
            "prompt": "In the forthcoming games, all the participants will be blindfolded.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Gareyev has won competitions in BASE jumping.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "UCLA is the first university to carry out research into blindfold chess players.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Good chess players are likely to be able to play blindfold chess.",
            "options": [],
            "answerKey": "TRUE",
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
        "instructionHtml": "<h3>Questions 37–40</h3><p>Complete the summary below</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>How the research was carried out</p><p>The researchers started by testing Gareyev’s 37_______ ; for example, he was required to recall a string of 38_______  in order and also in reverse order. Although his performance was normal, scans showed an unusual amount of 39_______  within the areas of Gareyev’s brain that are concerned with directing attention. In addition, the scans raised the possibility of unusual strength in the parts of his brain that deal with 40_______  input.</p>",
        "questions": [
          {
            "number": 37,
            "prompt": "The researchers started by testing Gareyev’s 37_______ ; for example, he was required to recall a string of 38_______  in order and also in reverse order. Although his performance was normal, scans showed an unusual amount of 39_______  within the areas of Gareyev’s brain that are concerned with directing attention. In addition, the scans raised the possibility of unusual strength in the parts of his brain that deal with 40_______  input.",
            "options": [],
            "answerKey": "memory",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "The researchers started by testing Gareyev’s 37_______ ; for example, he was required to recall a string of 38_______  in order and also in reverse order. Although his performance was normal, scans showed an unusual amount of 39_______  within the areas of Gareyev’s brain that are concerned with directing attention. In addition, the scans raised the possibility of unusual strength in the parts of his brain that deal with 40_______  input.",
            "options": [],
            "answerKey": "numbers",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "The researchers started by testing Gareyev’s 37_______ ; for example, he was required to recall a string of 38_______  in order and also in reverse order. Although his performance was normal, scans showed an unusual amount of 39_______  within the areas of Gareyev’s brain that are concerned with directing attention. In addition, the scans raised the possibility of unusual strength in the parts of his brain that deal with 40_______  input.",
            "options": [],
            "answerKey": "communication",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "The researchers started by testing Gareyev’s 37_______ ; for example, he was required to recall a string of 38_______  in order and also in reverse order. Although his performance was normal, scans showed an unusual amount of 39_______  within the areas of Gareyev’s brain that are concerned with directing attention. In addition, the scans raised the possibility of unusual strength in the parts of his brain that deal with 40_______  input.",
            "options": [],
            "answerKey": "visual",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-18-1",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-18-academic-reading-test-1/",
    "sections": [
      {
        "section": 1,
        "title": "Urban farming",
        "contentHtml": "<h2>Urban farming</h2><p>In Paris, urban farmers are trying a soil-free approach to agriculture that uses less space and fewer resources. Could it help cities face the threats to our food supplies?</p><p>On top of a striking new exhibition hall in southern Paris, the world’s largest urban rooftop farm has started to bear fruit. Strawberries that are small, intensely flavoured and resplendently red sprout abundantly from large plastic tubes. Peer inside and you see the tubes are completely hollow, the roots of dozens of strawberry plants dangling down inside them. From identical vertical tubes nearby burst row upon row of lettuces; near those are aromatic herbs, such as basil, sage and peppermint.</p><p>Opposite, in narrow, horizontal trays packed not with soil but with coconut fibre, grow cherry tomatoes, shiny aubergines and brightly coloured chards.</p><p>Pascal Hardy, an engineer and sustainable development consultant, began experimenting with vertical farming and aeroponic growing towers- as the soil-free plastic tubes are known – on his Paris apartment block roof five years ago. The urban rooftop space above the exhibition hall is somewhat bigger: 14,000 square metres and almost exactly the size of a couple of football pitches. Already, the team of young urban farmers who tend it have picked, in one day, 3,000 lettuces and 150 punnets of strawberries.</p><p>When the remaining two thirds of the vast open area are in production, 20 staff will harvest up to 1,000 kg of perhaps 35 different varieties of fruit and vegetables, every day. ‘We’re not ever, obviously, going to feed the whole city this way,’ cautions Hardy. ‘In the urban environment you’re working with very significant practical constraints, clearly, on what you can do and where.</p><p>But if enough unused space can be developed like this, there’s no reason why you shouldn’t eventually target maybe between 5% and 10% of consumption.’</p><p>Perhaps most significantly, however, this is a real-life showcase for the work of Hardy’s flourishing urban agriculture consultancy, Agripolis, which is currently fielding enquiries from around the world to design, build and equip a new breed of soil-free inner-city farm. ‘The method’s advantages are many,’ he says.</p><p>‘First, I don’t much like the fact that most of the fruit and vegetables we eat have been treated with something like 17 different pesticides, or that the intensive farming techniques that produced them are such huge generators of greenhouse gases.</p><p>I don’t much like the fact, either, that they’ve travelled an average of 2,000 refrigerated kilometres to my plate, that their quality is so poor, because the varieties are selected for their capacity to withstand such substantial journeys, or that 80% of the price I pay goes to wholesalers and transport companies, not the producers.’</p><p>Produce grown using this soil-free method, on the other hand- which relies solely on a small quantity of water, enriched with organic nutrients, pumped around a closed circuit of pipes, towers and trays- is ‘produced up here, and sold locally, just down there. It barely travels at all,’ Hardy says.</p><p>‘You can select crop varieties for their flavour, not their resistance to the transport and storage chain, and you can pick them when they’re really at their best, and not before.’ No soil is exhausted, and the water that gently showers the plants’ roots every 12 minutes is recycled, so the method uses 90% less water than a classic intensive farm for the same yield.</p><p>Urban farming is not, of course, a new phenomenon. Inner-city agriculture is booming from Shanghai to Detroit and Tokyo to Bangkok. Strawberries are being grown in disused shipping containers, mushrooms in underground carparks. Aeroponic farming, he says, is ‘virtuous’. The equipment weighs little, can be installed on almost any flat surface and is cheap to buy: roughly €100 to €150 per square metre. It is cheap to run, too, consuming a tiny fraction of the electricity used by some techniques.</p><p>Produce grown this way typically sells at prices that, while generally higher than those of classic intensive agriculture, are lower than soil-based organic growers. There are limits to what farmers can grow this way, of course, and much of the produce is suited to the summer months. ‘Root vegetables we cannot do, at least not yet,’ he says. ‘Radishes are OK, but carrots, potatoes, that kind of thing- the roots are simply too long. Fruit trees are obviously not an option.</p><p>And beans tend to take up a lot of space for not much return.’ Nevertheless, urban farming of the kind being practised in Paris is one part of a bigger and fast-changing picture that is bringing food production closer to our lives.</p>"
      },
      {
        "section": 2,
        "title": "Forest management in Pennsylvania, USA",
        "contentHtml": "<h2>Forest management in Pennsylvania, USA</h2><p>How managing low-quality wood (also known as low-use wood) for bioenergy can encourage sustainable forest management</p><p><strong>A</strong> A tree’s ‘value’ depends on several factors including its species, size, form, condition, quality, function, and accessibility, and depends on the management goals for a given forest. The same tree can be valued very differently by each person who looks at it. A large, straight black cherry tree has high value as timber to be cut into logs or made into furniture, but for a landowner more interested in wildlife habitat, the real value of that stem (or trunk) may be the food it provides to animals.</p><p>Likewise, if the tree suffers from black knot disease, its value for timber decreases, but to a woodworker interested in making bowls, it brings an opportunity for a unique and beautiful piece of art.</p><p><strong>B</strong> In the past, Pennsylvania landowners were solely interested in the value of their trees as high-quality timber. The norm was to remove the stems of highest quality and leave behind poorly formed trees that were not as well suited to the site where they grew. This practice, called ‘high-grading’, has left a legacy of ‘low-use wood’ in the forests. Some people even call these ‘junk trees’, and they are abundant in Pennsylvania.</p><p>These trees have lower economic value for traditional timber markets, compete for growth with higher-value trees, shade out desirable regeneration and decrease the health of a stand leaving it more vulnerable to poor weather and disease. Management that specifically targets low-use wood can help landowners manage these forest health issues, and wood energy markets help promote this.</p><p><strong>C</strong> Wood energy markets can accept less expensive wood material of lower quality than would be suitable for traditional timber markets. Most wood used for energy in Pennsylvania is used to produce heat or electricity through combustion. Many schools and hospitals use wood boiler systems to heat and power their facilities, many homes are primarily heated with wood, and some coal plants incorporate wood into their coal streams to produce electricity.</p><p>Wood can also be gasified for electrical generation and can even be made into liquid fuels like ethanol and gasoline for lorries and cars. All these products are made primarily from low-use wood. Several tree- and plant-cutting approaches, which could greatly improve the long-term quality of a forest, focus strongly or solely on the use of wood for those markets.</p><p><strong>D</strong> One such approach is called a Timber Stand Improvement (TSI) Cut. In a TSI Cut, really poor-quality tree and plant material is cut down to allow more space, light, and other resources to the highest-valued stems that remain. Removing invasive plants might be another primary goal of a TSI Cut. The stems that are left behind might then grow in size and develop more foliage and larger crowns or tops that produce more coverage for wildlife; they have a better chance to regenerate in a less crowded environment.</p><p>TSI Cuts can be tailored to one farmer’s specific management goals for his or her land.</p><p><strong>E</strong> Another approach that might yield a high amount of low-use wood is a Salvage Cut. With the many pests and pathogens visiting forests including hemlock wooly adelgid, Asian longhomed beetle, emerald ash borer, and gypsy moth, to name just a few, it is important to remember that those working in the forests can help ease these issues through cutting procedures. These types of cut reduce the number of sick trees and seek to manage the future spread of a pest problem.</p><p>They leave vigorous trees that have stayed healthy enough to survive the outbreak.</p><p><strong>F</strong> A Shelterwood Cut, which only takes place in a mature forest that has already been thinned several times, involves removing all the mature trees when other seedlings have become established. This then allows the forester to decide which tree species are regenerated. It leaves a young forest where all trees are at a similar point in their growth. It can also be used to develop a two-tier forest so that there are two harvests and the money that comes in is spread out over a decade or more.</p><p><strong>G</strong> Thinnings and dense and dead wood removal for fire prevention also center on the production of low-use wood. However, it is important to remember that some retention of what many would classify as low-use wood is very important. The tops of trees that have been cut down should be left on the site so that their nutrients cycle back into the soil. In addition, trees with many cavities are extremely important habitats for insect predators like woodpeckers, bats and small mammals.</p><p>They help control problem insects and increase the health and resilience of the forest. It is also important to remember that not all small trees are low-use. For example, many species like hawthorn provide food for wildlife. Finally, rare species of trees in a forest should also stay behind as they add to its structural diversity.</p><p>*Stand – An area covered with trees that have common features (e.g. size)</p>"
      },
      {
        "section": 3,
        "title": "Conquering Earth’s space junk problem",
        "contentHtml": "<h2>Conquering Earth’s space junk problem</h2><p>Satellites, rocket shards and collision debris are creating major traffic risks in orbit around the planet. Researchers are working to reduce these threats</p><p><strong>A</strong> Last year, commercial companies, military and civil departments and amateurs sent more than 400 satellites into orbit, over four times the yearly average in the previous decade. Numbers could rise even more sharply if leading space companies follow through on plans to deploy hundreds to thousands of large constellations of satellites to space in the next few years.</p><p>All that traffic can lead to disaster. Ten years ago, a US commercial Iridium satellite smashed into an inactive Russian communications satellite called Cosmos-2251, creating thousands of new pieces of space shrapnel that now threaten other satellites in low Earth orbit – the zone stretching up to 2,000 kilometres in altitude. Altogether, there are roughly 20,000 human-made objects in orbit, from working satellites to small rocket pieces.</p><p>And satellite operators can’t steer away from every potential crash, because each move consumes time and fuel that could otherwise be used for the spacecraft’s main job.</p><p><strong>B</strong> Concern about space junk goes back to the beginning of the satellite era, but the number of objects in orbit is rising so rapidly that researchers are investigating new ways of attacking the problem. Several teams are trying to improve methods for assessing what is in orbit, so that satellite operators can work more efficiently in ever-more-crowded space. Some researchers are now starting to compile a massive data set that includes the best possible information on where everything is in orbit.</p><p>Others are developing taxonomies of space – working on measuring properties such as the shape and size of an object, so that satellite operators know how much to worry about what’s coming their way.</p><p>The alternative, many say, is unthinkable. Just a few uncontrolled space crashes could generate enough debris to set off a runaway cascade of fragments, rendering near-Earth space unusable. ‘If we go on like this, we will reach a point of no return,’ says Carolin Frueh, an astrodynamical researcher at Purdue University in West Lafayette, Indiana.</p><p><strong>C</strong> Even as our ability to monitor space objects increases, so too does the total number of items in orbit. That means companies, governments and other players in space are collaborating in new ways to avoid a shared threat. International groups such as the Inter-Agency Space Debris Coordination Committee have developed guidelines on space sustainability. Those include inactivating satellites at the end of their useful life by venting pressurised materials or leftover fuel that might lead to explosions.</p><p>The intergovernmental groups also advise lowering satellites deep enough into the atmosphere that they will burn up or disintegrate within 25 years. But so far, only about half of all missions have abided by this 25-year goal, says Holger Krag, head of the European Space Agency’s space-debris office in Darmstadt, Germany.</p><p>Operators of the planned large constellations of satellites say they will be responsible stewards in their enterprises in space, but Krag worries that problems could increase, despite their best intentions. ‘What happens to those that fail or go bankrupt?’ he asks. They are probably not going to spend money to remove their satellites from space.’</p><p><strong>D</strong> In theory, given the vastness of space, satellite operators should have plenty of room for all these missions to fly safely without ever nearing another object. So some scientists are tackling the problem of space junk by trying to find out where all the debris is to a high degree of precision. That would alleviate the need for many of the unnecessary manoeuvres that are carried out to avoid potential collisions.</p><p>‘If you knew precisely where everything was, you would almost never have a problem,’ says Marlon Sorge, a space-debris specialist at the Aerospace Corporation in El Segundo, California.</p><p><strong>E</strong> The field is called space traffic management, because it’s similar to managing traffic on the roads or in the air. Think about a busy day at an airport, says Moriba Jah, an astrodynamicist at the University of Texas at Austin: planes line up in the sky, landing and taking off close to one another in a carefully choreographed routine. Air-traffic controllers know the location of the planes down to one metre in accuracy. The same can’t be said for space debris.</p><p>Not all objects in orbit are known, and even those included in databases are not tracked consistently.</p><p><strong>F</strong> An additional problem is that there is no authoritative catalogue that accurately lists the orbits of all known space debris. Jah illustrates this with a web-based database that he has developed. It draws on several sources, such as catalogues maintained by the US and Russian governments, to visualise where objects are in space. When he types in an identifier for a particular space object, the database draws a purple line to designate its orbit.</p><p>Only this doesn’t quite work for a number of objects, such as a Russian rocket body designated in the database as object number 32280. When Jah enters that number, the database draws two purple lines: the US and Russian sources contain two completely different orbits for the same object. Jah says that it is almost impossible to tell which is correct, unless a third source of information made it possible to cross-correlate.</p><p>Jah describes himself as a space environmentalist: ‘I want to make space a place that is safe to operate, that is free and useful for generations to come.’ Until that happens, he argues, the space community will continue devolving into a tragedy in which all spaceflight operators are polluting a common resource.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 3,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 1–3</h3><p>Complete the sentences below.</p><p>Choose NO MORE THAN TWO WORDS ANDIOR A NUMBER from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Urban farming in Paris</p><p>• Vertical tubes are used to grow strawberries, 1_______  and herbs.</p><p>• There will eventually be a daily harvest of as much as 2_______  in weight of fruit and vegetables.</p><p>• It may be possible that the farm’s produce will account for as much as 10% of the city’s 3_______  overall.</p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* Vertical tubes are used to grow strawberries, 1_______  and herbs.",
            "options": [],
            "answerKey": "lettuces",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "* There will eventually be a daily harvest of as much as 2_______  in weight of fruit and vegetables.",
            "options": [],
            "answerKey": "1,000 kg",
            "acceptedAnswers": [
              "1000 kg"
            ]
          },
          {
            "number": 3,
            "prompt": "* It may be possible that the farm’s produce will account for as much as 10% of the city’s 3_______  overall.",
            "options": [],
            "answerKey": "consumption",
            "acceptedAnswers": [
              "food consumption"
            ]
          }
        ]
      },
      {
        "section": 1,
        "from": 4,
        "to": 7,
        "type": "fill",
        "displayType": "table-completion",
        "instructionHtml": "<h3>Questions 4–7</h3><p>Complete the table below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Intensive farming versus aeroponic urban farming</p><table><tbody><tr><td></td><td>Growth</td><td>Selection</td><td>Sale</td></tr><tr><td>Intensive farming</td><td><p>• wide range of 4_______  used</p><p>• techniques pollute air</p></td><td><p>• quality not good</p><p>• varieties of fruit and vegetables chosen that can survive long 5_______ </p></td><td><p>• 6_______  receive very little of overall income</p></td></tr><tr><td>Aeroponic urban farming</td><td><p>• no soil used</p><p>• nutrients added to water, which is recycled</p></td><td><p>• produce chosen because of its 7_______ </p></td><td></td></tr></tbody></table>",
        "questions": [
          {
            "number": 4,
            "prompt": "* wide range of 4_______  used",
            "options": [],
            "answerKey": "pesticides",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* varieties of fruit and vegetables chosen that can survive long 5_______ ",
            "options": [],
            "answerKey": "journeys",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "* 6_______  receive very little of overall income",
            "options": [],
            "answerKey": "producers",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "* produce chosen because of its 7_______ ",
            "options": [],
            "answerKey": "flavour",
            "acceptedAnswers": [
              "flavor"
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
            "prompt": "Urban farming can take place above or below ground.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "Some of the equipment used in aeroponic farming can be made by hand.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Urban farming relies more on electricity than some other types of farming.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Fruit and vegetables grown on an aeroponic urban farm are cheaper than traditionally grown organic produce.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Most produce can be grown on an aeroponic urban farm at any time of the year.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Beans take longer to grow on an urban farm than other vegetables.",
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
            "prompt": "bad outcomes for a forest when people focus only on its financial reward",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "reference to the aspects of any tree that contribute to its worth",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "mention of the potential use of wood to help run vehicles",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "examples of insects that attack trees",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "aan alternative name for trees that produce low-use wood",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 21,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 19–21</h3><p>Look at the following purposes and the list of timber cuts below.</p><p>Match each purpose with the correct timber cut, A, B or C.</p><p>Write the correct letter, A, B or C, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "a TSI Cut",
            "a Salvage Cut",
            "a Shelterwood Cut"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 19,
            "prompt": "to remove trees that are diseased",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "to generate income across a number of years",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "to create a forest whose trees are close in age",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 22,
        "to": 26,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 22–26</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• Some dead wood is removed to avoid the possibility of 22_______ .</p><p>• The 23_______  from the tops of cut trees can help improve soil quality.</p><p>• Some damaged trees should be left, as their 24_______  provide habitats for a range of creatures.</p><p>• Some trees that are small, such as 25_______ , are a source of food for animals and insects.</p><p>• Any trees that are 26_______  should be left to grow, as they add to the variety of species in the forest.</p>",
        "questions": [
          {
            "number": 22,
            "prompt": "* Some dead wood is removed to avoid the possibility of 22_______ .",
            "options": [],
            "answerKey": "fire",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "* The 23_______  from the tops of cut trees can help improve soil quality.",
            "options": [],
            "answerKey": "nutrients",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "* Some damaged trees should be left, as their 24_______  provide habitats for a range of creatures.",
            "options": [],
            "answerKey": "cavities",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "* Some trees that are small, such as 25_______ , are a source of food for animals and insects.",
            "options": [],
            "answerKey": "hawthorn",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "* Any trees that are 26_______  should be left to grow, as they add to the variety of species in the forest.",
            "options": [],
            "answerKey": "rare",
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
        "instructionHtml": "<h3>Questions 27–31</h3><p>The Reading Passage has six sections, A-F.</p><p>Which section contains the following information?</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
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
            "prompt": "a reference to the cooperation that takes place to try and minimise risk",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "an explanation of a person’s aims",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "a description of a major collision that occurred in space",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "a comparison between tracking objects in space and the efficiency of a transportation system",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "a reference to efforts to classify space junk",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 35,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 32–35</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The Inter-Agency Space Debris Coordination Committee</p><p>The committee gives advice on how the 32_______  of space can be achieved. The committee advises that when satellites are no longer active, any unused 33_______  or pressurised material that could cause 34_______  should be removed.</p><p>Although operators of large satellite constellations accept that they have obligations as stewards of space, Holger Krag points out that the operators that become 35_______  are unlikely to prioritise removing their satellites from space.</p>",
        "questions": [
          {
            "number": 32,
            "prompt": "The committee gives advice on how the 32_______  of space can be achieved. The committee advises that when satellites are no longer active, any unused 33_______  or pressurised material that could cause 34_______  should be removed.",
            "options": [],
            "answerKey": "sustainability",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "The committee gives advice on how the 32_______  of space can be achieved. The committee advises that when satellites are no longer active, any unused 33_______  or pressurised material that could cause 34_______  should be removed.",
            "options": [],
            "answerKey": "fuel",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "The committee gives advice on how the 32_______  of space can be achieved. The committee advises that when satellites are no longer active, any unused 33_______  or pressurised material that could cause 34_______  should be removed.",
            "options": [],
            "answerKey": "explosions",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Although operators of large satellite constellations accept that they have obligations as stewards of space, Holger Krag points out that the operators that become 35_______  are unlikely to prioritise removing their satellites from space.",
            "options": [],
            "answerKey": "bankrupt",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 36,
        "to": 40,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 36–40</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person, A, B, C or D.</p><p>Write the correct letter, A, B, C or D, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Carolin Frueh",
            "Holger Krag",
            "Marlon Sorge",
            "Moriba Jah"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 36,
            "prompt": "Knowing the exact location of space junk would help prevent any possible danger.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Space should be available to everyone and should be preserved for the future.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "A recommendation regarding satellites is widely ignored.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "There is conflicting information about where some satellites are in space.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "There is a risk we will not be able to undo the damage that occurs in space.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-18-2",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-18-academic-reading-test-2/",
    "sections": [
      {
        "section": 1,
        "title": "Stonehenge",
        "contentHtml": "<h2>Stonehenge</h2><p>For centuries, historians and archaeologists have puzzled over the many mysteries of Stonehenge, a prehistoric monument that took an estimated 1,500 years to erect. Located on Salisbury Plain in southern England, it is comprised of roughly 100 massive upright stones placed in a circular layout.</p><p>Archaeologists believe England’s most iconic prehistoric ruin was built in several stages with the earliest constructed 5,000 or more years ago. First, Neolithic* Britons used primitive tools, which may have been fashioned out of deer antlers, to dig a massive circular ditch and bank, or henge. Deep pits dating back to that era and located within the circle may have once held a ring of timber posts, according to some scholars.</p><p>Several hundred years later, it is thought, Stonehenge’s builders hoisted an estimated 80 bluestones, 43 of which remain today, into standing positions and placed them in either a horseshoe or circular formation. These stones have been traced all the way to the Preseli Hills in Wales, some 300 kilometres from Stonehenge. How, then, did prehistoric builders without sophisticated tools or engineering haul these boulders, which weigh up to four tons, over such a great distance?</p><p>According to one long-standing theory among archaeologists, Stonehenge’s builders fashioned sledges and rollers out of tree trunks to lug the bluestones from the Preseli Hills. They then transferred the boulders onto rafts and floated them first along the Welsh coast and then up the River Avon toward Salisbury Plain; alternatively, they may have towed each stone with a fleet of vessels.</p><p>More recent archaeological hypotheses have them transporting the bluestones with supersized wicker baskets on a combination of ball bearings and long grooved planks, hauled by oxen.</p><p>As early as the 1970s, geologists have been adding their voices to the debate over how Stonehenge came into being. Challenging the classic image of industrious builders pushing, carting, rolling or hauling giant stones from faraway Wales, some scientists have suggested that it was glaciers, not humans, that carried the bluestones to Salisbury Plain.</p><p>Most archaeologists have remained sceptical about this theory, however, wondering how the forces of nature could possibly have delivered the exact number of stones needed to complete the circle.</p><p>The third phase of construction took place around 2000 BCE. At this point, sandstone slabs – known as ‘sarsens’ – were arranged into an outer crescent or ring; some were assembled into the iconic three-pieced structures called trilithons that stand tall in the centre of Stonehenge. Some 50 of these stones are now visible on the site, which may once have contained many more.</p><p>Radiocarbon dating has revealed that work continued at Stonehenge until roughly 1600 BCE, with the bluestones in particular being repositioned multiple times.</p><p>But who were the builders of Stonehenge? In the 17th century, archaeologist John Aubrey made the claim that Stonehenge was the work of druids, who had important religious, judicial and political roles in Celtic** society. This theory was widely popularized by the antiquarian William Stukeley, who had unearthed primitive graves at the site. Even today, people who identify as modern druids continue to gather at Stonehenge for the summer solstice.</p><p>However, in the mid-20th century, radiocarbon dating demonstrated that Stonehenge stood more than 1,000 years before the Celts inhabited the region.</p><p>Many modern historians and archaeologists now agree that several distinct tribes of people contributed to Stonehenge, each undertaking a different phase of its construction. Bones, tools and other artefacts found on the site seem to support this hypothesis. The first stage was achieved by Neolithic agrarians who were likely to have been indigenous to the British Isles. Later, it is believed, groups with advanced tools and a more communal way of life left their mark on the site.</p><p>Some believe that they were immigrants from the European continent, while others maintain that they were probably native Britons, descended from the original builders.</p><p>If the facts surrounding the architects and construction of Stonehenge remain shadowy at best, the purpose of the striking monument is even more of a mystery. While there is consensus among the majority of modern scholars that Stonehenge once served the function of burial ground, they have yet to determine what other purposes it had.</p><p>In the 1960s, the astronomer Gerald Hawkins suggested that the cluster of megalithic stones operated as a form of calendar, with different points corresponding to astrological phenomena such as solstices, equinoxes and eclipses occurring at different times of the year.</p><p>While his theory has received a considerable amount of attention over the decades, critics maintain that Stonehenge’s builders probably lacked the knowledge necessary to predict such events or that England’s dense cloud cover would have obscured their view of the skies.</p><p>More recently, signs of illness and injury in the human remains unearthed at Stonehenge led a group of British archaeologists to speculate that it was considered a place of healing, perhaps because bluestones were thought to have curative powers.</p><p>* Neolithic – The era, also known as the New Stone Age, which began around 12,000 years ago and ended around 3500 BCE</p><p>** Celtic – The Celts were people who lived in Britain and northwest Europe during the Iron Age from 600 BCE to 43 CE</p>"
      },
      {
        "section": 2,
        "title": "Living with artificial intelligence",
        "contentHtml": "<h2>Living with artificial intelligence</h2><p>Powerful artificial intelligence (AI) needs to be reliably aligned with human values, but</p><p>does this mean AI will eventually have to</p><p>police those values?</p><p>This has been the decade of AI, with one astonishing feat after another. A chess-playing AI that can defeat not only all human chess players, but also all previous human-programmed chess machines, after learning the game in just four hours? That’s yesterday’s news, what’s next? True, these prodigious accomplishments are all in so-called narrow AI, where machines perform highly specialised tasks. But many experts believe this restriction is very temporary.</p><p>By mid-century, we may have artificial general intelligence (AGI) – machines that can achieve human-level performance on the full range of tasks that we ourselves can tackle.</p><p>If so, there’s little reason to think it will stop there. Machines will be free of many of the physical constraints on human intelligence. Our brains run at slow biochemical processing speeds on the power of a light bulb, and their size is restricted by the dimensions of the human birth canal. It is remarkable what they accomplish, given these handicaps. But they may be as far from the physical limits of thought as our eyes are from the incredibly powerful Webb Space Telescope.</p><p>Once machines are better than us at designing even smarter machines, progress towards these limits could accelerate. What would this mean for us? Could we ensure a safe and worthwhile coexistence with such machines? On the plus side, AI is already useful and profitable for many things, and super AI might be expected to be super useful and super profitable. But the more powerful AI becomes, the more important it will be to specify its goals with great care.</p><p>Folklore is full of tales of people who ask for the wrong thing, with disastrous consequences- King Midas, for example, might have wished that everything he touched turned to gold, but didn’t really intend this to apply to his breakfast.</p><p>So we need to create powerful AI machines that are ‘human-friendly’- that have goals reliably aligned with our own values. One thing that makes this task difficult is that we are far from reliably human-friendly ourselves. We do many terrible things to each other and to many other creatures with whom we share the planet. If superintendent machines don’t do a lot better than us, we’ll be in deep trouble. We’ll have powerful new intelligence amplifying the dark sides of our own fallible natures.</p><p>For safety’s sake, then, we want the machines to be ethically as well as cognitively superhuman. We want them to aim for the moral high ground, not for the troughs in which many of us spend some of our time. Luckily they’ll be smart enough for the job. If there are routes to the moral high ground, they’ll be better than us at finding them, and steering us in the right direction.</p><p>However, there are two big problems with this utopian vision. One is how we get the machines started on the journey, the other is what it would mean to reach this destination. The ‘getting started’ problem is that we need to tell the machines what they’re looking for with sufficient clarity that we can be confident they will find it – whatever ‘it’ actually turns out to be. This won’t be easy, given that we are tribal creatures and conflicted about the ideals ourselves.</p><p>We often ignore the suffering of strangers, and even contribute to it, at least indirectly. How then, do we point machines in the direction of something better?</p><p>As for the ‘destination’ problem, we might, by putting ourselves in the hands of these moral guides and gatekeepers, be sacrificing our own autonomy – an important part of what makes us human. Machines who are better than us at sticking to the moral high ground may be expected to discourage some of the lapses we presently take for granted. We might lose our freedom to discriminate in favour of our own communities, for example.</p><p>Loss of freedom to behave badly isn’t always a bad thing, of course: denying ourselves the freedom to put children to work in factories, or to smoke in restaurants are signs of progress. But are we ready for ethical silicon police limiting our options? They might be so good at doing it that we won’t notice them; but few of us are likely to welcome such a future.</p><p>These issues might seem far-fetched, but they are to some extent already here. AI already has some input into how resources are used in our National Health Service (NHS) here in the UK, for example. If it was given a greater role, it might do so much more efficiently than humans can manage, and act in the interests of taxpayers and those who use the health system. However, we’d be depriving some humans (e.g. senior doctors) of the control they presently enjoy.</p><p>Since we’d want to ensure that people are treated equally and that policies are fair, the goals of AI would need to be specified correctly.</p><p>We have a new powerful technology to deal with- itself, literally, a new way of thinking. For our own safety, we need to point these new thinkers in the right direction, and get them to act well for us. It is not yet clear whether this is possible, but if it is, it will require a cooperative spirit, and a willingness to set aside self-interest.</p><p>Both general intelligence and moral reasoning are often thought to be uniquely human capacities. But safety seems to require that we think of them as a package: if we are to give general intelligence to machines, we’ll need to give them moral authority, too. And where exactly would that leave human beings? All the more reason to think about the destination now, and to be careful about what we wish for.</p>"
      },
      {
        "section": 3,
        "title": "An ideal city",
        "contentHtml": "<h2>An ideal city</h2><p>Leonardo da Vinci’s ideal city was centuries ahead of its time</p><p>The word ‘genius’ is universally associated with the name of Leonardo da Vinci. A true Renaissance man, he embodied scientific spirit, artistic talent and humanist sensibilities. Five hundred years have passed since Leonardo died in his home at Chateau du Clos Luce, outside Tours, France. Yet far from fading into insignificance, his thinking has carried down the centuries and still surprises today.</p><p>The Renaissance marked the transition from the 15th century to modernity and took place after the spread of the plague in the 14th century, which caused a global crisis resulting in some 200 million deaths across Europe and Asia. Today, the world is on the cusp of a climate crisis, which is predicted to cause widespread displacement, extinctions and death, if left unaddressed. Then, as now, radical solutions were called for to revolutionise the way people lived and safeguard humanity against catastrophe.</p><p>Around 1486 – after a pestilence that killed half the population in Milan, Italy – Leonardo turned his thoughts to urban planning problems. Following a typical Renaissance trend, he began to work on an ‘ideal city’ project, which – due to its excessive costs – would remain unfulfilled. Yet given that unsustainable urban models are a key cause of global climate change today, it’s only natural to wonder how Leonardo might have changed the shape of modem cities.</p><p>Although the Renaissance is renowned as an era of incredible progress in art and architecture, it is rarely noted that the 15th century also marked the birth of urbanism as a true academic discipline. The rigour and method behind the conscious conception of a city had been largely missing in Western thought until the moment when prominent Renaissance men pushed forward large-scale urban projects in Italy, such as the reconfiguration of the town of Pienza and the expansion of the city of Ferrara.</p><p>These works surely inspired Leonardo’s decision to rethink the design of medieval cities, with their winding and overcrowded streets and with houses piled against one another.</p><p>It is not easy to identify a coordinated vision of Leonardo’s ideal city because of his disordered way of working with notes and sketches. But from the largest collection of Leonardo’s papers ever assembled, a series of innovative thoughts can be reconstructed regarding the foundation of a new city along the Ticino River, which runs from Switzerland into Italy and is 248 kilometres long.</p><p>He designed the city for the easy transport of goods and clean urban spaces, and he wanted a comfortable and spacious city, with well-ordered streets and architecture. He recommended ‘high, strong walls’, with ‘towers and battlements of all necessary and pleasant beauty’.</p><p>His plans for a modem and ‘rational’ city were consistent with Renaissance ideals. But, in keeping with his personality, Leonardo included several innovations in his urban design. Leonardo wanted the city to be built on several levels, linked with vertical outdoor staircases. This design can be seen in some of today’s high-rise buildings but was unconventional at the time.</p><p>Indeed, this idea of taking full advantage of the interior spaces wasn’t implemented until the 1920s and 1930s, with the birth of the Modernist movement.</p><p>While in the upper layers of the city, people could walk undisturbed between elegant palaces and streets, the lower layer was the place for services, trade, transport and industry. But the true originality of Leonardo’s vision was its fusion of architecture and engineering. Leonardo designed extensive hydraulic plants to create artificial canals throughout the city. The canals, regulated by clocks and basins, were supposed to make it easier for boats to navigate inland.</p><p>Leonardo also thought that the width of the streets ought to match the average height of the adjacent houses: a rule still followed in many contemporary cities across Italy, to allow access to sun and reduce the risk of damage from earthquakes.</p><p>Although some of these features existed in Roman cities, before Leonardo’s drawings there had never been a multi-level, compact modem city which was thoroughly technically conceived. Indeed, it wasn’t until the 19th century that some of his ideas were applied.</p><p>For example, the subdivision of the city by function- with services and infrastructures located in the lower levels and wide and well-ventilated boulevards and walkways above for residents – is an idea that can be found in Georges-Eugene Haussmann’s renovation of Paris under Emperor Napoleon III between 1853 and 1870.</p><p>Today, Leonardo’s ideas are not simply valid, they actually suggest a way forward for urban planning. Many scholars think that the compact city, built upwards instead of outwards, integrated with nature (especially water systems), with efficient transport infrastructure, could help modem cities become more efficient and sustainable. This is yet another reason why Leonardo was aligned so closely with modem urban planning and centuries ahead of his time.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 8,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–8</h3><p>Complete the notes below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Stonehenge</p><p>Construction</p><p>Stage 1:</p><p>• the ditch and henge were dug, possibly using tools made from 1_______ </p><p>• 2_______  may have been arranged in deep pits inside the circle</p><p>Stage 2:</p><p>• bluestones from the Preseli Hills were placed in standing position</p><p>• theories about the transportation of the bluestones:</p><p>• archaeological:</p><p>• builders used 3_______  to make sledges and rollers</p><p>• 4_______  pulled them on giant baskets</p><p>• geological:</p><p>• they were brought from Wales by 5_______ </p><p>Stage 3:</p><p>• sandstone slabs were arranged into an outer crescent or ring</p><p>Builders</p><p>• a theory arose in the 17th century that its builders were Celtic 6_______ </p><p>Purpose</p><p>• many experts agree it has been used as a 7_______ site</p><p>• in the 1960s, it was suggested that it worked as a kind of 8_______ </p>",
        "questions": [
          {
            "number": 1,
            "prompt": "* the ditch and henge were dug, possibly using tools made from 1_______ ",
            "options": [],
            "answerKey": "deer antlers",
            "acceptedAnswers": [
              "antlers"
            ]
          },
          {
            "number": 2,
            "prompt": "* 2_______  may have been arranged in deep pits inside the circle",
            "options": [],
            "answerKey": "timber posts",
            "acceptedAnswers": [
              "posts"
            ]
          },
          {
            "number": 3,
            "prompt": "* builders used 3_______  to make sledges and rollers",
            "options": [],
            "answerKey": "tree trunks",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* 4_______  pulled them on giant baskets",
            "options": [],
            "answerKey": "oxen",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* they were brought from Wales by 5_______ ",
            "options": [],
            "answerKey": "glaciers",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "* a theory arose in the 17th century that its builders were Celtic 6_______ ",
            "options": [],
            "answerKey": "druids",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "* many experts agree it has been used as a 7_______ site",
            "options": [],
            "answerKey": "burial",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "* in the 1960s, it was suggested that it worked as a kind of 8_______ ",
            "options": [],
            "answerKey": "calendar",
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
            "prompt": "During the third phase of construction, sandstone slabs were placed in both the outer areas and the middle of the Stonehenge site.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "There is scientific proof that the bluestones stood in the same spot until approximately 1600 BCE.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "John Aubrey’s claim about Stonehenge was supported by 20th-century findings.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Objects discovered at Stonehenge seem to indicate that it was constructed by a number of different groups of people.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "Criticism of Gerald Hawkins’ theory about Stonehenge has come mainly from other astronomers.",
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
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 14–19</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "What point does the writer make about AI in the first paragraph?",
            "options": [
              "It is difficult to predict how quickly AI will progress.",
              "Much can be learned about the use of AI in chess machines.",
              "The future is unlikely to see limitations on the capabilities of AI.",
              "Experts disagree on which specialised tasks AI will be able to perform."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "What is the writer doing in the second paragraph?",
            "options": [
              "explaining why machines will be able to outperform humans",
              "describing the characteristics that humans and machines share",
              "giving information about the development of machine intelligence",
              "indicating which aspects of humans are the most advanced"
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Why does the writer mention the story of King Midas?",
            "options": [
              "to compare different visions of progress",
              "to illustrate that poorly defined objectives can go wrong",
              "to emphasise the need for cooperation",
              "to point out the financial advantages of a course of action"
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "What challenge does the writer refer to in the fourth paragraph?",
            "options": [
              "encouraging humans to behave in a more principled way",
              "deciding which values we want AI to share with us",
              "creating a better world for all creatures on the planet",
              "ensuring AI is more human-friendly than we are ourselves"
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "What does the writer suggest about the future of AI in the fifth paragraph?",
            "options": [
              "The safety of machines will become a key issue.",
              "It is hard to know what impact machines will have on the world.",
              "Machines will be superior to humans in certain respects.",
              "Many humans will oppose machines having a wider role."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Which of the following best summarises the writer’s argument in the sixth paragraph?",
            "options": [
              "More intelligent machines will result in greater abuses of power.",
              "Machine learning will share very few features with human learning.",
              "There are a limited number of people with the knowledge to program machines.",
              "Human shortcomings will make creating the machines we need more difficult."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 20,
        "to": 23,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 20–23</h3><p>Do the following statements agree with the claims of the writer in The Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 20,
            "prompt": "Machines with the ability to make moral decisions may prevent us from promoting the interests of our communities.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "Silicon police would need to exist in large numbers in order to be effective.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Many people are comfortable with the prospect of their independence being restricted by machines.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "If we want to ensure that machines act in our best interests, we all need to work together.",
            "options": [],
            "answerKey": "YES",
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
        "instructionHtml": "<h3>Questions 24–26</h3><p>Complete the summary using the list of phrases, A-F, below.</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "medical practitioners",
            "specialised tasks",
            "available resources",
            "reduced illness",
            "professional authority",
            "technology experts"
          ]
        },
        "questionHtml": "<p>Using AI in the UK health system</p><p>AI currently has a limited role in the way 24_______  are allocated in the health service. The positive aspect of AI having a bigger role is that it would be more efficient and lead to patient benefits. However, such a change would result, for example, in certain 25_______  not having their current level of 26_______ . It is therefore important that AI goals are appropriate so that discriminatory practices could be avoided.</p>",
        "questions": [
          {
            "number": 24,
            "prompt": "AI currently has a limited role in the way 24_______  are allocated in the health service. The positive aspect of AI having a bigger role is that it would be more efficient and lead to patient benefits. However, such a change would result, for example, in certain 25_______  not having their current level of 26_______ . It is therefore important that AI goals are appropriate so that discriminatory practices could be avoided.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "AI currently has a limited role in the way 24_______  are allocated in the health service. The positive aspect of AI having a bigger role is that it would be more efficient and lead to patient benefits. However, such a change would result, for example, in certain 25_______  not having their current level of 26_______ . It is therefore important that AI goals are appropriate so that discriminatory practices could be avoided.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "AI currently has a limited role in the way 24_______  are allocated in the health service. The positive aspect of AI having a bigger role is that it would be more efficient and lead to patient benefits. However, such a change would result, for example, in certain 25_______  not having their current level of 26_______ . It is therefore important that AI goals are appropriate so that discriminatory practices could be avoided.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 33,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 27–33</h3><p>Do the following statements agree with the information given in The Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "People first referred to Leonardo da Vinci as a genius 500 years ago.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "The current climate crisis is predicted to cause more deaths than the plague.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Some of the challenges we face today can be compared to those of earlier times.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Leonardo da Vinci’s ‘ideal city’ was constructed in the 15th century.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Poor town planning is a major contributor to climate change.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "In Renaissance times, local people fought against the changes to Pienza and Ferrara.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Leonardo da Vinci kept a neat, organised record of his designs.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 34,
        "to": 40,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 34–40</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Leonardo da Vinci’s ideal city</p><p>A collection of Leonardo da Vinci’s paperwork reveals his design of a new city beside the Ticino River. This was to provide better 34_______  for trade and a less polluted environment. Although Leonardo da Vinci’s city shared many of the ideals of his time, some of his innovations were considered unconventional in their design. They included features that can be seen in some tower blocks today, such as 35_______  on the exterior of a building.</p><p>Leonardo da Vinci wasn’t only an architect. His expertise in 36_______  was evident in his plans for artificial canals within his ideal city. He also believed that the height of houses should relate to the width of streets in case earthquakes occurred. The design of many cities in Italy today follows this 37_______ .</p><p>While some cities from 38_______  times have aspects that can also be found in Leonardo’s designs, his ideas weren’t put into practice until long after his death. 39_______  is one example of a city that was redesigned in the 19th century in the way that Leonardo had envisaged. His ideas are also relevant to today’s world, where building 40_______  no longer seems to be the best approach.</p>",
        "questions": [
          {
            "number": 34,
            "prompt": "A collection of Leonardo da Vinci’s paperwork reveals his design of a new city beside the Ticino River. This was to provide better 34_______  for trade and a less polluted environment. Although Leonardo da Vinci’s city shared many of the ideals of his time, some of his innovations were considered unconventional in their design. They included features that can be seen in some tower blocks today, such as 35_______  on the exterior of a building.",
            "options": [],
            "answerKey": "transport",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "A collection of Leonardo da Vinci’s paperwork reveals his design of a new city beside the Ticino River. This was to provide better 34_______  for trade and a less polluted environment. Although Leonardo da Vinci’s city shared many of the ideals of his time, some of his innovations were considered unconventional in their design. They included features that can be seen in some tower blocks today, such as 35_______  on the exterior of a building.",
            "options": [],
            "answerKey": "staircases",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Leonardo da Vinci wasn’t only an architect. His expertise in 36_______  was evident in his plans for artificial canals within his ideal city. He also believed that the height of houses should relate to the width of streets in case earthquakes occurred. The design of many cities in Italy today follows this 37_______ .",
            "options": [],
            "answerKey": "engineering",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Leonardo da Vinci wasn’t only an architect. His expertise in 36_______  was evident in his plans for artificial canals within his ideal city. He also believed that the height of houses should relate to the width of streets in case earthquakes occurred. The design of many cities in Italy today follows this 37_______ .",
            "options": [],
            "answerKey": "rule",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "While some cities from 38_______  times have aspects that can also be found in Leonardo’s designs, his ideas weren’t put into practice until long after his death. 39_______  is one example of a city that was redesigned in the 19th century in the way that Leonardo had envisaged. His ideas are also relevant to today’s world, where building 40_______  no longer seems to be the best approach.",
            "options": [],
            "answerKey": "Roman",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "While some cities from 38_______  times have aspects that can also be found in Leonardo’s designs, his ideas weren’t put into practice until long after his death. 39_______  is one example of a city that was redesigned in the 19th century in the way that Leonardo had envisaged. His ideas are also relevant to today’s world, where building 40_______  no longer seems to be the best approach.",
            "options": [],
            "answerKey": "Paris",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "While some cities from 38_______  times have aspects that can also be found in Leonardo’s designs, his ideas weren’t put into practice until long after his death. 39_______  is one example of a city that was redesigned in the 19th century in the way that Leonardo had envisaged. His ideas are also relevant to today’s world, where building 40_______  no longer seems to be the best approach.",
            "options": [],
            "answerKey": "outwards",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-18-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-18-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "Materials to take us beyond concrete",
        "contentHtml": "<h2>Materials to take us beyond concrete</h2><p>Concrete is everywhere, but it’s bad for the planet, generating large amounts of carbon dioxide – alternatives are being developed</p><p><strong>A</strong> Concrete is the second most used substance in the global economy, after water – and one of the world’s biggest single sources of greenhouse gas emissions. The chemical process by which cement, the key ingredient of concrete, is created results in large quantities of carbon dioxide. The UN estimates that there will be 9.8 billion people living on the planet by mid-century. They will need somewhere to live.</p><p>If concrete is the only answer to the construction of new cities, then carbon emissions will soar, aggravating global warming. And so scientists have started innovating with other materials, in a scramble for alternatives to a universal commodity that has underpinned our modem life for many years.</p><p><strong>B</strong> The problem with replacing concrete is that it is so very good at what it does. Chris Cheeseman, an engineering professor at Imperial College London, says the key thing to consider is the extent to which concrete is used around the world, and is likely to continue to be used. ‘Concrete is not a high-carbon product. Cement is high carbon, but concrete is not. But it is the scale on which it is used that makes it high carbon. The sheer scale of manufacture is so huge, that is the issue.’</p><p><strong>C</strong> Not only are the ingredients of concrete relatively cheap and found in abundance in most places around the globe, the stuff itself has marvellous properties: Portland cement, the vital component of concrete, is mouldable and pourable, but quickly sets hard. Cheeseman also notes another advantage: concrete and steel have similar thermal expansion properties, so steel can be used to reinforce concrete, making it far stronger and more flexible as a building material than it could be on its own.</p><p>According to Cheeseman, all these factors together make concrete hard to beat. ‘Concrete is amazing stuff. Making anything with similar properties is going to be very difficult.’</p><p><strong>D</strong> A possible alternative to concrete is wood. Making buildings from wood may seem like a rather medieval idea, but climate change is driving architects to turn to treated timber as a possible resource. Recent years have seen the emergence of tall buildings constructed almost entirely from timber. Vancouver, Vienna and Brumunddal in Norway are all home to constructed tall, wooden buildings.</p><p><strong>E</strong> Using wood to construct buildings, however, is not straightforward. Wood expands as it absorbs moisture from the air and is susceptible to pests, not to mention fire. But treating wood and combining it with other materials can improve its properties. Cross-laminated timber is engineered wood. An adhesive is used to stick layers of solid-sawn timber together, crosswise, to form building blocks. This material is light but has the strength of concrete and steel.</p><p>Construction experts say that wooden buildings can be constructed at a greater speed than ones of concrete and steel and the process, it seems, is quieter.</p><p><strong>F</strong> Stora Enso is Europe’s biggest supplier of cross-laminated timber, and its vice-president Markus Mannstrom reports that the company is seeing increasing demand globally for building in wood, with climate change concerns the key driver. Finland, with its large forests, where Stora Enso is based, has been leading the way, but the company is seeing a rise in demand for its timber products across the world, including in Asia.</p><p>Of course, using timber in a building also locks away the carbon that it absorbed as it grew. But even treated wood has its limitations and only when a wider range of construction projects has been proven in practice will it be possible to see wood as a real alternative to concrete in constructing tall buildings.</p><p><strong>G</strong> Fly ash and slag from iron ore are possible alternatives to cement in a concrete mix. Fly ash, a byproduct of coal-burning power plants, can be incorporated into concrete mixes to make up as much as 15 to 30% of the cement, without harming the strength or durability of the resulting mix. Iron-ore slag, a byproduct of the iron-ore smelting process, can be used in a similar way. Their incorporation into concrete mixes has the potential to reduce greenhouse gas emissions.</p><p>But Anna Surgenor, of the UK’s Green Building Council, notes that although these waste products can save carbon in the concrete mix, their use is not always straightforward. ‘It’s possible to replace the cement content in concrete with waste products to lower the overall carbon impact. But there are several calculations that need to be considered across the entire life cycle of the building- these include factoring in where these materials are being shipped from.</p><p>If they are transported over long distances, using fossil fuels, the use of alternative materials might not make sense from an overall carbon reduction perspective.’</p><p><strong>H</strong> While these technologies are all promising ideas, they are either unproven or based on materials that are not abundant. In their overview of innovation in the concrete industry, Felix Preston and Johanna Lehne of the UK’s Royal Institute of International Affairs reached the conclusion that, ‘Some novel cements have been discussed for more than a decade within the research community, without breaking through.</p><p>At present, these alternatives are rarely as cost-effective as conventional cement, and they face raw-material shortages and resistance from customers.’</p>"
      },
      {
        "section": 2,
        "title": "The steam car",
        "contentHtml": "<h2>The steam car</h2><p>The successes and failures of the Doble brothers and their steam cars</p><p><strong>A</strong> When primitive automobiles first began to appear in the 1800s, their engines were based on steam power. Steam had already enjoyed a long and successful career in the railways, so it was only natural that the technology evolved into a miniaturized version which was separate from the trains. But these early cars inherited steam’s weaknesses along with its strengths. The boilers had to be lit by hand, and they required about twenty minutes to build up pressure before they could be driven.</p><p>Furthermore, their water reservoirs only lasted for about thirty miles before needing replenishment. Despite such shortcomings, these newly designed self-propelled carriages offered quick transportation, and by the early 1900s it was not uncommon to see such machines shuttling wealthy citizens around town.</p><p><strong>B</strong> But the glory days of steam cars were few. A new technology called the Internal Combustion Engine soon appeared, which offered the ability to drive down the road just moments after starting up. At first, these noisy gasoline cars were unpopular because they were more complicated to operate and they had difficult hand-crank starters, which were known to break arms when the engines backfired.</p><p>But in 1912 General Motors introduced the electric starter, and over the following few years steam power was gradually phased out.</p><p><strong>C</strong> Even as the market was declining, four brothers made one last effort to rekindle the technology. Between 1906 and 1909, while still attending high school, Abner Doble and his three brothers built their first steam car in their parents’ basement. It comprised parts taken from a wrecked early steam car but reconfigured to drive an engine of their own design. Though it did not run well, the Doble brothers went on to build a second and third prototype in the following years.</p><p>Though the Doble boys’ third prototype, nicknamed the Model B, still lacked the convenience of an internal combustion engine, it drew the attention of automobile trade magazines due to its numerous improvements over previous steam cars. The Model B proved to be superior to gasoline automobiles in many ways. Its high-pressure steam drove the engine pistons in virtual silence, in contrast to clattering gas engines which emitted the aroma of burned hydrocarbons.</p><p>Perhaps most impressively, the Model B was amazingly swift. It could accelerate from zero to sixty miles per hour in just fifteen seconds, a feat described as ‘remarkable acceleration’ by Automobile magazine in 1914.</p><p><strong>D</strong> The following year Abner Doble drove the Model B from Massachusetts to Detroit in order to seek investment in his automobile design, which he used to open the General Engineering Company. He and his brothers immediately began working on the Model C, which was intended to expand upon the innovations of the Model B. The brothers added features such as a key-based ignition in the cabin, eliminating the need for the operator to manually ignite the boiler.</p><p>With these enhancements, the Dobles’ new car company promised a steam vehicle which would provide all of the convenience of a gasoline car, but with much greater speed, much simpler driving controls, and a virtually silent powerplant. By the following April, the General Engineering Company had received 5,390 deposits for Doble Detroits, which were scheduled for delivery in early 1918.</p><p><strong>E</strong> Later that year Abner Doble delivered unhappy news to those eagerly awaiting the delivery of their modem new cars. Those buyers who received the handful of completed cars complained that the vehicles were sluggish and erratic, sometimes going in reverse when they should go forward. The new engine design, though innovative, was still plagued with serious glitches.</p><p><strong>F</strong> The brothers made one final attempt to produce a viable steam automobile. In early 1924, the Doble brothers shipped a Model E to New York City to be road-tested by the Automobile Club of America. After sitting overnight in freezing temperatures, the car was pushed out into the road and left to sit for over an hour in the frosty morning air. At the turn of the key, the boiler lit and reached its operating pressure inside of forty seconds.</p><p>As they drove the test vehicle further, they found that its evenly distributed weight lent it surprisingly good handling, even though it was so heavy. As the new Doble steamer was further developed and tested, its maximum speed was pushed to over a hundred miles per hour, and it achieved about fifteen miles per gallon of kerosene with negligible emissions.</p><p><strong>G</strong> Sadly, the Dobles’ brilliant steam car never was a financial success. Priced at around $18,000 in 1924, it was popular only among the very wealthy. Plus, it is said that no two Model Es were quite the same, because Abner Doble tinkered endlessly with the design. By the time the company folded in 1931, fewer than fifty of the amazing Model E steam cars had been produced.</p><p>For his whole career, until his death in 1961, Abner Doble remained adamant that steam-powered automobiles were at least equal to gasoline cars, if not superior. Given the evidence, he may have been right. Many of the Model E Dobles which have survived are still in good working condition, some having been driven over half a million miles with only normal maintenance. Astonishingly, an unmodified Doble Model E runs clean enough to pass the emissions laws in California today, and they are pretty strict.</p><p>It is true that the technology poses some difficult problems, but you cannot help but wonder how efficient a steam car might be with the benefit of modem materials and computers. Under the current pressure to improve automotive performance and reduce emissions, it is not unthinkable that the steam car may rise again.</p>"
      },
      {
        "section": 3,
        "title": "The case for mixed-ability classes",
        "contentHtml": "<h2>The case for mixed-ability classes</h2><p>Picture this scene. It’s an English literature lesson in a UK school, and the teacher has just read an extract from Shakespeare’s Romeo and Juliet with a class of 15-year-olds. He’s given some of the students copies of No Fear Shakespeare, a kid-friendly translation of the original. For three students, even these literacy demands are beyond them. Another girl simply can’t focus and he gives her pens and paper to draw with.</p><p>The teacher can ask the No Fear group to identify the key characters and maybe provide a tentative plot summary. He can ask most of the class about character development, and five of them might be able to support their statements with textual evidence. Now two curious students are wondering whether Shakespeare advocates living a life of moderation or one of passionate engagement.</p><p>As a teacher myself, I’d think my lesson would be going rather well if the discussion went as described above. But wouldn’t this kind of class work better if there weren’t such a huge gap between the top and the bottom? If we put all the kids who needed literacy support into one class, and all the students who want to discuss the virtue of moderation into another?</p><p>The practice of ‘streaming’, or ‘tracking’, involves separating students into classes depending on their diagnosed levels of attainment. At a macro level, it requires the establishment of academically selective schools for the brightest students, and comprehensive schools for the rest. Within schools, it means selecting students into a ‘stream’ of general ability, or ‘sets’ of subject-specific ability. The practice is intuitively appealing to almost every stakeholder.</p><p>I have heard the mixed-ability model attacked by way of analogy: a group hike. The fittest in the group take the lead and set a brisk pace, only to have to stop and wait every 20 minutes. This is frustrating, and their enthusiasm wanes. Meanwhile, the slowest ones are not only embarrassed but physically struggling to keep up. What’s worse, they never get a long enough break. They honestly just want to quit. Hiking, they feel, is not for them.</p><p>Mixed-ability classes bore students, frustrate parents and bum out teachers. The brightest ones will never summit Mount Qomolangma, and the stragglers won’t enjoy the lovely stroll in the park they are perhaps more suited to. Individuals suffer at the demands of the collective, mediocrity prevails. So: is learning like hiking?</p><p>The current pedagogical paradigm is arguably that of constructivism, which emerged out of the work of psychologist Lev Vygotsky. In the 1930s, Vygotsky emphasised the importance of targeting a student’s specific ‘zone of proximal development’ (ZPD). This is the gap between what they can achieve only with support – teachers, textbooks, worked examples, parents and so on – and what they can achieve independently.</p><p>The purpose of teaching is to provide and then gradually remove this ‘scaffolding’ until they are autonomous. If we accept this model, it follows that streaming students with similar ZPDs would be an efficient and effective solution. And that forcing everyone on the same hike – regardless of aptitude – would be madness.</p><p>Despite all this, there is limited empirical evidence to suggest that streaming results in better outcomes for students. Professor John Hattie, director of the Melbourne Education Research Institute, notes that ‘tracking has minimal effects on learning outcomes’. What is more, streaming appears to significantly – and negatively – affect those students assigned to the lowest sets. These students tend to have much higher representation of low socioeconomic class.</p><p>Less significant is the small benefit for those lucky clever students in the higher sets. The overall result is that the smart stay smart and the dumb get dumber, further entrenching the social divide.</p><p>In the latest update of Hattie’s influential meta-analysis of factors influencing student achievement, one of the most significant factors is the teachers’ estimate of achievement. Streaming students by diagnosed achievement automatically limits what the teacher feels the student is capable of. Meanwhile, in a mixed environment, teachers’ estimates need to be more diverse and flexible.</p><p>While streaming might seem to help teachers effectively target a student’s ZPD, it can underestimate the importance of peer-to-peer learning. A crucial aspect of constructivist theory is the role of the MKO – ‘more knowledgeable other’ – in knowledge construction. While teachers are traditionally the MKOs in classrooms, the value of knowledgeable student peers must not go unrecognised either.</p><p>I find it amazing to watch students get over an idea to their peers in ways that I would never think of. They operate with different language tools and different social tools from teachers and, having just learnt it themselves, they possess similar cognitive structures to their struggling classmates.</p><p>There is also something exciting about passing on skills and knowledge that you yourself have just mastered – a certain pride and zeal, a certain freshness to the interaction between ‘teacher’ and ‘learner’ that is often lost by the expert for whom the steps are obvious and the joy of discovery forgotten.</p><p>Having a variety of different abilities in a collaborative learning environment provides valuable resources for helping students meet their learning needs, not to mention improving their communication and social skills. And today, more than ever, we need the many to flourish – not suffer at the expense of a few bright stars. Once a year, I go on a hike with my class, a mixed bunch of students. It is challenging. The fittest students realise they need to encourage the reluctant.</p><p>There are lookouts who report back, and extra items to carry for others. We make it – together.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 4,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 1–4</h3><p>The Reading Passage has eight sections, A-H.</p><p>Which section contains the following information?</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p>",
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
            "number": 1,
            "prompt": "an explanation of the industrial processes that create potential raw materials for concrete",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "a reference to the various locations where high-rise wooden buildings can be found",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "an indication of how widely available the raw materials of concrete are",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "the belief that more high-rise wooden buildings are needed before wood can be regarded as a viable construction material",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 5,
        "to": 8,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 5–8</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Making buildings with wood</p><p>Wood is a traditional building material, but current environmental concerns are encouraging 5_______  to use wood in modern construction projects. Using wood, however, has its challenges. For example, as 6_______  in the atmosphere enters wood, it increases in size. In addition, wood is prone to pests and the risk of fire is greater. However, wood can be turned into a better construction material if it is treated and combined with other materials.</p><p>In one process, 7_______  of solid wood are glued together to create building blocks. These blocks are lighter than concrete and steel but equal them in strength. Experts say that wooden buildings are an improvement on those made of concrete and steel in terms of the 8_______  with which they can be constructed and how much noise is generated by the process.</p>",
        "questions": [
          {
            "number": 5,
            "prompt": "Wood is a traditional building material, but current environmental concerns are encouraging 5_______  to use wood in modern construction projects. Using wood, however, has its challenges. For example, as 6_______  in the atmosphere enters wood, it increases in size. In addition, wood is prone to pests and the risk of fire is greater. However, wood can be turned into a better construction material if it is treated and combined with other materials.",
            "options": [],
            "answerKey": "architects",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Wood is a traditional building material, but current environmental concerns are encouraging 5_______  to use wood in modern construction projects. Using wood, however, has its challenges. For example, as 6_______  in the atmosphere enters wood, it increases in size. In addition, wood is prone to pests and the risk of fire is greater. However, wood can be turned into a better construction material if it is treated and combined with other materials.",
            "options": [],
            "answerKey": "moisture",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "In one process, 7_______  of solid wood are glued together to create building blocks. These blocks are lighter than concrete and steel but equal them in strength. Experts say that wooden buildings are an improvement on those made of concrete and steel in terms of the 8_______  with which they can be constructed and how much noise is generated by the process.",
            "options": [],
            "answerKey": "layers",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "In one process, 7_______  of solid wood are glued together to create building blocks. These blocks are lighter than concrete and steel but equal them in strength. Experts say that wooden buildings are an improvement on those made of concrete and steel in terms of the 8_______  with which they can be constructed and how much noise is generated by the process.",
            "options": [],
            "answerKey": "speed",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 9,
        "to": 13,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 9–13</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person, A, B, C or D.</p><p>Write the correct letter, A, B, C or D, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Chris Cheeseman",
            "Markus Mannstrom",
            "Anna Surgenor",
            "Felix Preston and Johanna Lehne"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 9,
            "prompt": "The environmental advantage of cement alternatives may not be as great as initially assumed.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "It would be hard to create a construction alternative to concrete that offers so many comparable benefits.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Worries about the environment have led to increased interest in wood as a construction material.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Expense has been a factor in the negative response to the development of new cements.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "The environmental damage caused by concrete is due to it being produced in large quantities.",
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
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 14–20</h3><p>The Reading Passage has seven paragraphs, A-G.</p><p>Choose the correct heading for each paragraph from the list of headings below.</p><p>Write the correct number, i-viii, in boxes on your answer sheet.</p>",
        "config": {
          "headings": [
            "A period in cold conditions before the technology is assessed",
            "Marketing issues lead to failure",
            "Good and bad aspects of steam technology are passed on",
            "A possible solution to the issues of today",
            "Further improvements lead to commercial orders",
            "Positive publicity at last for this quiet, clean, fast vehicle",
            "A disappointing outcome for customers",
            "A better option than the steam car arises"
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
            "answerKey": "viii",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "vi",
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
            "answerKey": "vii",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "i",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "Paragraph G",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 21,
        "to": 23,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 21–23</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 21,
            "prompt": "What point does the writer make about the steam car in Paragraph B?",
            "options": [
              "Its success was short-lived.",
              "Not enough cars were made.",
              "Car companies found them hard to sell.",
              "People found them hard to drive."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "When building their first steam car, the Doble brothers",
            "options": [
              "constructed all the parts themselves.",
              "made written notes at each stage of the construction.",
              "needed several attempts to achieve a competitive model.",
              "sought the advice of experienced people in the car industry."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "In order to produce the Model C, the Doble brothers",
            "options": [
              "moved production to a different city.",
              "raised financial capital.",
              "employed an additional worker.",
              "abandoned their earlier designs."
            ],
            "answerKey": "B",
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
        "instructionHtml": "<h3>Questions 24–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ANDIOR A NUMBER from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The Model E</p><p>The Model E was road-tested in 1924 by the Automobile Club of America. They found it easy to drive, despite its weight, and it impressed the spectators. A later version of the Model E raised its 24_______ , while keeping its emissions extremely low.</p><p>The steam car was too expensive for many people and its design was constantly being altered. Under 25_______  cars were produced before the company went out of business. However, even today, there are Model Es on the road in the US. They are straightforward to maintain, and they satisfy California’s 26_______  emissions laws. Perhaps today’s technology and materials would help us revive the steam car.</p>",
        "questions": [
          {
            "number": 24,
            "prompt": "The Model E was road-tested in 1924 by the Automobile Club of America. They found it easy to drive, despite its weight, and it impressed the spectators. A later version of the Model E raised its 24_______ , while keeping its emissions extremely low.",
            "options": [],
            "answerKey": "speed",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "The steam car was too expensive for many people and its design was constantly being altered. Under 25_______  cars were produced before the company went out of business. However, even today, there are Model Es on the road in the US. They are straightforward to maintain, and they satisfy California’s 26_______  emissions laws. Perhaps today’s technology and materials would help us revive the steam car.",
            "options": [],
            "answerKey": "50",
            "acceptedAnswers": [
              "fifty"
            ]
          },
          {
            "number": 26,
            "prompt": "The steam car was too expensive for many people and its design was constantly being altered. Under 25_______  cars were produced before the company went out of business. However, even today, there are Model Es on the road in the US. They are straightforward to maintain, and they satisfy California’s 26_______  emissions laws. Perhaps today’s technology and materials would help us revive the steam car.",
            "options": [],
            "answerKey": "strict",
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
            "prompt": "The writer describes the Romeo and Juliet lesson in order to demonstrate",
            "options": [
              "how few students are interested in literature.",
              "how a teacher handles a range of learning needs.",
              "how unsuitable Shakespeare is for most teenagers.",
              "how weaker students can disrupt their classmates’ learning."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "What does the writer say about streaming in the third paragraph?",
            "options": [
              "It has a very broad appeal.",
              "It favours cleverer students.",
              "It is relatively simple to implement.",
              "It works better in some schools than others."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "What idea is suggested by the reference to Mount Qomolangma in the fifth paragraph?",
            "options": [
              "students following unsuitable paths",
              "students attempting interesting tasks",
              "students not achieving their full potential",
              "students not being aware of their limitations"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "What does the word ‘scaffolding’ in the sixth paragraph refer to?",
            "options": [
              "the factors which prevent a student from learning effectively",
              "the environment where most of a student’s learning takes place",
              "the assistance given to a student in their initial stages of learning",
              "the setting of appropriate learning targets for a student’s aptitude"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 31,
        "to": 35,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 31–35</h3><p>Complete the summary using the list of phrases, A-l, below.</p><p>Write the correct letter, A-l, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "wrong classes",
            "lower expectations",
            "average learners",
            "bottom sets",
            "brightest pupils",
            "disadvantaged backgrounds",
            "weaker students",
            "higher achievements",
            "positive impressions"
          ]
        },
        "questionHtml": "<p>Is streaming effective?</p><p>According to Professor John Hattie of the Melbourne Education Research Institute there is very little indication that streaming leads to 31_______ . He points out that, in schools which use streaming, the most significant impact is on those students placed in the 32_______ , especially where a large proportion of them have 33_______ . Meanwhile, for the 34_______ , there appears to be only minimal advantage.</p><p>A further issue is that teachers tend to have 35_______  of students in streamed groups.</p>",
        "questions": [
          {
            "number": 31,
            "prompt": "According to Professor John Hattie of the Melbourne Education Research Institute there is very little indication that streaming leads to 31_______ . He points out that, in schools which use streaming, the most significant impact is on those students placed in the 32_______ , especially where a large proportion of them have 33_______ . Meanwhile, for the 34_______ , there appears to be only minimal advantage.",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "According to Professor John Hattie of the Melbourne Education Research Institute there is very little indication that streaming leads to 31_______ . He points out that, in schools which use streaming, the most significant impact is on those students placed in the 32_______ , especially where a large proportion of them have 33_______ . Meanwhile, for the 34_______ , there appears to be only minimal advantage.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "According to Professor John Hattie of the Melbourne Education Research Institute there is very little indication that streaming leads to 31_______ . He points out that, in schools which use streaming, the most significant impact is on those students placed in the 32_______ , especially where a large proportion of them have 33_______ . Meanwhile, for the 34_______ , there appears to be only minimal advantage.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "According to Professor John Hattie of the Melbourne Education Research Institute there is very little indication that streaming leads to 31_______ . He points out that, in schools which use streaming, the most significant impact is on those students placed in the 32_______ , especially where a large proportion of them have 33_______ . Meanwhile, for the 34_______ , there appears to be only minimal advantage.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "A further issue is that teachers tend to have 35_______  of students in streamed groups.",
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
        "instructionHtml": "<h3>Questions 36–40</h3><p>Do the following statements agree with the views of the writer in The Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the views of the writer</p><p>NO if the statement contradicts the views of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 36,
            "prompt": "The Vygotsky model of education supports the concept of a mixed-ability class.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Some teachers are uncertain about allowing students to take on MKO roles in the classroom.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "It can be rewarding to teach knowledge which you have only recently acquired.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "The priority should be to ensure that the highest-achieving students attain their goals.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Taking part in collaborative outdoor activities with teachers and classmates can improve student outcomes in the classroom.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-18-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-18-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "Green roofs",
        "contentHtml": "<h2>Green roofs</h2><p><strong>A</strong> Rooftops covered with grass, vegetable gardens and lush foliage are now a common sight in many cities around the world. More and more private companies and city authorities are investing in green roofs, drawn to their wide-ranging benefits. Among the benefits are saving on energy costs, mitigating the risk of floods, making habitats for urban wildlife, tackling air pollution and even growing food.</p><p>These increasingly radical urban designs can help cities adapt to the monumental problems they face, such as access to resources and a lack of green space due to development. But the involvement of city authorities, businesses and other institutions is crucial to ensuring their success – as is research investigating different options to suit the variety of rooftop spaces found in cities.</p><p>The UK is relatively new to developing green roofs, and local governments and institutions are playing a major role in spreading the practice. London is home to much of the UK’s green roof market, mainly due to forward-thinking policies such as the London Plan, which has paved the way to more than doubling the area of green roofs in the capital.</p><p><strong>B</strong> Ongoing research is showcasing how green roofs in cities can integrate with ‘living walls’: environmentally friendly walls which are partially or completely covered with greenery, including a growing medium, such as soil or water. Research also indicates that green roofs can be integrated with drainage systems on the ground, such as street trees, so that the water is managed better and the built environment is made more sustainable. There is also evidence to demonstrate the social value of green roofs.</p><p>Doctors are increasingly prescribing time spent gardening outdoors for patients dealing with anxiety and depression. And research has found that access to even the most basic green spaces can provide a better quality of life for dementia sufferers and help people avoid obesity.</p><p><strong>C</strong> In North America, green roofs have become mainstream, with a wide array of expansive, accessible and food-producing roofs installed in buildings. Again, city leaders and authorities have helped push the movement forward – only recently, San Francisco, USA, created a policy requiring new buildings to have green roofs. Toronto, Canada, has policies dating from the 1990s, encouraging the development of urban farms on rooftops.</p><p>These countries also benefit from having newer buildings than in many parts of the world, which makes it easier to install green roofs. Being able to keep enough water at roof height and distribute it right across the rooftop is crucial to maintaining the plants on any green roof – especially on ‘edible roofs’ where fruit and vegetables are farmed. And it’s much easier to do this in newer buildings, which can typically hold greater weight, than to retro-fit old ones.</p><p>Having a stronger roof also makes it easier to grow a greater variety of plants, since the soil can be deeper.</p><p><strong>D</strong> For green roofs to become the norm for new developments, there needs to be support from public authorities and private investors. Those responsible for maintaining buildings may have to acquire new skills, such as landscaping, and in some cases, volunteers may be needed to help out.</p><p>Other considerations include installing drainage paths, meeting health and safety requirements and perhaps allowing access for the public, as well as planning restrictions and disruption from regular activities in and around the buildings during installation. To convince investors and developers that installing green roofs is worthwhile, economic arguments are still the most important.</p><p>The term ‘natural capital’ has been developed to explain the economic value of nature; for example, measuring the money saved by installing natural solutions to protect against flood damage, adapt to climate change or help people lead healthier and happier lives.</p><p><strong>E</strong> As the expertise about green roofs grows, official standards have been developed to ensure that they are designed, constructed and maintained properly, and function well. Improvements in the science and technology underpinning green roof development have also led to new variations in the concept. For example, ‘blue roofs’ enable buildings to hold water over longer periods of time, rather than draining it away quickly – crucial in times of heavier rainfall.</p><p>There are also combinations of green roofs with solar panels, and ‘brown roofs’ which are wilder in nature and maximise biodiversity. If the trend continues, it could create new jobs and a more vibrant and sustainable local food economy – alongside many other benefits. There are still barriers to overcome, but the evidence so far indicates that green roofs have the potential to transform cities and help them function sustainably long into the future.</p><p>The success stories need to be studied and replicated elsewhere, to make green, blue, brown and food-producing roofs the norm in cities around the world.</p>"
      },
      {
        "section": 2,
        "title": "The growth mindset",
        "contentHtml": "<h2>The growth mindset</h2><p>Over the past century, a powerful idea has taken root in the educational landscape. The concept of intelligence as something innate has been supplanted by the idea that intelligence is not fixed, and that, with the right training, we can be the authors of our own cognitive capabilities. Psychologist Alfred Binet, the developer of the first intelligence tests, was one of many 19th-century scientists who held that earlier view and sought to quantify cognitive ability.</p><p>Then, in the early 20th century, progressive thinkers revolted against the notion that inherent ability is destiny. Instead, educators such as John Dewey argued that every child’s intelligence could be developed, given the right environment.</p><p>‘Growth mindset theory’ is a relatively new – and extremely popular – version of this idea. In many schools today you will see hallways covered in motivational posters and hear speeches on the mindset of great sporting heroes who simply believed their way to the top. A major focus of the growth mindset in schools is coaxing students away from seeing failure as an indication of their ability, and towards seeing it as a chance to improve that ability.</p><p>As educationalist Jeff Howard noted several decades ago: ‘Smart is not something that you just are, smart is something that you can get.’</p><p>The idea of the growth mindset is based on the work of psychologist Carol Dweck in California in the 1990s. In one key experiment, Dweck divided a group of 10- to 12-year-olds into two groups. All were told that they had achieved a high score on a test but the first group were praised for their intelligence in achieving this, while the others were praised for their effort.</p><p>The second group – those who had been instilled with a ‘growth mindset’ – were subsequently far more likely to put effort into future tasks. Meanwhile, the former took on only those tasks that would not risk their sense of worth. This group had inferred that success or failure is due to innate ability, and this ‘fixed mindset’ had led them to fear of failure and lack of effort. Praising ability actually made the students perform worse, while praising effort emphasised that change was possible.</p><p>One of the greatest impediments to successfully implementing a growth mindset, however, is the education system itself: in many parts of the world, the school climate is obsessed with performance in the form of constant testing, analysing and ranking of students – a key characteristic of the fixed mindset. Nor is it unusual for schools to create a certain cognitive dissonance, when they applaud the benefits of a growth mindset but then hand out fixed target grades in lessons based on performance.</p><p>Aside from the implementation problem, the original growth mindset research has also received harsh criticism. The statistician Andrew Gelman claims that ‘their research designs have enough degrees of freedom that they could take their data to support just about any theory at all’. Professor of Psychology Timothy Bates, who has been trying to replicate Dweck’s work, is finding that the results are repeatedly null.</p><p>He notes that: ‘People with a growth mindset don’t cope any better with failure … Kids with the growth mindset aren’t getting better grades, either before or after our intervention study.’</p><p>Much of this criticism is not lost on Dweck, and she deserves great credit for responding to it and adapting her work accordingly. In fact, she argues that her work has been misunderstood and misapplied in a range of ways. She has also expressed concerns that her theories are being misappropriated in schools by being conflated with the self-esteem movement: ‘For me the growth mindset is a tool for learning and improvement. It’s not just a vehicle for making children feel good.’</p><p>But there is another factor at work here. The failure to translate the growth mindset into the classroom might reflect a misunderstanding of the nature of teaching and learning itself. Growth mindset supporters David Yeager and Gregory Walton claim that interventions should be delivered in a subtle way to maximise their effectiveness. They say that if adolescents perceive a teacher’s intervention as conveying that they are in need of help, this could undo its intended effects.</p><p>A lot of what drives students is their innate beliefs and how they perceive themselves. There is a strong correlation between self-perception and achievement, but there is evidence to suggest that the actual effect of achievement on self-perception is stronger than the other way round. To stand up in a classroom and successfully deliver a good speech is a genuine achievement, and that is likely to be more powerfully motivating than vague notions of ‘motivation’ itself.</p><p>Recent evidence would suggest that growth mindset interventions are not the elixir of student learning that its proponents claim it to be. The growth mindset appears to be a viable construct in the lab, which, when administered in the classroom via targeted interventions, doesn’t seem to work. It is hard to dispute that having faith in the capacity to change is a good attribute for students. Paradoxically, however, that aspiration is not well served by direct interventions that try to instil it.</p><p>Motivational posters and talks are often a waste of time, and might well give students a deluded notion of what success actually means. Teaching concrete skills such as how to write an effective introduction to an essay then praising students’ effort in getting there is probably a far better way of improving confidence than telling them how unique they are, or indeed how capable they are of changing their own brains. Perhaps growth mindset works best as a philosophy and not an intervention.</p>"
      },
      {
        "section": 3,
        "title": "Alfred Wegener: science, exploration and the theory of continental drift",
        "contentHtml": "<h2>Alfred Wegener: science, exploration and the theory of continental drift</h2><p>by Mott T Greene</p><p>Introduction</p><p>This is a book about the life and scientific work of Alfred Wegener, whose reputation today rests with his theory of continental displacements, better known as ‘continental drift’. Wegener proposed this theory in 1912 and developed it extensively for nearly 20 years. His book on the subject, The Origin of Continents and Oceans, went through four editions and was the focus of an international controversy in his lifetime and for some years after his death.</p><p>Wegener’s basic idea was that many mysteries about the Earth’s history could be solved if one supposed that the continents moved laterally, rather than supposing that they remained fixed in place. Wegener showed in great detail how such continental movements were plausible and how they worked, using evidence from a large number of sciences including geology, geophysics, paleontology, and climatology.</p><p>Wegener’s idea – that the continents move – is at the heart of the theory that guides Earth sciences today: namely plate tectonics. Plate tectonics is in many respects quite different from Wegener’s proposal, in the same way that modern evolutionary theory is very different from the ideas Charles Darwin proposed in the 1850s about biological evolution.</p><p>Yet plate tectonics is a descendant of Alfred Wegener’s theory of continental drift, in quite the same way that modern evolutionary theory is a descendant of Darwin’s theory of natural selection.</p><p>When I started writing about Wegener’s life and work, one of the most intriguing things about him for me was that, although he came up with a theory on continental drift, he was not a geologist. He trained as an astronomer and pursued a career in atmospheric physics. When he proposed the theory of continental displacements in 1912, he was a lecturer in physics and astronomy at the University of Marburg, in southern Germany. However, he was not an ‘unknown’.</p><p>In 1906 he had set a world record (with his brother Kurt) for time aloft in a hot-air balloon: 52 hours. Between 1906 and 1908 he had taken part in a highly publicized and extremely dangerous expedition to the coast of northeast Greenland. He had also made a name for himself amongst a small circle of meteorologists and atmospheric physicists in Germany as the author of a textbook, Thermodynamics of the Atmosphere (1911), and of a number of interesting scientific papers.</p><p>As important as Wegener’s work on continental drift has turned out to be, it was largely a sideline to his interest in atmospheric physics, geophysics, and paleoclimatology*, and thus I have been at great pains to put Wegener’s work on continental drift in the larger context of his other scientific work, and in the even larger context of atmospheric sciences in his lifetime. This is a ‘continental drift book’ only to the extent that Wegener was interested in that topic and later became famous for it.</p><p>My treatment of his other scientific work is no less detailed, though I certainly have devoted more attention to the reception of his ideas on continental displacement, as they were much more controversial than his other work.</p><p>Readers interested in the specific detail of Wegener’s career will see that he often stopped pursuing a given line of investigation (sometimes for years on end), only to pick it up later. I have tried to provide guideposts to his rapidly shifting interests by characterizing different phases of his life as careers in different sciences, which is reflected in the titles of the chapters.</p><p>Thus, the index should be a sufficient guide for those interested in a particular aspect of Wegener’s life but perhaps not all of it. My own feeling, however, is that the parts do not make as much sense on their own as do all of his activities taken together. In this respect I urge readers to try to experience Wegener’s life as he lived it, with all the interruptions, changes of mind, and renewed efforts this entailed.</p><p>Wegener left behind a few published works but, as was standard practice, these reported the results of his work – not the journey he took to reach that point. Only a few hundred of the many thousands of letters he wrote and received in his lifetime have survived and he didn’t keep notebooks or diaries that recorded his life and activities.</p><p>He was not active (with a few exceptions) in scientific societies, and did not seek to find influence or advance his ideas through professional contacts and politics, spending most of his time at home in his study reading and writing, or in the field collecting observations.</p><p>Some famous scientists, such as Newton, Darwin, and Einstein, left mountains of written material behind, hundreds of notebooks and letters numbering in the tens of thousands. Others, like Michael Faraday, left extensive journals of their thoughts and speculations, parallel to their scientific notebooks. The more such material a scientist leaves behind, the better chance a biographer has of forming an accurate picture of how a scientist’s ideas took shape and evolved.</p><p>I am firmly of the opinion that most of us, Wegener included, are not in any real sense the authors of our own lives. We plan, think, and act, often with apparent freedom, but most of the time our lives ‘happen to us’, and we only retrospectively turn this happenstance into a coherent narrative of fulfilled intentions. This book, therefore, is a story both of the life and scientific work that Alfred Wegener planned and intended and of the life and scientific work that actually ‘happened to him’.</p><p>These are, as I think you will soon see, not always the same thing.</p><p>* Paleoclimatology – The study of past climates</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 5,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 1–5</h3><p>The Reading Passage has five paragraphs, A-E.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-E, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "sectionLabels": [
            "A",
            "B",
            "C",
            "D",
            "E"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "mention of several challenges to be overcome before a green roof can be installed",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "reference to a city where green roofs have been promoted for many years",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "a belief that existing green roofs should be used as a model for new ones",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "examples of how green roofs can work in combination with other green urban initiatives",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "the need to make a persuasive argument for the financial benefits of green roofs",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 6,
        "to": 9,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 6–9</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Advantages of green roofs</p><p>City rooftops covered with greenery have many advantages. These include lessening the likelihood that floods will occur, reducing how much money is spent on 6_______  and creating environments that are suitable for wildlife. In many cases, they can also be used for producing 7_______ .</p><p>There are also social benefits of green roofs. For example, the medical profession recommends 8_______  as an activity to help people cope with mental health issues. Studies have also shown that the availability of green spaces can prevent physical problems such as 9_______ .</p>",
        "questions": [
          {
            "number": 6,
            "prompt": "City rooftops covered with greenery have many advantages. These include lessening the likelihood that floods will occur, reducing how much money is spent on 6_______  and creating environments that are suitable for wildlife. In many cases, they can also be used for producing 7_______ .",
            "options": [],
            "answerKey": "energy",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "City rooftops covered with greenery have many advantages. These include lessening the likelihood that floods will occur, reducing how much money is spent on 6_______  and creating environments that are suitable for wildlife. In many cases, they can also be used for producing 7_______ .",
            "options": [],
            "answerKey": "food",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "There are also social benefits of green roofs. For example, the medical profession recommends 8_______  as an activity to help people cope with mental health issues. Studies have also shown that the availability of green spaces can prevent physical problems such as 9_______ .",
            "options": [],
            "answerKey": "gardening",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "There are also social benefits of green roofs. For example, the medical profession recommends 8_______  as an activity to help people cope with mental health issues. Studies have also shown that the availability of green spaces can prevent physical problems such as 9_______ .",
            "options": [],
            "answerKey": "obesity",
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
            "prompt": "Which TWO advantages of using newer buildings for green roofs are mentioned in Paragraph C of the passage?",
            "options": [
              "a longer growing season for edible produce",
              "more economical use of water",
              "greater water-storage capacity",
              "ability to cultivate more plant types",
              "a large surface area for growing plants"
            ],
            "answerKey": "C",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 11,
            "prompt": "Which TWO advantages of using newer buildings for green roofs are mentioned in Paragraph C of the passage?",
            "options": [
              "a longer growing season for edible produce",
              "more economical use of water",
              "greater water-storage capacity",
              "ability to cultivate more plant types",
              "a large surface area for growing plants"
            ],
            "answerKey": "D",
            "acceptedAnswers": [
              "C"
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
            "prompt": "Which TWO aims of new variations on the concept of green roofs are mentioned in Paragraph E of the passage?",
            "options": [
              "to provide habitats for a wide range of species",
              "to grow plants successfully even in the wettest climates",
              "to regulate the temperature of the immediate environment",
              "to generate power from a sustainable source",
              "to collect water to supply other buildings"
            ],
            "answerKey": "A",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 13,
            "prompt": "Which TWO aims of new variations on the concept of green roofs are mentioned in Paragraph E of the passage?",
            "options": [
              "to provide habitats for a wide range of species",
              "to grow plants successfully even in the wettest climates",
              "to regulate the temperature of the immediate environment",
              "to generate power from a sustainable source",
              "to collect water to supply other buildings"
            ],
            "answerKey": "D",
            "acceptedAnswers": [
              "A"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 16,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 14–16</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "What can we learn from the first paragraph?",
            "options": [
              "where the notion of innate intelligence first began",
              "when ideas about the nature of intelligence began to shift",
              "how scientists have responded to changing views of intelligence",
              "why thinkers turned away from the idea of intelligence being fixed"
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "The second paragraph describes how schools encourage students to",
            "options": [
              "identify their personal ambitions.",
              "help each other to realise their goals.",
              "have confidence in their potential to succeed.",
              "concentrate on where their particular strengths lie."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "In the third paragraph, the writer suggests that students with a fixed mindset",
            "options": [
              "tend to be less competitive.",
              "generally have a low sense of self-esteem.",
              "will only work hard if they are given constant encouragement.",
              "are afraid to push themselves beyond what they see as their limitations."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 17,
        "to": 22,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 17–22</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person or people, A-E.</p><p>Write the correct letter, A-E, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Alfred Binet",
            "Carol Dweck",
            "Andrew Gelman",
            "Timothy Bates",
            "David Yeager and Gregory Walton"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 17,
            "prompt": "The methodology behind the growth mindset studies was not strict enough.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "The idea of the growth mindset has been incorrectly interpreted.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Intellectual ability is an unchangeable feature of each individual.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "The growth mindset should be promoted without students being aware of it.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "The growth mindset is not simply about boosting students’ morale.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Research shows that the growth mindset has no effect on academic achievement.",
            "options": [],
            "answerKey": "D",
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
        "instructionHtml": "<h3>Questions 23–26</h3><p>Do the following statements agree with the views of the writer in The Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the views of the writer</p><p>NO if the statement contradicts the views of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "Dweck has handled criticisms of her work in an admirable way.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "Students’ self-perception is a more effective driver of self-confidence than actual achievement is.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "Recent evidence about growth mindset interventions has attracted unfair coverage in the media.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "Deliberate attempts to encourage students to strive for high achievement may have a negative effect.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 30,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 27–30</h3><p>Do the following statements agree with the claims of the writer in The Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "Wegener’s ideas about continental drift were widely disputed while he was alive.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "The idea that the continents remained fixed in place was defended in a number of respected scientific publications.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Wegener relied on a limited range of scientific fields to support his theory of continental drift",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "The similarities between Wegener’s theory of continental drift and modern-day plate tectonics are enormous.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 31,
        "to": 36,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 31–36</h3><p>Complete the summary using the list of phrases, A-J, below.</p><p>Write the correct letter, A-J, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "modest fame",
            "vast range",
            "record-breaking achievement",
            "research methods",
            "select group",
            "professional interests",
            "scientific debate",
            "hazardous exploration",
            "biographer’s perspective",
            "narrow investigation"
          ]
        },
        "questionHtml": "<p>Wegener’s life and work</p><p>One of the remarkable things about Wegener from a 31_______  is that although he proposed a theory of continental drift, he was not a geologist. His 32_______  were limited to atmospheric physics. However, at the time he proposed his theory of continental drift in 1912, he was already a person of 33_______ .</p><p>Six years previously, there had been his 34_______  of 52 hours in a hot-air balloon, followed by his well-publicised but 35_______  of Greenland’s coast. With the publication of his textbook on thermodynamics, he had also come to the attention of a 36_______  of German scientists.</p>",
        "questions": [
          {
            "number": 31,
            "prompt": "One of the remarkable things about Wegener from a 31_______  is that although he proposed a theory of continental drift, he was not a geologist. His 32_______  were limited to atmospheric physics. However, at the time he proposed his theory of continental drift in 1912, he was already a person of 33_______ .",
            "options": [],
            "answerKey": "I",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "One of the remarkable things about Wegener from a 31_______  is that although he proposed a theory of continental drift, he was not a geologist. His 32_______  were limited to atmospheric physics. However, at the time he proposed his theory of continental drift in 1912, he was already a person of 33_______ .",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "One of the remarkable things about Wegener from a 31_______  is that although he proposed a theory of continental drift, he was not a geologist. His 32_______  were limited to atmospheric physics. However, at the time he proposed his theory of continental drift in 1912, he was already a person of 33_______ .",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Six years previously, there had been his 34_______  of 52 hours in a hot-air balloon, followed by his well-publicised but 35_______  of Greenland’s coast. With the publication of his textbook on thermodynamics, he had also come to the attention of a 36_______  of German scientists.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Six years previously, there had been his 34_______  of 52 hours in a hot-air balloon, followed by his well-publicised but 35_______  of Greenland’s coast. With the publication of his textbook on thermodynamics, he had also come to the attention of a 36_______  of German scientists.",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Six years previously, there had been his 34_______  of 52 hours in a hot-air balloon, followed by his well-publicised but 35_______  of Greenland’s coast. With the publication of his textbook on thermodynamics, he had also come to the attention of a 36_______  of German scientists.",
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
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "What is Mott T Greene doing in the fifth paragraph?",
            "options": [
              "describing what motivated him to write the book",
              "explaining why it is desirable to read the whole book",
              "suggesting why Wegener pursued so many different careers",
              "indicating what aspects of Wegener’s life interested him most"
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "What is said about Wegener in the sixth paragraph?",
            "options": [
              "He was not a particularly ambitious person.",
              "He kept a record of all his scientific observations.",
              "He did not adopt many of the scientific practices of the time.",
              "He enjoyed discussing new discoveries with other scientists."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "What does Greene say about some other famous scientists?",
            "options": [
              "Their published works had a greater impact than Wegener’s did.",
              "They had fewer doubts about their scientific ideas than Wegener did.",
              "Their scientific ideas were more controversial than Wegener’s.",
              "They are easier subjects to write about than Wegener."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "What is Greene’s main point in the final paragraph?",
            "options": [
              "It is not enough in life to have good intentions.",
              "People need to plan carefully if they want to succeed.",
              "People have little control over many aspects of their lives.",
              "It is important that people ensure they have the freedom to act."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-19-1",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-19-academic-reading-test-1/",
    "sections": [
      {
        "section": 1,
        "title": "How tennis rackets have changed",
        "contentHtml": "<h2>How tennis rackets have changed</h2><p>In 2016, the British professional tennis player Andy Murray was ranked as the world’s number one. It was an incredible achievement by any standard – made even more remarkable by the fact that he did this during a period considered to be one of the strongest in the sport’s history, competing against the likes of Rafael Nadal, Roger Federer and Novak Djokovic, to name just a few. Yet five years previously, he had been regarded as a talented outsider who entered but never won the major tournaments.</p><p>Of the changes that account for this transformation, one was visible and widely publicised: in 2011, Murray invited former number one player Ivan Lendl onto his coaching team – a valuable addition that had a visible impact on the player’s playing style. Another change was so subtle as to pass more or less unnoticed. Like many players, Murray has long preferred a racket that consists of two types of string: one for the mains (verticals) and another for the crosses (horizontals).</p><p>While he continued to use natural string in the crosses, in 2012 he switched to a synthetic string for the mains. A small change, perhaps, but its importance should not be underestimated.</p><p>The modification that Murray made is just one of a number of options available to players looking to tweak their rackets in order to improve their games. ‘Touring professionals have their rackets customised to their specific needs,’ says Colin Triplow, a UK-based professional racket stringer.</p><p>‘It’s a highly important part of performance maximisation.’ Consequently, the specific rackets used by the world’s elite are not actually readily available to the public; rather, each racket is individually made to suit the player who uses it. Take the US professional tennis players Mike and Bob Bryan, for example: ‘We’re very particular with our racket specifications,’ they say.</p><p>‘All our rackets are sent from our manufacturer to Tampa, Florida, where our frames go through a … thorough customisation process.’ They explain how they have adjusted not only racket length, but even experimented with different kinds of paint. The rackets they use now weigh more than the average model and also have a denser string pattern (i.e. more crosses and mains).</p><p>The primary reason for these modifications is simple: as the line between winning and losing becomes thinner and thinner, even these slight changes become more and more important. As a result, players and their teams are becoming increasingly creative with the modifications to their rackets as they look to maximise their competitive advantage.</p><p>Racket modifications mainly date back to the 1970s, when the amateur German tennis player Werner Fischer started playing with the so-called spaghetti-strung racket. It created a string bed that generated so much topspin that it was quickly banned by the International Tennis Federation. However, within a decade or two, racket modification became a regularity. Today it is, in many ways, an aspect of the game that is equal in significance to nutrition or training.</p><p>Modifications can be divided into two categories: those to the string bed and those to the racket frame. The former is far more common than the latter: the choice of the strings and the tension with which they are installed is something that nearly all professional players experiment with. They will continually change it depending on various factors including the court surface, climatic conditions, and game styles. Some will even change it depending on how they feel at the time.</p><p>At one time, all tennis rackets were strung with natural gut made from the outer layer of sheep or cow intestines. This all changed in the early 1990s with the development of synthetic strings that were cheaper and more durable. They are made from three materials: nylon (relatively durable and affordable), Kevlar (too stiff to be used alone) or co-polyester (polyester combined with additives that enhance its performance).</p><p>Even so, many professional players continue to use a ‘hybrid set-up’, where a combination of both synthetic and natural strings are used.</p><p>Of the synthetics, co-polyester is by far the most widely used. It’s a perfect fit for the style of tennis now played, where players tend to battle it out from the back of the court rather than coming to the net. Studies indicate that the average spin from a co-polyester string is 25% greater than that from natural string or other synthetics. In a sense, the development of co-polyester strings has revolutionised the game.</p><p>However, many players go beyond these basic adjustments to the strings and make changes to the racket frame itself. For example, much of the serving power of US professional player Pete Sampras was attributed to the addition of four to five lead weights onto his rackets, and today many professionals have the weight adjusted during the manufacturing process.</p><p>Other changes to the frame involve the handle. Players have individual preferences for the shape of the handle and some will have the handle of one racket moulded onto the frame of a different racket. Other players make different changes. The professional Portuguese player Gonçalo Oliveira replaced the original grips of his rackets with something thinner because they had previously felt uncomfortable to hold.</p><p>Racket customisation and modification have pushed the standards of the game to greater levels that few could have anticipated in the days of natural strings and heavy, wooden frames, and it’s exciting to see what further developments there will be in the future.</p>"
      },
      {
        "section": 2,
        "title": "The pirates of the ancient Mediterranean",
        "contentHtml": "<h2>The pirates of the ancient Mediterranean</h2><p>In the first and second millennia BCE, pirates sailed around the Mediterranean, attacking ships and avoiding pursuers</p><p><strong>A</strong> When one mentions pirates, an image springs to most people’s minds of a crew of misfits, daredevils and adventurers in command of a tall sailing ship in the Caribbean Sea. Yet from the first to the third millennium BCE, thousands of years before these swashbucklers began spreading fear across the Caribbean, pirates prowled the Mediterranean, raiding merchant ships and threatening vital trade routes. However, despite all efforts and the might of various ancient states, piracy could not be stopped.</p><p>The situation remained unchanged for thousands of years. Only when the pirates directly threatened the interests of ancient Rome did the Roman Republic organise a massive fleet to eliminate piracy. Under the command of the Roman general Pompey, Rome eradicated piracy, transforming the Mediterranean into ‘Mare Nostrum’ (Our Sea).</p><p><strong>B</strong> Although piracy in the Mediterranean is first recorded in ancient Egypt during the reign of Pharaoh Amenhotep III (c 1390-1353 BCE), it is reasonable to assume it predated this powerful civilisation. This is partly due to the great importance the Mediterranean held at this time, and partly due to its geography. While the Mediterranean region is predominantly fertile, some parts are rugged and hilly, even mountainous.</p><p>In the ancient times, the inhabitants of these areas relied heavily on marine resources, including fish and salt. Most had their own boats, possessed good seafaring skills, and unsurpassed knowledge of the local coastline and sailing routes. Thus, it is not surprising that during hardships, these men turned to piracy. Geography itself further benefited the pirates, with the numerous coves along the coast providing places for them to hide their boats and strike undetected.</p><p>Before the invention of ocean-going caravels in the 15th century, ships could not easily cross long distances over open water. Thus, in the ancient world most were restricted to a few well- known navigable routes that followed the coastline. Caught in a trap, a slow merchant ship laden with goods had no other option but to surrender. In addition, knowledge of the local area helped the pirates to avoid retaliation once a state fleet arrived.</p><p><strong>C</strong> One should also add that it was not unknown in the first and second millennia BCE for governments to resort to pirates’ services, especially during wartime, employing their skills and numbers against their opponents. A pirate fleet would serve in the first wave of attack, preparing the way for the navy. Some of the regions were known for providing safe harbours to pirates, who, in return, boosted the local economy.</p><p><strong>D</strong> The first known record of a named group of Mediterranean pirates, made during the rule of ancient Egyptian Pharaoh Akhenaten (c 1353-1336 BCE), was in the Amarna Letters. These were extracts of diplomatic correspondence between the pharaoh and his allies, and covered many pressing issues, including piracy. It seems the pharaoh was troubled by two distinct pirate groups, the Lukka and the Sherden.</p><p>Despite the Egyptian fleet’s best efforts, the pirates continued to cause substantial disruption to regional commerce. In the letters, the king of Alashiya (modern Cyprus) rejected Akhenaten’s claims of a connection with the Lukka (based in modern-day Turkey). The king assured Akhenaten he was prepared to punish any of his subjects involved in piracy.</p><p><strong>E</strong> The ancient Greek world’s experience of piracy was different from that of Egyptian rulers. While Egypt’s power was land-based, the ancient Greeks relied on the Mediterranean in almost all aspects of life, from trade to warfare. Interestingly, in his works the Iliad and the Odyssey, the ancient Greek writer Homer not only condones, but praises the lifestyle and actions of pirates. The opinion remained unchanged in the following centuries.</p><p>The ancient Greek historian Thucydides, for instance, glorified pirates’ daring attacks on ships or even cities. For Greeks, piracy was a part of everyday life. Even high-ranking members of the state were not beyond engaging in such activities.</p><p>According to the Greek orator Demosthenes, in 355 BCE, Athenian ambassadors made a detour from their official travel to capture a ship sailing from Egypt, taking the wealth found onboard for themselves! The Greeks’ liberal approach towards piracy does not mean they always tolerated it, but attempts to curtail piracy were hampered by the large number of pirates operating in the Mediterranean.</p><p><strong>F</strong> The rising power of ancient Rome required the Roman Republic to deal with piracy in the Mediterranean. While piracy was a serious issue for the Republic, Rome profited greatly from its existence. Pirate raids provided a steady source of slaves, essential for Rome’s agriculture and mining industries. But this arrangement could work only while the pirates left Roman interests alone.</p><p>Pirate attacks on grain ships, which were essential to Roman citizens, led to angry voices in the Senate, demanding punishment of the culprits. Rome, however, did nothing, further encouraging piracy. By the 1st century BCE, emboldened pirates kidnapped prominent Roman dignitaries, asking for a large ransom to be paid. Their most famous hostage was none other than Julius Caesar, captured in 75 BCE.</p><p><strong>G</strong> By now, Rome was well aware that pirates had outlived their usefulness. The time had come for concerted action. In 67 BCE, a new law granted Pompey vast funds to combat the Mediterranean menace. Taking personal command, Pompey divided the entire Mediterranean into 13 districts, assigning a fleet and commander to each. After cleansing one district of pirates, the fleet would join another in the next district. The process continued until the entire Mediterranean was free of pirates.</p><p>Although thousands of pirates died at the hands of Pompey’s troops, as a long-term solution to the problem, many more were offered land in fertile areas located far from the sea. Instead of a maritime menace, Rome got productive farmers that further boosted its economy.</p>"
      },
      {
        "section": 3,
        "title": "The persistence and peril of misinformation",
        "contentHtml": "<h2>The persistence and peril of misinformation</h2><p>Brian Southwell looks at how human brains verify information and discusses some of the challenges of battling widespread falsehoods</p><p>Misinformation – both deliberately promoted and accidentally shared -is perhaps an inevitable part of the world in which we live, but it is not a new problem. People likely have lied to one another for roughly as long as verbal communication has existed. Deceiving others can offer an apparent opportunity to gain strategic advantage, to motivate others to action, or even to protect interpersonal bonds.</p><p>Moreover, people inadvertently have been sharing inaccurate information with one another for thousands of years.</p><p>However, we currently live in an era in which technology enables information to reach large audiences distributed across the globe,and thus the potential for immediate and widespread effects from misinformation now looms larger than in the past. Yet the means to correct misinformation might,over time,be found in those same patterns of mass communication and of the facilitated spread of information.</p><p>The main worry regarding misinformation is its potential to unduly influence attitudes and behavior, leading people to think and act differently than they would if they were correctly informed, as suggested by the research teams of Stephan Lewandowsky of the University of Bristol and Elizabeth Marsh of Duke University, among others.</p><p>In other words, we worry that misinformation might lead people to hold misperceptions (or false beliefs) and that these misperceptions, especially when they occur among large groups of people, may have detrimental, downstream consequences for health, social harmony, and the political climate.</p><p>At least three observations related to misinformation in the contemporary mass-media environment warrant the attention of researchers, policy makers, and really everyone who watches television, listens to the radio, or reads information online. First of all, people who encounter misinformation tend to believe it, at least initially. Secondly, electronic and print media often do not block many types of misinformation before it appears in content available to large audiences.</p><p>Thirdly, countering misinformation once it has enjoyed wide exposure can be a resource-intensive effort.</p><p>Knowing what happens when people initially encounter misinformation holds tremendous importance for estimating the potential for subsequent problems. Although it is fairly routine for individuals to come across information that is false, the question of exactly how – and when – we mentally label information as true or false has garnered philosophical debate.</p><p>The dilemma is neatly summarized by a contrast between how the 17th-century philosophers Rene Descartes and Baruch Spinoza described human information engagement, with conflicting predictions that only recently have been empirically tested in robust ways.</p><p>Descartes argued that a person only accepts or rejects information after considering its truth or falsehood; Spinoza argued that people accept all encountered information (or misinformation) by default and then subsequently verify or reject it through a separate cognitive process.</p><p>In recent decades, empirical evidence from the research teams of Erik Asp of the University of Chicago and Daniel Gilbert at Harvard University, among others, has supported Spinoza’s account: people appear to encode all new information as if it were true, even if only momentarily, and later tag the information as being either true or false, a pattern that seems consistent with the observation that mental resources for skepticism physically reside in a different part of the brain than the resources used in perceiving and encoding.</p><p>What about our second observation that misinformation often can appear in electronic or print media without being preemptively blocked? In support of this, one might consider the nature of regulatory structures in the United States: regulatory agencies here tend to focus on post hoc detection of broadcast information. Organizations such as the Food and Drug Administration (FDA) offer considerable monitoring and notification functions, but these roles typically do not involve preemptive censoring.</p><p>The IDA oversees direct-to-consumer prescription drug advertising, for example, and has developed mechanisms such as the ‘Bad Ad’ program, through which people can report advertising in apparent violation of FDA guidelines on drug risks. Such programs, although laudable and useful, do not keep false advertising off the airwaves. In addition, even misinformation that is successfully corrected can continue to affect attitudes.</p><p>This leads us to our third observation: a campaign to correct misinformation, even if rhetorically compelling, requires resources and planning to accomplish necessary reach and frequency. For corrective campaigns to be persuasive, audiences need to be able to comprehend them, which requires either effort to frame messages in ways that are accessible or effort to educate and sensitize audiences to the possibility of misinformation.</p><p>That some audiences might be unaware of the potential for misinformation also suggests the utility of media literacy efforts as early as elementary school. Even with journalists and scholars pointing to the phenomenon of ‘fake news’, people do not distinguish between demonstrably false stories and those based in fact when scanning and processing written information.</p><p>We live at a time when widespread misinformation is common. Yet at this time many people also are passionately developing potential solutions and remedies. The journey forward undoubtedly will be a long and arduous one.</p><p>Future remedies will require not only continued theoretical consideration but also the development and maintenance of consistent monitoring tools and a recognition among fellow members of society that claims which find prominence in the media that are insufficiently based in scientific consensus and social reality should be countered. Misinformation arises as a result of human fallibility and human information needs.</p><p>To overcome the worst effects of the phenomenon, we will need coordinated efforts over time, rather than any singular one-time panacea we could hope to offer.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 7,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–7</h3><p>Do the following statements agree with the information given in Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "People had expected Andy Murray to become the world’s top tennis player for at least five years before 2016.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "The change that Andy Murray made to his rackets attracted a lot of attention.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Most of the world’s top players take a professional racket stringer on tour with them.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Mike and Bob Bryan use rackets that are light in comparison to the majority of rackets.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Werner Fischer played with a spaghetti-strung racket that he designed himself.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "The weather can affect how professional players adjust the strings on their rackets.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "It was believed that the change Pete Sampras made to his rackets contributed to his strong serve.",
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
        "questionHtml": "<p>The tennis racket and how it has changed</p><p>• Mike and Bob Bryan made changes to the types of 8_______  used on their racket frames.</p><p>• Players were not allowed to use the spaghetti-strung racket because of the amount of 9_______  it created.</p><p>• Changes to rackets can be regarded as being as important as players’ diets or the 10_______  they do.</p><p>• All rackets used to have natural strings made from the 11_______  of animals.</p><p>• Pete Sampras had metal 12_______  put into the frames of his rackets.</p><p>• Gongalo Oliveira changed the 13_______  on his racket handles.</p>",
        "questions": [
          {
            "number": 8,
            "prompt": "* Mike and Bob Bryan made changes to the types of 8_______  used on their racket frames.",
            "options": [],
            "answerKey": "paint",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "* Players were not allowed to use the spaghetti-strung racket because of the amount of 9_______  it created.",
            "options": [],
            "answerKey": "topspin",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "* Changes to rackets can be regarded as being as important as players’ diets or the 10_______  they do.",
            "options": [],
            "answerKey": "training",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "* All rackets used to have natural strings made from the 11_______  of animals.",
            "options": [],
            "answerKey": "INTESTINES/ GUT",
            "acceptedAnswers": [
              "intestines",
              "gut"
            ]
          },
          {
            "number": 12,
            "prompt": "* Pete Sampras had metal 12_______  put into the frames of his rackets.",
            "options": [],
            "answerKey": "weights",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "* Gongalo Oliveira changed the 13_______  on his racket handles.",
            "options": [],
            "answerKey": "grips",
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
        "instructionHtml": "<h3>Questions 14–19</h3><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
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
            "prompt": "a reference to a denial of involvement in piracy",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "details of how a campaign to eradicate piracy was carried out",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "a mention of the circumstances in which states in the ancient world would make use of pirates",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "a reference to how people today commonly view pirates",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "an explanation of how some people were encouraged not to return to piracy",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "a mention of the need for many sailing vessels to stay relatively close to land",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 20,
        "to": 21,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 20–21</h3><p>Choose TWO letters, A-E.</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 20,
            "prompt": "Which TWO of the following statements does the writer make about inhabitants of the Mediterranean region in the ancient world?",
            "options": [
              "They often used stolen vessels to carry out pirate attacks.",
              "They managed to escape capture by the authorities because they knew the area so well.",
              "They paid for information about the routes merchant ships would take.",
              "They depended more on the sea for their livelihood than on farming.",
              "They stored many of the goods taken in pirate attacks in coves along the coastline."
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 21,
            "prompt": "Which TWO of the following statements does the writer make about inhabitants of the Mediterranean region in the ancient world?",
            "options": [
              "They often used stolen vessels to carry out pirate attacks.",
              "They managed to escape capture by the authorities because they knew the area so well.",
              "They paid for information about the routes merchant ships would take.",
              "They depended more on the sea for their livelihood than on farming.",
              "They stored many of the goods taken in pirate attacks in coves along the coastline."
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
        "from": 22,
        "to": 23,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 22–23</h3><p>Choose TWO letters, A–E.</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 22,
            "prompt": "Which TWO of the following statements does the writer make about piracy and ancient Greece?",
            "options": [
              "The state estimated that very few people were involved in piracy.",
              "Attitudes towards piracy changed shortly after the Iliad and the Odyssey were written.",
              "Important officials were known to occasionally take part in piracy.",
              "Every citizen regarded pirate attacks on cities as unacceptable.",
              "A favourable view of piracy is evident in certain ancient Greek texts."
            ],
            "answerKey": "C",
            "acceptedAnswers": [
              "E"
            ]
          },
          {
            "number": 23,
            "prompt": "Which TWO of the following statements does the writer make about piracy and ancient Greece?",
            "options": [
              "The state estimated that very few people were involved in piracy.",
              "Attitudes towards piracy changed shortly after the Iliad and the Odyssey were written.",
              "Important officials were known to occasionally take part in piracy.",
              "Every citizen regarded pirate attacks on cities as unacceptable.",
              "A favourable view of piracy is evident in certain ancient Greek texts."
            ],
            "answerKey": "E",
            "acceptedAnswers": [
              "C"
            ]
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
        "questionHtml": "<p>Ancient Rome and piracy</p><p>Piracy was an issue ancient Rome had to deal with, but it also brought some benefits for Rome. For example, pirates supplied slaves that were important for Rome’s industries. However, attacks on vessels transporting 24_______  resulted in calls for 25_______  for the pirates responsible. Nevertheless, piracy continued, with some pirates demanding a 26_______  for the return of the Roman officials they captured.</p>",
        "questions": [
          {
            "number": 24,
            "prompt": "Piracy was an issue ancient Rome had to deal with, but it also brought some benefits for Rome. For example, pirates supplied slaves that were important for Rome’s industries. However, attacks on vessels transporting 24_______  resulted in calls for 25_______  for the pirates responsible. Nevertheless, piracy continued, with some pirates demanding a 26_______  for the return of the Roman officials they captured.",
            "options": [],
            "answerKey": "grain",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "Piracy was an issue ancient Rome had to deal with, but it also brought some benefits for Rome. For example, pirates supplied slaves that were important for Rome’s industries. However, attacks on vessels transporting 24_______  resulted in calls for 25_______  for the pirates responsible. Nevertheless, piracy continued, with some pirates demanding a 26_______  for the return of the Roman officials they captured.",
            "options": [],
            "answerKey": "punishment",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "Piracy was an issue ancient Rome had to deal with, but it also brought some benefits for Rome. For example, pirates supplied slaves that were important for Rome’s industries. However, attacks on vessels transporting 24_______  resulted in calls for 25_______  for the pirates responsible. Nevertheless, piracy continued, with some pirates demanding a 26_______  for the return of the Roman officials they captured.",
            "options": [],
            "answerKey": "ransom",
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
            "prompt": "What point does the writer make about misinformation in the first paragraph?",
            "options": [
              "Misinformation is a relatively recent phenomenon.",
              "Some people find it easy to identify misinformation.",
              "Misinformation changes as it is passed from one person to another.",
              "There may be a number of reasons for the spread of misinformation."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "What does the writer say about the role of technology?",
            "options": [
              "It may at some point provide us with a solution to misinformation.",
              "It could fundamentally alter the way in which people regard information.",
              "It has changed the way in which organisations use misinformation.",
              "It has made it easier for people to check whether information is accurate."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "What is the writer doing in the fourth paragraph?",
            "options": [
              "comparing the different opinions people have of misinformation",
              "explaining how the effects of misinformation have changed over time",
              "outlining which issues connected with misinformation are significant today",
              "describing the attitude of policy makers towards misinformation in the media"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "What point does the writer make about regulation in the USA?",
            "options": [
              "The guidelines issued by the FDA need to be simplified.",
              "Regulation does not affect people’s opinions of new prescription drugs.",
              "The USA has more regulatory bodies than most other countries.",
              "Regulation fails to prevent misinformation from appearing in the media."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 31,
        "to": 36,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 31–36</h3><p>Complete the summary using the list of phrases, A-J, below</p><p>Write the correct letter. A-J, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "constant conflict",
            "additional evidence",
            "different locations",
            "experimental subjects",
            "short period",
            "extreme distrust",
            "frequent exposure",
            "mental operation",
            "dubious reason",
            "different ideas"
          ]
        },
        "questionHtml": "<table><tbody><tr><td>A. constant conflict</td><td>B. additional evidence</td><td>C. different locations</td></tr><tr><td>D. experimental subjects</td><td>E. short period</td><td>F. extreme distrust</td></tr><tr><td>G. frequent exposure</td><td>H. mental operation</td><td>I. dubious reason<p>What happens when people encounter misinformation?</p><p>Although people have 31_______  to misinformation, there is debate about precisely how and when we label something as true or untrue. The philosophers Descartes and Spinoza had 32_______  about how people engage with information.</p><p>While Descartes believed that people accept or reject information after considering whether it is true or not, Spinoza argued that people accepted all information they encountered (and by default misinformation) and did not verify or reject it until afterwards. Moreover, Spinoza believed that a distinct 33_______  is involved in these stages.</p><p>Recent research has provided 34_______  for Spinoza’s theory and it would appear that people accept all encountered information as if it were true, even if this is for an extremely 35_______ , and do not label the information as true or false until later. This is consistent with the fact that the resources for scepticism and the resources for perceiving and encoding are in 36_______  in the brain.</p></td></tr></tbody></table>",
        "questions": [
          {
            "number": 31,
            "prompt": "Although people have 31_______  to misinformation, there is debate about precisely how and when we label something as true or untrue. The philosophers Descartes and Spinoza had 32_______  about how people engage with information.",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "Although people have 31_______  to misinformation, there is debate about precisely how and when we label something as true or untrue. The philosophers Descartes and Spinoza had 32_______  about how people engage with information.",
            "options": [],
            "answerKey": "J",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "While Descartes believed that people accept or reject information after considering whether it is true or not, Spinoza argued that people accepted all information they encountered (and by default misinformation) and did not verify or reject it until afterwards. Moreover, Spinoza believed that a distinct 33_______  is involved in these stages.",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Recent research has provided 34_______  for Spinoza’s theory and it would appear that people accept all encountered information as if it were true, even if this is for an extremely 35_______ , and do not label the information as true or false until later. This is consistent with the fact that the resources for scepticism and the resources for perceiving and encoding are in 36_______  in the brain.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Recent research has provided 34_______  for Spinoza’s theory and it would appear that people accept all encountered information as if it were true, even if this is for an extremely 35_______ , and do not label the information as true or false until later. This is consistent with the fact that the resources for scepticism and the resources for perceiving and encoding are in 36_______  in the brain.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Recent research has provided 34_______  for Spinoza’s theory and it would appear that people accept all encountered information as if it were true, even if this is for an extremely 35_______ , and do not label the information as true or false until later. This is consistent with the fact that the resources for scepticism and the resources for perceiving and encoding are in 36_______  in the brain.",
            "options": [],
            "answerKey": "C",
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
        "instructionHtml": "<h3>Questions 37–40</h3><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "Campaigns designed to correct misinformation will fail to achieve their purpose if people are unable to understand them.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "Attempts to teach elementary school students about misinformation have been opposed.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "It may be possible to overcome the problem of misinformation in a relatively short period.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "The need to keep up with new information is hugely exaggerated in today’s world.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-19-2",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-19-academic-reading-test-2/",
    "sections": [
      {
        "section": 1,
        "title": "The Industrial Revolution in Britain",
        "contentHtml": "<h2>The Industrial Revolution in Britain</h2><p>The Industrial Revolution began in Britain in the mid-1700s and by the 1830s and 1840s had spread to many other parts of the world, including the United States. In Britain, it was a period when a largely rural, agrarian* society was transformed into an industrialised, urban one.</p><p>Goods that had once been crafted by hand started to be produced in mass quantities by machines in factories, thanks to the invention of steam power and the introduction of new machines and manufacturing techniques in textiles, iron-making and other industries.</p><p>The foundations of the Industrial Revolution date back to the early 1700s, when the English inventor Thomas Newcomen designed the first modern steam engine. Called the ‘atmospheric steam engine’, Newcomen’s invention was originally used to power machines that pumped water out of mines. In the 1760s, the Scottish engineer James Watt started to adapt one of Newcomen’s models, and succeeded in making it far more efficient.</p><p>Watt later worked with the English manufacturer Matthew Boulton to invent a new steam engine driven by both the forward and backward strokes of the piston, while the gear mechanism it was connected to produced rotary motion. It was a key innovation that would allow steam power to spread across British industries.</p><p>The demand for coal, which was a relatively cheap energy source, grew rapidly during the Industrial Revolution, as it was needed to run not only the factories used to produce manufactured goods, but also steam-powered transportation. In the early 1800s, the English engineer Richard Trevithick built a steam-powered locomotive, and by 1830 goods and passengers were being transported between the industrial centres of Manchester and Liverpool.</p><p>In addition, steam-powered boats and ships were widely used to carry goods along Britain’s canals as well as across the Atlantic.</p><p>Britain had produced textiles like wool, linen and cotton, for hundreds of years, but prior to the Industrial Revolution, the British textile business was a true ‘cottage industry’, with the work performed in small workshops or even homes by individual spinners, weavers and dyers. Starting in the mid-1700s, innovations like the spinning jenny and the power loom made weaving cloth and spinning yarn and thread much easier.</p><p>With these machines, relatively little labour was required to produce cloth, and the new, mechanised textile factories that opened around the country were quickly able to meet customer demand for cloth both at home and abroad.</p><p>The British iron industry also underwent major change as it adopted new innovations. Chief among the new techniques was the smelting of iron ore with coke (a material made by heating coal) instead of the traditional charcoal. This method was cheaper and produced metals that were of a higher quality, enabling Britain’s iron and steel production to expand in response to demand created by the Napoleonic Wars (1803-15) and the expansion of the railways from the 1830s.</p><p>The latter part of the Industrial Revolution also saw key advances in communication methods, as people increasingly saw the need to communicate efficiently over long distances. In 1837, British inventors William Cooke and Charles Wheatstone patented the first commercial telegraphy system. In the 1830s and 1840s, Samuel Morse and other inventors worked on their own versions in the United States. Cooke and Wheatstone’s system was soon used for railway signalling in the UK.</p><p>As the speed of the new locomotives increased, it was essential to have a fast and effective means of avoiding collisions.</p><p>The impact of the Industrial Revolution on people’s lives was immense. Although many people in Britain had begun moving to the cities from rural areas before the Industrial Revolution, this accelerated dramatically with industrialisation, as the rise of large factories turned smaller towns into major cities in just a few decades. This rapid urbanisation brought significant challenges, as overcrowded cities suffered from pollution and inadequate sanitation.</p><p>Although industrialisation increased the country’s economic output overall and improved the standard of living for the middle and upper classes, many poor people continued to struggle. Factory workers had to work long hours in dangerous conditions for extremely low wages. These conditions along with the rapid pace of change fuelled opposition to industrialisation.</p><p>A group of British workers who became known as ‘Luddites’ were British weavers and textile workers who objected to the increased use of mechanised looms and knitting frames. Many had spent years learning their craft, and they feared that unskilled machine operators were robbing them of their livelihood. A few desperate weavers began breaking into factories and smashing textile machines.</p><p>They called themselves Luddites after Ned Ludd, a young apprentice who was rumoured to have wrecked a textile machine in 1779.</p><p>The first major instances of machine breaking took place in 1811 in the city of Nottingham, and the practice soon spread across the country. Machine-breaking Luddites attacked and burned factories, and in some cases they even exchanged gunfire with company guards and soldiers. The workers wanted employers to stop installing new machinery, but the British government responded to the uprisings by making machine-breaking punishable by death.</p><p>The unrest finally reached its peak in April 1812, when a few Luddites were shot during an attack on a mill near Huddersfield. In the days that followed, other Luddites were arrested, and dozens were hanged or transported to Australia. By 1813, the Luddite resistance had all but vanished.</p>"
      },
      {
        "section": 2,
        "title": "Athletes and stress",
        "contentHtml": "<h2>Athletes and stress</h2><p><strong>A</strong> It isn’t easy being a professional athlete. Not only are the physical demands greater than most people could handle, athletes also face intense psychological pressure during competition. This is something that British tennis player Emma Raducanu wrote about on social media following her withdrawal from the 2021 Wimbledon tournament.</p><p>Though the young player had been doing well in the tournament, she began having difficulty regulating her breathing and heart rate during a match, which she later attributed to ’the accumulation of the excitement and the buzz’.</p><p><strong>B</strong> For athletes, some level of performance stress is almost unavoidable. But there are many different factors that dictate just how people’s minds and bodies respond to stressful events. Typically, stress is the result of an exchange between two factors: demands and resources. An athlete may feel stressed about an event if they feel the demands on them are greater than they can handle.</p><p>These demands include the high level of physical and mental effort required to succeed, and also the athlete’s concerns about the difficulty of the event, their chance of succeeding, and any potential dangers such as injury. Resources, on the other hand, are a person’s ability to cope with these demands. These include factors such as the competitor’s degree of confidence, how much they believe they can control the situation’s outcome, and whether they’re looking forward to the event or not.</p><p><strong>C</strong> Each new demand or change in circumstances affects whether a person responds positively or negatively to stress. Typically, the more resources a person feels they have in handling the situation, the more positive their stress response. This positive stress response is called a challenge state. But should the person feel there are too many demands placed on them, the more likely they are to experience a negative stress response -known as a threat state.</p><p>Research shows that the challenge states lead to good performance, while threat states lead to poorer performance. So, in Emma Raducanu’s case, a much larger audience, higher expectations and facing a more skilful opponent, may all have led her to feel there were greater demands being placed on her at Wimbledon -but she didn’t have the resources to tackle them. This led to her experiencing a threat response.</p><p><strong>D</strong> Our challenge and threat responses essentially influence how our body responds to stressful situations, as both affect the production of adrenaline and cortisol-also known as ‘stress hormones’. During a challenge state, adrenaline increases the amount of blood pumped from the heart and expands the blood vessels, which allows more energy to be delivered to the muscles and brain.</p><p>This increase of blood and decrease of pressure in the blood vessels has been consistently related to superior sport performance in everything from cricket batting, to golf putting and football penalty taking. But during a threat state, cortisol inhibits the positive effect of adrenaline, resulting in tighter blood vessels, higher blood pressure, slower psychological responses, and a faster heart rate. In short, a threat state makes people more anxious -they make worse decisions and perform more poorly.</p><p>In tennis players, cortisol has been associated with more unsuccessful serves and greater anxiety.</p><p><strong>E</strong> That said, anxiety is also a common experience for athletes when they’re under pressure. Anxiety can increase heart rate and perspiration, cause heart palpitations, muscle tremors and shortness of breath, as well as headaches, nausea, stomach pain, weakness and a desire to escape in more extreme cases. Anxiety can also reduce concentration and self-control and cause overthinking. The intensity with which a person experiences anxiety depends on the demands and resources they have.</p><p>Anxiety may also manifest itself in the form of excitement or nervousness depending on the stress response. Negative stress responses can be damaging to both physical and mental health - and repeated episodes of anxiety coupled with negative responses can increase risk of heart disease and depression.</p><p><strong>F</strong> But there are many ways athletes can ensure they respond positively under pressure. Positive stress responses can be promoted through the language that they and others – such as coaches or parents – use. Psychologists can also help athletes change how they see their physiological responses – such as helping them see a higher heart rate as excitement, rather than nerves. Developing psychological skills, such as visualisation, can also help decrease physiological responses to threat.</p><p>Visualisation may involve the athlete recreating a mental picture of a time when they performed well, or picturing themselves doing well in the future. This can help create a feeling of control over the stressful event. Recreating competitive pressure during training can also help athletes learn how to deal with stress. An example of this might be scoring athletes against their peers to create a sense of competition.</p><p>This would increase the demands which players experience compared to a normal training session, while still allowing them to practise coping with stress.</p>"
      },
      {
        "section": 3,
        "title": "An inquiry into the existence of the gifted child",
        "contentHtml": "<h2>An inquiry into the existence of the gifted child</h2><p>Let us start by looking at a modern ‘genius’, Maryam Mirzakhani, who died at the early age of 40. She was the only woman to win the Fields Medal the mathematical equivalent of a Nobel prize. It would be easy to assume that someone as special as Mirzakhani must have been one of those ‘gifted’ children, those who have an extraordinary ability in a specific sphere of activity or knowledge. But look closer and a different story emerges. Mirzakhani was born in Tehran, Iran.</p><p>She went to a highly selective girls’ school but maths wasn’t her interest - reading was. She loved novels and would read anything she could lay her hands on. As for maths, she did rather poorly at it for the first couple of years in her middle school, but became interested when her elder brother told her about what he’d learned. He shared a famous maths problem from a magazine that fascinated her and she was hooked.</p><p>In adult life it is clear that she was curious, excited by what she did and also resolute in the face of setbacks. One of her comments sums it up. ‘Of course, the most rewarding part is the “Alia” moment, the excitement of discovery and enjoyment of understanding something new … But most of the time, doing mathematics for me is like being on a long hike with no trail and no end in sight.’ That trail took her to the heights of original research into mathematics.</p><p>Is her background unusual? Apparently not. Most Nobel prize winners were unexceptional in childhood. Einstein was slow to talk as a baby. He failed the general part of the entry test to Zurich Polytechnic – though they let him in because of high physics and maths scores. He struggled at work initially, but he kept plugging away and eventually rewrote the laws of Newtonian mechanics with his theory of relativity.</p><p>There has been a considerable amount of research on high performance over the last century that suggests it goes way beyond tested intelligence. On top of that, research is clear that brains are flexible, new neural pathways can be created, and IQ isn’t fixed. For example, just because you can read stories with hundreds of pages at the age of five doesn’t mean you will still be ahead of your contemporaries in your teens.</p><p>While the jury is out on giftedness being innate and other factors potentially making the difference, what is certain is that the behaviours associated with high levels of performance are replicable and most can be taught even traits such as curiosity.</p><p>According to my colleague Prof Deborah Eyre, with whom I’ve collaborated on the book Great Minds and How to Crow Them, the latest neuroscience and psychological research suggests most individuals can reach levels of performance associated in school with the gifted and talented. However, they must be taught the right attitudes and approaches to their learning and develop the attributes of high performers-curiosity, persistence and hard work, for example an approach Eyre calls ‘high performance learning’.</p><p>Critically, they need the right support in developing those approaches at home as well as at school.</p><p>Prof Anders Ericsson, an eminent education psychologist at Florida State University, US, is the co-author of Peak: Secrets from the New Science of Expertise. After research going back to 1980 into diverse achievements, from music to memory to sport, he doesn’t think unique and innate talents are at the heart of performance. Deliberate practice, that stretches you every step of the way, and around 10,000 hours of it, is what produces the goods.</p><p>It’s not a magic number the highest performers move on to doing a whole lot more, of course. Ericsson’s memory research is particularly interesting because random students, trained in memory techniques for the study, went on to outperform others thought to have innately superior memories those who you might call gifted.</p><p>But it is perhaps the work of Benjamin Bloom, another distinguished American educationist working in the 1980s, that gives the most pause for thought. Bloom’s team looked at a group of extraordinarily high achieving people in disciplines as varied as ballet, swimming, piano, tennis, maths, sculpture and neurology. He found a pattern of parents encouraging and supporting their children, often in areas they enjoyed themselves.</p><p>Bloom’s outstanding people had worked very hard and consistently at something they had become hooked on when at a young age, and their parents all emerged as having strong work ethics themselves.</p><p>Eyre says we know how high performers learn. From that she has developed a high performing learning approach. She is working on this with a group of schools, both in Britain and abroad. Some spin-off research, which looked in detail at 24 of the 3,000 children being studied who were succeeding despite difficult circumstances, found something remarkable.</p><p>Half were getting free school meals because of poverty, more than half were living with a single parent, and four in five were living in disadvantaged areas. Interviews uncovered strong evidence of an adult or adults in the child’s life who valued and supported education, either in the immediate or extended family or in the child’s wider community. Children talked about the need to work hard at school, to listen in class and keep trying.</p><p>Let us end with Einstein, the epitome of a genius. He clearly had curiosity, character and determination. He struggled against rejection in early life but was undeterred. Did he think he was a genius or even gifted? He once wrote: ‘It’s not that I’m so smart, it’s just that I stay with problems longer. Most people say it is the intellect which makes a great scientist. They are wrong: it is character.’</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 7,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–7</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Britain’s Industrial Revolution</p><p>Steam power</p><p>- Newcomen’s steam engine was used in mines to remove water.</p><p>- In Watt and Boulton’s steam engine, the movement of the 1_______  was linked to a gear system.</p><p>- A greater supply of 2_______  was required to power steam engines.</p><p>Textile industry</p><p>- Before the Industrial Revolution, spinners and weavers worked at home and in 3_______ </p><p>- Not as much 4_______  was needed to produce cloth once the spinning jenny and power loom were invented.</p><p>Iron industry</p><p>- Smelting of iron ore with coke resulted in material that was better 5_______ </p><p>- Demand for iron increased with the growth of the 6_______ </p><p>Communications</p><p>- Cooke and Wheatstone patented the first telegraphy system.</p><p>- The telegraphy system was used to prevent locomotives colliding.</p><p>Urbanisation</p><p>- Small towns turned into cities very quickly.</p><p>- The new cities were dirty, crowded and lacked sufficient 7_______ </p>",
        "questions": [
          {
            "number": 1,
            "prompt": "- In Watt and Boulton’s steam engine, the movement of the 1_______  was linked to a gear system.",
            "options": [],
            "answerKey": "piston",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "- A greater supply of 2_______  was required to power steam engines.",
            "options": [],
            "answerKey": "coal",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "- Before the Industrial Revolution, spinners and weavers worked at home and in 3_______ ",
            "options": [],
            "answerKey": "workshops",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "- Not as much 4_______  was needed to produce cloth once the spinning jenny and power loom were invented.",
            "options": [],
            "answerKey": "labour/ LABOR",
            "acceptedAnswers": [
              "labour",
              "labor"
            ]
          },
          {
            "number": 5,
            "prompt": "- Smelting of iron ore with coke resulted in material that was better 5_______ ",
            "options": [],
            "answerKey": "quality",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "- Demand for iron increased with the growth of the 6_______ ",
            "options": [],
            "answerKey": "railway(s)",
            "acceptedAnswers": [
              "railways",
              "railway"
            ]
          },
          {
            "number": 7,
            "prompt": "- The new cities were dirty, crowded and lacked sufficient 7_______ ",
            "options": [],
            "answerKey": "sanitation",
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
        "instructionHtml": "<h3>Questions 8–13</h3><p>Do the following statements agree with the claims of the writer in Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the claims of the writer</p><p>FALSE if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 8,
            "prompt": "Britain’s canal network grew rapidly so that more goods could be transported around the country.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "Costs in the iron industry rose when the technique of smelting iron ore with coke was introduced.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Samuel Morse's communication system was more reliable than that developed by William Cooke and Charles Wheatstone.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "The economic benefits of industrialisation were limited to certain sectors of society.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Some skilled weavers believed that the introduction of the new textile machines would lead to job losses.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "There was some sympathy among local people for the Luddites who were arrested near Huddersfield.",
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
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–18</h3><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
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
            "prompt": "reference to two chemical compounds which impact on performance",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "examples of strategies for minimising the effects of stress",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "how a sportsperson accounted for their own experience of stress",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "study results indicating links between stress responses and performance",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "mention of people who can influence how athletes perceive their stress responses",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 22,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 19–22</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• Performance stress involves many demands on the athlete, for example, coping with the possible risk of 19_______ </p><p>• Cortisol can cause tennis players to produce fewer good 20_______ </p><p>• Psychologists can help athletes to view their physiological responses as the effect of a positive feeling such as 21_______ </p><p>• 22_______  is an example of a psychological technique which can reduce an athlete’s stress responses.</p>",
        "questions": [
          {
            "number": 19,
            "prompt": "* Performance stress involves many demands on the athlete, for example, coping with the possible risk of 19_______ ",
            "options": [],
            "answerKey": "injury",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "* Cortisol can cause tennis players to produce fewer good 20_______ ",
            "options": [],
            "answerKey": "serves",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "* Psychologists can help athletes to view their physiological responses as the effect of a positive feeling such as 21_______ ",
            "options": [],
            "answerKey": "excitement",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "* 22_______  is an example of a psychological technique which can reduce an athlete’s stress responses.",
            "options": [],
            "answerKey": "VISUALISATION/ VISUALIZATION",
            "acceptedAnswers": [
              "Visualisation",
              "Visualization"
            ]
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
            "prompt": "Which TWO facts about Emma Raducanu’s withdrawal from the Wimbledon tournamentare mentioned in the text?",
            "options": [
              "the stage at which she dropped out of the tournament",
              "symptoms of her performance stress at the tournament",
              "measures which she had taken to manage her stress levels",
              "aspects of the Wimbledon tournament which increased her stress levels",
              "reactions to her social media posts about her experience at Wimbledon"
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 24,
            "prompt": "Which TWO facts about Emma Raducanu’s withdrawal from the Wimbledon tournamentare mentioned in the text?",
            "options": [
              "the stage at which she dropped out of the tournament",
              "symptoms of her performance stress at the tournament",
              "measures which she had taken to manage her stress levels",
              "aspects of the Wimbledon tournament which increased her stress levels",
              "reactions to her social media posts about her experience at Wimbledon"
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
        "instructionHtml": "<h3>Questions 25–26</h3><p>Choose TWO letters, A-E.</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 25,
            "prompt": "26",
            "options": [
              "the factors which determine how severe it may be",
              "how long it takes for its effects to become apparent",
              "which of its symptoms is most frequently encountered",
              "the types of athletes who are most likely to suffer from it",
              "the harm that can result if athletes experience it too often"
            ],
            "answerKey": "A",
            "acceptedAnswers": [
              "E"
            ]
          },
          {
            "number": 26,
            "prompt": "26",
            "options": [
              "the factors which determine how severe it may be",
              "how long it takes for its effects to become apparent",
              "which of its symptoms is most frequently encountered",
              "the types of athletes who are most likely to suffer from it",
              "the harm that can result if athletes experience it too often"
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
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 27–32</h3><p>Complete the summary using the list of phrases, A-K, below.</p><p>Write the correct letter, A-K, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "appeal",
            "determined",
            "intrigued",
            "single",
            "achievement",
            "devoted",
            "involved",
            "unique",
            "innovative",
            "satisfaction",
            "intent"
          ]
        },
        "questionHtml": "<table><tbody><tr><td>A appeal</td><td>B determined</td><td>C intrigued</td></tr><tr><td>D single</td><td>E achievement</td><td>F devoted</td></tr><tr><td>G involved</td><td>H unique</td><td>I innovative</td></tr><tr><td>J satisfaction</td><td>K intent<p>Maryam Mirzakhani</p><p>Maryam Mirzakhani is regarded as 27_______  in the field of mathematics because she was the only female holder of the prestigious Fields Medal - a record that she retained at the time of her death. However, maths held little 28_______  for her as a child and in fact her performance was below average until she was 29_______  by a difficult puzzle that one of her siblings showed her.</p><p>Later, as a professional mathematician, she had an inquiring mind and proved herself to be 30_______  when things did not go smoothly. She said she got the greatest 31_______  from making ground-breaking discoveries and in fact she was responsible for some extremely 32_______  mathematical studies.</p></td></tr></tbody></table>",
        "questions": [
          {
            "number": 27,
            "prompt": "Maryam Mirzakhani is regarded as 27_______  in the field of mathematics because she was the only female holder of the prestigious Fields Medal - a record that she retained at the time of her death. However, maths held little 28_______  for her as a child and in fact her performance was below average until she was 29_______  by a difficult puzzle that one of her siblings showed her.",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "Maryam Mirzakhani is regarded as 27_______  in the field of mathematics because she was the only female holder of the prestigious Fields Medal - a record that she retained at the time of her death. However, maths held little 28_______  for her as a child and in fact her performance was below average until she was 29_______  by a difficult puzzle that one of her siblings showed her.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "Maryam Mirzakhani is regarded as 27_______  in the field of mathematics because she was the only female holder of the prestigious Fields Medal - a record that she retained at the time of her death. However, maths held little 28_______  for her as a child and in fact her performance was below average until she was 29_______  by a difficult puzzle that one of her siblings showed her.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Later, as a professional mathematician, she had an inquiring mind and proved herself to be 30_______  when things did not go smoothly. She said she got the greatest 31_______  from making ground-breaking discoveries and in fact she was responsible for some extremely 32_______  mathematical studies.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Later, as a professional mathematician, she had an inquiring mind and proved herself to be 30_______  when things did not go smoothly. She said she got the greatest 31_______  from making ground-breaking discoveries and in fact she was responsible for some extremely 32_______  mathematical studies.",
            "options": [],
            "answerKey": "J",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "Later, as a professional mathematician, she had an inquiring mind and proved herself to be 30_______  when things did not go smoothly. She said she got the greatest 31_______  from making ground-breaking discoveries and in fact she was responsible for some extremely 32_______  mathematical studies.",
            "options": [],
            "answerKey": "I",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 33,
        "to": 37,
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 33–37</h3><p>Do the following statements agree with the claims of the writer in Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 33,
            "prompt": "Many people who ended up winning prestigious intellectual prizes only reached an average standard when young.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Einstein's failures as a young man were due to his lack of confidence.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "It is difficult to reach agreement on whether some children are actually born gifted.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Einstein was upset by the public's view of his life's work.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Einstein put his success down to the speed at which he dealt with scientific questions.",
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
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 38–40</h3><p>Choose the correct letter, A, B, C or D.</p><p>Write the correct letter in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 38,
            "prompt": "What does Eyre believe is needed for children to equal ’gifted’ standards?",
            "options": [
              "strict discipline from the teaching staff",
              "assistance from their peers in the classroom",
              "the development of a spirit of inquiry towards their studies",
              "the determination to surpass everyone else’s achievements"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "What is the result of Ericsson’s research?",
            "options": [
              "Very gifted students do not need to work on improving memory skills.",
              "Being born with a special gift is not the key factor in becoming expert.",
              "Including time for physical exercise is crucial in raising performance.",
              "10,000 hours of relevant and demanding work will create a genius."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "In the penultimate paragraph, it is stated the key to some deprived children's success is",
            "options": [
              "a regular and nourishing diet at home.",
              "the loving support of more than one parent.",
              "a community which has well-funded facilities for learning.",
              "the guidance of someone who recognises the benefits of learning."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-19-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-19-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "Archaeologists discover evidence of prehistoric island settlers",
        "contentHtml": "<h2>Archaeologists discover evidence of prehistoric island settlers</h2><p>In early April 2019, Dr Ceri Shipton and his colleagues from Australian National University became the first archaeologists to explore Obi, one of many tropical islands in Indonesia’s Maluku Utara province. The research team’s discoveries suggest that the prehistoric people who lived on Obi were adept on both land and sea, hunting in the dense rainforest, foraging on the seashore, and possibly even voyaging between islands.</p><p>The excavations were part of a project to learn more about how people first dispersed from mainland Asia, through the Indonesian archipelago and into the prehistoric continent that once connected Australia and New Guinea. The team’s earlier research suggested that the northernmost islands in the group, known as the Wallacean islands,including Obi, would have offered the easiest migration route.</p><p>It also seemed likely that these islands were crucial ‘stepping stones’ on humans’ island-hopping voyages through this region millennia ago. But to support this idea, they needed archaeological evidence for humans living in this remote area in the ancient past. So, they travelled to Obi to look for sites that might reveal evidence of early occupation.</p><p>Just inland from the village of Kelo on Obi’s northern coast, Shipton and his colleagues found two caves containing prehistoric rock shelters that were suitable for excavation. With the permission and help of the local people of Kelo, they dug a small test excavation in each shelter. There they found numerous artefacts, including fragments of axes, some dating to about 14,000 years ago. The earliest axes at Kelo were made using clam shells.</p><p>Axes made from clam shells from roughly the same time had also previously been found elsewhere in this region, including on the nearby island of Gebe to the northeast. As on Gebe, it is highly likely that Obi’s axes were used in the construction of canoes, thus allowing these early peoples to maintain connections between communities on neighbouring islands.</p><p>The oldest cultural layers from the Kelo site provided the team with the earliest record for human occupation on Obi, dating back around 18,000 years. At this time the climate was drier and colder than today, and the island’s dense rainforests would likely have been much less impenetrable than they are now. Sea levels were about 120 metres lower, meaning Obi was a much larger island, encompassing what is today the separate island of Bisa, as well as several other small islands nearby.</p><p>Roughly 11,700 years ago, as the most recent ice age ended, the climate became significantly warmer and wetter, no doubt making Obi’s jungle much thicker. According to the researchers, it is no coincidence that around this time the first axes crafted from stone rather than sea shells appear, likely in response to their heavy-duty use for clearing and modification of the increasingly dense rainforest.</p><p>While stone takes about twice as long to grind into an axe compared to shell, the harder material keeps its sharp edge for longer.</p><p>Judging by the bones which the researchers unearthed in the Kelo caves, people living there mainly hunted the Rothschild’s cuscus, a possum-like creature that still lives on Obi today. As the forest grew more dense, people probably used axes to clear patches of forest and make hunting easier. Shipton’s team’s excavation of the shelters at the Kelo site unearthed a volcanic glass substance called obsidian, which must have been brought over from another island, as there is no known source on Obi.</p><p>It also revealed particular types of beads, similar to those previously found on islands in southern Wallacea. These finds again support the idea that Obi islanders routinely travelled to other islands.</p><p>The excavations suggest people successfully lived in the two Kelo shelters for about 10,000 years. But then, about 8,000 years ago, both were abandoned. Did the residents leave Obi completely, or move elsewhere on the island? Perhaps the jungle had grown so thick that axes were no longer a match for the dense undergrowth. Perhaps people simply moved to the coast and turned to fishing rather than hunting as a means of survival.</p><p>Whatever the reason for the departure, there is no evidence for use of the Kelo shelters after this time, until about 1,000 years ago, when they were re-occupied by people who owned pottery as well as items made out of gold and silver. It seems likely, in view of Obi’s location, that this final phase of occupation also saw the Kelo shelters used by people involved in the historic trade in spices between the Maluku islands and the rest of the world.</p>"
      },
      {
        "section": 2,
        "title": "The global importance of wetlands",
        "contentHtml": "<h2>The global importance of wetlands</h2><p><strong>A</strong> Wetlands are areas where water covers the soil, or is present either at or near the surface of the soil, for all or part of the year. These are complex ecosystems, rich in unique plant and animal life. But according to the World Wide Fund for Nature (WWFN), half of the world’s wetlands have disappeared since 1990 – converted or destroyed for commercial development, drainage schemes and the extraction of minerals and peat.</p><p>Many of those that remain have been damaged by agricultural pesticides and fertilizers, industrial pollutants, and construction works.</p><p><strong>B</strong> Throughout history, humans have gathered around wetlands, and their fertile ecosystems have played an important part in human development. Consequently, they are of considerable religious, historical and archaeological value to many communities around the world. ‘Wetlands directly support the livelihoods and well-being of millions of people,’ says Dr Matthew McCartney, principal researcher and hydrologist at the International Water Management Institute (IWMI).</p><p>‘In many developing countries, large numbers of people are dependent on wetland agriculture for their livelihoods.’</p><p><strong>C</strong> They also serve a crucial environmental purpose. ‘Wetlands are one of the key tools in mitigating climate change across the planet,’ says Pieter van Eijk, head of Climate Adaptation at Wetlands International (WI), pointing to their use as buffers that protect coastal areas from sea-level rise and extreme weather events such as hurricanes and flooding.</p><p>Wetland coastal forests provide food and water, as well as shelter from storms, and WI and other agencies are working to restore those forests which have been lost. ‘It can be as simple as planting a few trees per hectare to create shade and substantially change a microclimate,’ he says. ‘Implementing climate change projects isn’t so much about money.’</p><p><strong>D</strong> The world’s wetlands are, unfortunately, rich sources for in-demand commodities, such as palm oil and pulpwood. Peatlands – wetlands with a waterlogged organic soil layer – are particularly targeted. When peatlands are drained for cultivation, they become net carbon emitters instead of active carbon stores, and, according to Marcel Silvius, head of Climate-smart Land-use at WI, this practice causes six per cent of all global carbon emissions.</p><p>The clearance of peatlands for planting also increases the risk of forest fires, which release huge amounts of CO₂. ‘We’re seeing huge peatland forests with extremely high biodiversity value being lost for a few decades of oil palm revenues,’ says Silvius.</p><p><strong>E</strong> The damage starts when logging companies arrive to clear the trees. They dig ditches to enter the peat swamps by boat and then float the logs out the same way. These are then used to drain water out of the peatlands to allow for the planting of corn, oil palms or pulpwood trees. Once the water has drained away, bacteria and fungi then break down the carbon in the peat and turn it into CO₂ and methane.</p><p>Meanwhile, the remainder of the solid matter in the peat starts to move downwards, in a process known as subsidence. Peat comprises 90 per cent water, so this is one of the most alarming consequences of peatland clearances. ‘In the tropics, peat subsides at about four centimetres a year, so within half a century, very large landscapes on Sumatra and Borneo will become flooded as the peat drops below water level,’ says Silvius. ‘It’s a huge catastrophe that’s in preparation.</p><p>Some provinces will lose 40 per cent of their landmass.’</p><p><strong>F</strong> And while these industries affect wetlands in ways that can easily be documented, Dr Dave Tickner of the WWFN believes that more subtle impacts can be even more devastating. ‘Sediment run-off and fertilizers can be pretty invisible,’ says Tickner. ‘Over-extraction of water is equally invisible. You do get shock stories about rivers running red, or even catching fire, but there’s seldom one big impact that really hurts a wetland.’ Tickner does not blame anyone for deliberate damage, however.</p><p>‘I’ve worked on wetland issues for 20 years and have never met anybody who wanted to damage a wetland,’ he says. ‘It isn’t something that people generally set out to do. Quite often, the effects simply come from people trying to make a living.’</p><p><strong>G</strong> Silvius also acknowledges the importance of income generation. ‘It’s not that we just want to restore the biodiversity of wetlands – which we do – but we recognise there’s a need to provide an income for local people.’ This approach is supported by IWMI. ‘The idea is that people in a developing country will only protect wetlands if they value and profit from them,’ says McCartney.</p><p>‘For sustainability, it’s essential that local people are involved in wetland planning and decision making and have clear rights to use wetlands.’</p><p><strong>H</strong> The fortunes of wetlands would be improved, Silvius suggests, if more governments recognized their long-term value. ‘Different governments have different attitudes,’ he says, and goes on to explain that some countries place a high priority on restoring wetlands, while others still deny the issue. McCartney is cautiously optimistic, however. ‘Awareness of the importance of wetlands is growing,’ he says.</p><p>‘It’s true that wetland degradation still continues at a rapid pace, but my impression is that things are slowly changing.’</p>"
      },
      {
        "section": 3,
        "title": "Is the era of artificial speech translation upon us?",
        "contentHtml": "<h2>Is the era of artificial speech translation upon us?</h2><p>Once the stuff of science fiction, technology that enables people to talk using different languages is now here. But how effective is it?</p><p>Noise, Alex Waibel tells me, is one of the major challenges that artificial speech translation has to meet. A device may be able to recognize speech in a laboratory, or a meeting room, but will struggle to cope with the kind of background noise I can hear in my office surrounding Professor Waibel as he speaks to me from Kyoto station in Japan.</p><p>I’m struggling to follow him in English, on a scratchy line that reminds me we are nearly 10,000 kilometers apart-and that distance is still an obstacle to communication even if you’re speaking the same language, as we are. We haven’t reached the future yet. If we had, Waibel would have been able to speak more comfortably in his native German and I would have been able to hear his words in English.</p><p>At Karlsruhe Institute of Technology, where he is a professor of computer science, Waibel and his colleagues already give lectures in German that their students can follow in English via an electronic translator. The system generates text that students can read on their laptops or phones, so the process is somewhat similar to subtitling. It helps that lecturers speak clearly, don’t have to compete with background chatter, and say much the same thing each year.</p><p>The idea of artificial speech translation has been around for a long time. Douglas Adams’ science fiction novel, The Hitchhiker’s Guide to the Galaxy, published in 1979, featured a life form called the ‘Babel fish’ which, when placed in the ear, enabled a listener to understand any language in the universe.</p><p>It came to represent one of those devices that technology enthusiasts dream of long before they become practically realizable, like TVs flat enough to hang on walls: objects that we once could only dream of having but that are now commonplace. Now devices that look like prototype Babel fish have started to appear, riding a wave of advances in artificial translation and voice recognition.</p><p>At this stage, however, they seem to be regarded as eye-catching novelties rather than steps towards what Waibel calls ‘making a language-transparent society.’ They tend to be domestic devices or applications suitable for hotel check-ins, for example, providing a practical alternative to speaking traveler’s English. The efficiency of the translator is less important than the social function.</p><p>However, ‘Professionals are less inclined to be patient in a conversation,’ founder and CEO at Waverly Labs, Andrew Ochoa, observes. To redress this, Waverly is now preparing a new model for professional applications, which entails performance improvements in speech recognition, translation accuracy and the time it takes to deliver the translated speech.</p><p>For a conversation, both speakers need to have devices called Pilots (translator earpieces) in their ears. ‘We find that there’s a barrier with sharing one of the earphones with a stranger,’ says Ochoa. That can’t have been totally unexpected. The problem would be solved if earpiece translators became sufficiently prevalent that strangers would be likely to already have their own in their ears.</p><p>Whether that happens, and how quickly, will probably depend not so much on the earpieces themselves, but on the prevalence of voice-controlled devices and artificial translation in general.</p><p>Waibel highlights the significance of certain Asian nations, noting that voice translation has really taken off in countries such as Japan with a range of systems. There is still a long way to go, though. A translation system needs to be simultaneous, like the translator’s voice speaking over the foreign politician being interviewed on the TV, rather than in sections that oblige speakers to pause after every few remarks and wait for the translation to be delivered.</p><p>It needs to work offline, for situations where internet access isn’t possible, and to address apprehensions about the amount of private speech data accumulating in the cloud, having been sent to servers for processing.</p><p>Systems not only need to cope with physical challenges such as noise, they will also need to be socially aware by addressing people in the right way. Some cultural traditions demand solemn respect for academic status, for example, and it is only polite to respect this. Etiquette-sensitive artificial translators could relieve people of the need to know these differing cultural norms.</p><p>At the same time, they might help to preserve local customs, slowing the spread of habits associated with international English, such as its readiness to get on first-name terms.</p><p>Professors and other professionals will not outsource language awareness to software, though. If the technology matures into seamless, ubiquitous artificial speech translation, it will actually add value to language skills.</p><p>Whether it will help people conduct their family lives or relationships is open to question-though one noteworthy possibility is that it could overcome the language barriers that often arise between generations after migration, leaving children and their grandparents without a shared language.</p><p>Whatever uses it is put to, though, it will never be as good as the real thing. Even if voice-morphing technology simulates the speaker’s voice, their lip movements won’t match, and they will look like they are in a dubbed movie. The contrast will underline the value of shared languages, and the value of learning them. Sharing a language can promote a sense of belonging and community, as with the international scientists who use English as a lingua franca, where their predecessors used Latin.</p><p>Though the practical need for a common language will diminish, the social value of sharing one will persist. And software will never be a substitute for the subtle but vital understanding that comes with knowledge of a language.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 7,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–7</h3><p>Do the following statements agree with the information given in Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "Archaeological research had taken place on the island of Obi before the arrival of Ceri Shipton and his colleagues.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "At the Kelo sites, the researchers found the first clam shell axes ever to be discovered in the region.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "The size of Obi today is less than it was 18,000 years ago.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "A change in the climate around 11,700 years ago had a greater impact on Obi than on the surrounding islands.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "The researchers believe there is a connection between warmer, wetter weather and a change in the material used to make axes.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "Shipton's team were surprised to find evidence of the Obi islanders’ hunting practices.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "It is thought that the Kelo shelters were occupied continuously until about 1,000 years ago.",
            "options": [],
            "answerKey": "FALSE",
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
        "questionHtml": "<p>Archaeological findings on Obi</p><p>Excavations of rock shelters inside 8_______  near the village of Kelo revealed:</p><p>- axes from around 14,000 years ago, probably used to make canoes</p><p>- axes made out of 9_______ , dating from around 11,700 years ago</p><p>- 10_______  of an animal: evidence of what ancient islanders ate</p><p>- evidence of travel between islands:</p><p>+ obsidian: a material that is not found naturally on Obi</p><p>+ 11_______  which resembled ones found on other islands.</p><p>It is thought that from 8,000 years ago, Obi islanders:</p><p>- may have switched from hunting to fishing</p><p>- had 12_______  as well as items made out of metal</p><p>- probably took part in the production and sale of 13_______ </p>",
        "questions": [
          {
            "number": 8,
            "prompt": "Excavations of rock shelters inside 8_______  near the village of Kelo revealed:",
            "options": [],
            "answerKey": "caves",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "- axes made out of 9_______ , dating from around 11,700 years ago",
            "options": [],
            "answerKey": "stone",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "- 10_______  of an animal: evidence of what ancient islanders ate",
            "options": [],
            "answerKey": "bones",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "+ 11_______  which resembled ones found on other islands.",
            "options": [],
            "answerKey": "beads",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "- had 12_______  as well as items made out of metal",
            "options": [],
            "answerKey": "pottery",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "- probably took part in the production and sale of 13_______ ",
            "options": [],
            "answerKey": "spices",
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
        "instructionHtml": "<h3>Questions 14–17</h3><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p>",
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
            "prompt": "reference to the need to ensure that inhabitants of wetland regions continue to benefit from them",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "the proportion of wetlands which have already been lost",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "reference to the idea that people are beginning to appreciate the value of wetlands",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "mention of the cultural significance of wetlands",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 18,
        "to": 22,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 18–22</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• Peatlands which have been drained begin to release 18_______  instead of storing it.</p><p>• Once peatland areas have been cleared, 19_______  are more likely to occur.</p><p>• Clearing peatland forests to make way for oil palm plantations destroys the 20_______  of the local environment.</p><p>• Water is drained out of peatlands through the 21_______  which are created by logging companies.</p><p>• Draining peatlands leads to 22_______  : a serious problem which can eventually result in coastal flooding and land loss.</p>",
        "questions": [
          {
            "number": 18,
            "prompt": "* Peatlands which have been drained begin to release 18_______  instead of storing it.",
            "options": [],
            "answerKey": "carbon",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "* Once peatland areas have been cleared, 19_______  are more likely to occur.",
            "options": [],
            "answerKey": "fires",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "* Clearing peatland forests to make way for oil palm plantations destroys the 20_______  of the local environment.",
            "options": [],
            "answerKey": "biodiversity",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "* Water is drained out of peatlands through the 21_______  which are created by logging companies.",
            "options": [],
            "answerKey": "ditches",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "* Draining peatlands leads to 22_______  : a serious problem which can eventually result in coastal flooding and land loss.",
            "options": [],
            "answerKey": "subsidence",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 26,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 23–26</h3><p>Look at the following statements and the list of experts below.</p><p>Match each statement with the correct expert, A-D.</p><p>Write the correct letter, A-D, in boxes on your answer sheet.</p>",
        "config": {
          "featureOptions": [
            "Matthew McCartney",
            "Pieter van Eijk",
            "Marcel Silvius",
            "Dave Tickner"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "Communities living in wetland regions must be included in discussions about the future of these areas",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "Official policies towards wetlands vary from one nation to the next",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "People cause harm to wetlands without having any intention to do so",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "Initiatives to reverse environmental damage need not be complex.",
            "options": [],
            "answerKey": "B",
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
            "prompt": "What does the reader learn about the conversation in the first paragraph?",
            "options": [
              "The speakers are communicating in different languages.",
              "Neither of the speakers is familiar with their environment.",
              "The topic of the conversation is difficult for both speakers.",
              "Aspects of the conversation are challenging for both speakers."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "What assists the electronic translator during lectures at Karlsruhe Institute of Technology?",
            "options": [
              "the repeated content of lectures",
              "the students’ reading skills",
              "the languages used",
              "the lecturers’ technical ability"
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "When referring to The Hitchhiker's Guide to the Galaxy, the writer suggests that",
            "options": [
              "the Babel fish was considered undesirable at the time.",
              "this book was not seriously intending to predict the future.",
              "artificial speech translation was not a surprising development.",
              "some speech translation techniques are better than others."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "What does the writer say about sharing earpieces?",
            "options": [
              "It is something people will get used to doing.",
              "The reluctance to do this is understandable.",
              "The equipment will be unnecessary in the future.",
              "It is something few people need to worry about."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 31,
        "to": 34,
        "type": "matching",
        "displayType": "sentence-ending",
        "instructionHtml": "<h3>Questions 31–34</h3><p>Complete each sentence with the correct ending, A-F, below.</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
        "config": {
          "sentenceEndings": [
            "but there are concerns about this",
            "as systems do not need to conform to standard practices.",
            "but they are far from perfect.",
            "despite the noise issues",
            "because translation is immediate.",
            "and have an awareness of good manners."
          ]
        },
        "questionHtml": "<p>• </p><p>Speech translation methods are developing fast in Japan</p><p>31_______ </p><p>• TV interviews that use translation voiceover methods are successful 32_______ </p><p>• Future translation systems should address people appropriately 33_______ </p><p>• Users may be able to maintain their local customs 34_______ </p>",
        "questions": [
          {
            "number": 31,
            "prompt": "31_______ ",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "• TV interviews that use translation voiceover methods are successful 32_______ ",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "• Future translation systems should address people appropriately 33_______ ",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "• Users may be able to maintain their local customs 34_______ ",
            "options": [],
            "answerKey": "B",
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
        "instructionHtml": "<h3>Questions 35–40</h3><p>Do the following statements agree with the views of the writer in Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the views of the writer</p><p>NO if the statement contradicts the views of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 35,
            "prompt": "Language translation systems will be seen as very useful throughout the academic and professional worlds.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "The overall value of automated translation to family life is yet to be shown.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Automated translation could make life more difficult for immigrant families.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "Visual aspects of language translation are being considered by scientists.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "International scientists have found English easier to translate into other languages than Latin.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "As far as language is concerned, there is a difference between people’s social and practical needs.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-19-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-19-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "The impact of climate change on butterflies in Britain",
        "contentHtml": "<h2>The impact of climate change on butterflies in Britain</h2><p>According to conservationists, populations of around two thirds of butterfly species have declined in Britain over the past 40 years. If this trend continues, it might have unpredictable knock-on effects for other species in the ecosystem. Butterfly eggs develop into caterpillars and these insects, which are the second stage in a new butterfly’s lifecycle, consume vast quantities of plant material, and in turn act as prey for birds as well as bats and other small mammals.</p><p>Only by arming themselves with an understanding of why butterfly numbers are down can conservationists hope to halt or reverse the decline.</p><p>Butterflies prefer outdoor conditions to be ‘just right’, which means neither too hot nor too cold. Under the conditions of climate change, the temperature at any given time in summer is generally getting warmer, leaving butterflies with the challenge of how to deal with this. One of the main ways in which species are ensuring conditions suit them is by changing the time of year at which they are active and reproduce.</p><p>Scientists refer to the timing of such lifecycle events as ‘phenology’, so when an animal or plant starts to do something earlier in the year than it usually does, it is said to be ‘advancing its phenology’.</p><p>These advances have been observed already in a wide range of butterflies – indeed, most species are advancing their phenology to some extent. In Britain, as the average spring temperature has increased by roughly 0.5°C over the past 20 years, species have advanced by between three days and a week on average, to keep in line with cooler temperatures.</p><p>Is this a sign that butterflies are well equipped to cope with climate change, and readily adjust to new temperatures? Or are these populations under stress, being dragged along unwillingly by unnaturally fast changes? The answer is still unknown, but a new study is seeking to answer these questions.</p><p>First, the researchers pulled together data from millions of records that had been submitted by butterfly enthusiasts-people who spend their free time observing the activities of different species. This provided information on 130 species of butterflies in Great Britain every year for a 20-year period. They then estimated the abundance and distribution of each species across this time, along with how far north in the country they had moved.</p><p>The data also, crucially, allowed researchers to estimate subtle changes in what time of the year each species was changing into an adult butterfly.</p><p>Analyzing the trends in each variable, the researchers discovered that species with more flexible lifecycles were more likely to be able to benefit from an earlier emergence driven by climate change. Some species are able to go from caterpillar to butterfly twice or more per year, so that the individual butterflies you see flying in the spring are the grandchildren or great-grandchildren of the individuals seen a year previously.</p><p>Among these species, researchers observed that those which have been advancing their phenology the most over the 20-year study period also had the most positive trends in abundance, distribution and northwards extent. For these species, such as Britain’s tiniest butterfly, the dainty Small Blue, whose colonies are up to a hundred strong, some develop into butterflies early in spring, allowing their summer generations to complete another reproductive cycle by autumn so that more population growth occurs.</p><p>Other species, however, are less flexible and restricted to a single reproductive cycle per year. For these species, there was no evidence of any benefit to emerging earlier. Indeed, worryingly, it was found that the species in this group that specialize in very specific habitat types, often related to the caterpillar’s preferred diet, actually tended to be most at harm from advancing phenology. The beautiful High Brown Fritillary, often described as Britain’s most endangered butterfly, is in this group.</p><p>It is found only in coppiced woodland and limestone pavement habitats. It is also a single-generation butterfly that has advanced its phenology. This suggests that climate change, while undoubtedly not the sole cause, might have played a part in the downfall of this species.</p><p>All is not lost, however. Many of Britain’s single-generation species show the capacity, in continental Europe, to add a second generation in years that are sufficiently warm. Therefore, as the climate continues to warm, species like the Silver-studded Blue might be able to switch to multiple generations in the UK as well, and so begin to extract benefits from the additional warmth, potentially leading to population increases.</p><p>More immediately, conservationists can arm themselves with all this knowledge to spot the warning signs of species that may be at risk. The White Admiral of southern England, a much sought-after butterfly, experienced a significant increase in numbers from the 1920s but has shown a considerable decline in the past 20 years. This may be because the caterpillar exists solely on a diet of a plant called honeysuckle. But it is also likely to be due to climate change.</p>"
      },
      {
        "section": 2,
        "title": "Deep-sea Mining",
        "contentHtml": "<h2>Deep-sea Mining</h2><p>Bacteria from the ocean floor can beat superbugs and cancer. But habitats are at risk from the hunger for marine minerals</p><p><strong>A</strong> When Professor Mat IJpton found that a microbe from a deep-sea sponge was killing pathogenic bugs in his laboratory, he realised it could be a breakthrough in the fight against antibiotic-resistant superbugs, which are responsible for thousands of deaths a year in the UK alone.</p><p>Further tests confirmed that an antibiotic from the sponge bacteria, found living more than 700 metres under the sea at the Rockall trough in the north-east Atlantic, was previously unknown to science, boosting its potential as a life-saving medicine.</p><p>But Upton, and other scientists who view the deep ocean and its wealth of unique and undocumented species as a prospecting ground for new medicines, fear such potential will be lost in the rush to exploit the deep sea’s equally rich metal and mineral resources.</p><p><strong>B</strong> ‘We’re looking at the bioactive potential of marine resources, to see if there are any more medicines or drugs down there before we destroy it for ever,’ says Upton, a medical microbiologist at the University of Plymouth. Ile is among many scientists urging a halt to deep-sea mining, asking for time to weigh up the pros and cons. ‘In sustainability terms, this could be a better way of exploiting the economic potential of the deep sea,’ he argues.</p><p>Oceanographers using remotely operated vehicles have spotted many new species. Among them have been sea cucumbers with tails allowing them to sail along the ocean floor, and a rare ‘Dumbo’octopus, found 3,000 metres under the Pacific Ocean, off the coast of California. Any one of these could offer lifesaving potential. Upton estimates it could take up to a decade for a newly discovered antibiotic to become a medicine but the race towards commercial mining in the ocean abyss has already begun.</p><p><strong>C</strong> The deep sea contains more nickel, cobalt and rare earth metals than all land reserves combined, according to the US Geological Survey. Mining corporations argue that deep-sea exploration could help diversify the supply of metals and point to the fact that demand for resources such as copper, aluminum, cobalt for electric car batteries and other metals to power technology and smartphones, is soaring. They say that deep-sea mining could yield far superior ore to land mining with little, if any, waste.</p><p>Different methods of extraction exist, but most involve employing some form of converted machinery previously used in terrestrial mining to excavate materials from the sea floor, at depths of up to 6,000 meters, then drawing a seawater slurry, containing rock and other solid particles, from the sea floor to ships on the surface. The slurry is then ‘de-watered ’ and transferred to another vessel for shipping. Extracted seawater is pumped back down and discharged close to the sea floor.</p><p><strong>D</strong> But environmental and legal groups have urged caution, arguing there are potentially massive and unknown ramifications for the environment and for nearby communities, and that the global regulatory framework is not yet drafted.</p><p>‘Despite arising in the last half century, the “new global gold rush” of deep-sea mining shares many features with past resource scrambles -including a general disregard for environmental and social impacts, and the marginalisation of indigenous peoples and their rights,a paper, written by Julie Hunter and Julian Aguon, from Blue Ocean Law,and Pradeep Singh, from the Center for Marine Environmental Sciences, Bremen, argues, ‘flic authors say that knowledge of the deep seabed remains extremely limited.‘The surface of the Moon, Mars and even Venus have all been mapped and studied in much greater detail, leading marine scientists to commonly remark that, with respect to the deep sea, “We don’t yet know what we need to know”.</p><p><strong>E</strong> Scientific research-including a recent paper in Marine Policy journal has suggested the deep seabed, and hydrothermal vents, which are created when seawater meets volcanic magma, have crucial impacts upon biodiversity and the global climate. The mineral-rich vents and their surrounds are also home to many well-known animals including crustaceans, tubeworms, clams, slugs, anemones and fish.</p><p>‘It is becoming increasingly clear that deep- sea mining poses a grave threat to these vital seabed functions,’ the paper says. ‘Extraction methods would produce large sediment plumes and involve the discharge of waste back into the ocean, significantly disturbing seafloor environments,’ the paper continues.‘On deep sea vents, scientists are clear,’ says Dr Jon Copley of the National Oceanography Centre, Southampton: ‘We don’t want mining on them.’</p><p><strong>F</strong> The oceans occupy around 70% of the planet and arc relatively unexplored, says Mike Johnston, chief executive of Nautilus, a Canadian underwater exploration company: ‘It makes sense to explore this untapped potential in an environmentally sustainable way, instead of continually looking at the fast depleting land resources of the planet to meet society’s rising needs.’Those leading the global rush to place giant mining machines thousands of metres below the sea surface say the environmental impacts will be far lower than on land.</p><p>But critics say exotic and little-known ecosystems in the deep oceans could be destroyed and must be protected. ‘Mining will be the greatest assault on deep-sea ecosystems ever inflicted by humans,’ according to hydrothermal vent expert Vcrena TunniclifTe, at the University of Victoria in Canada. She argues that active vents must be off-limits for mining to protect the new knowledge and biotechnology spin-offs they can deliver, and that strict controls must be in place elsewhere.</p>"
      },
      {
        "section": 3,
        "title": "The Unselfish Gene",
        "contentHtml": "<h2>The Unselfish Gene</h2><p>A psychologist gives his view on how humans became self-centred</p><p>There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.</p><p>This bleak view of human nature is closely associated with the science writer Richard Dawkins, whose 1976 book The Selfish Gene became popular because it fitted so well with-and helped to justify-the competitive and individualistic ethos that was so prevalent in late 20th-century societies. Like many others, Dawkins justifies his views with reference to the field of evolutionary psychology.</p><p>Evolutionary psychology theorises that present-day human traits developed in prehistoric times, during what is termed the ‘environment of evolutionary adaptedness’.</p><p>Prehistory is usually seen as a period of intense competition, when life was such a brutal battle that only those with traits such as selfishness, aggression and ruthlessness survived. And because survival depended on access to resources – such as rivers, forests and animals – there was bound to be conflict between rival groups, which led to the development of traits such as racism and warfare. This seems logical.</p><p>But, in fact, the assumption on which this all rests – that prehistoric life was a desperate struggle for survival – is false.</p><p>It’s important to remember that in the prehistoric era, the world was very sparsely populated. According to some estimates, around 15,000 years ago, the population of Europe was only 29,000, and the population of the whole world was less than half a million. Humans at that time were hunter-gatherers: people who lived by hunting wild animals and collecting wild plants.</p><p>With such small population densities, it seems unlikely that prehistoric hunter-gatherer groups had to compete against each other for resources or had any need to develop ruthlessness and competitiveness, or to go to war.</p><p>There is significant evidence to back this notion from contemporary hunter-gatherer groups, who live in the same way as prehistoric humans did. As the anthropologist Bruce Knauft has remarked, hunter-gatherers are characterized by ‘extreme political and sexual egalitarianism’. Knauft has observed that individuals in such groups don’t accumulate property or possessions and have an ethical obligation to share everything.</p><p>They also have methods of preserving egalitarianism by ensuring that disparities of status don’t arise.</p><p>The !Kung people of southern Africa, for example, swap arrows before going hunting and when an animal is killed, the acclaim does not go to the person who fired the arrow, but to the person the arrow belongs to. And if a person becomes too domineering, the other members of the group ostracise them, exiling the offender from society. Typically in such groups, men do not dictate what women do.</p><p>Women in hunter-gatherer groups worldwide often benefit from a high level of autonomy, being able to select their own marriage partners, decide what work they do and work whenever they choose to. And if a marriage breaks down, they have custody rights over their children.</p><p>Many anthropologists believe that societies such as the !Kung were normal until a few thousand years ago, when population growth led to the development of agriculture and a settled lifestyle. In view of the above, there seems little reason to assume that traits such as racism, warfare and male domination should have been selected by evolution-as they would have been of little benefit in the prehistoric era.</p><p>Individuals who behaved selfishly and ruthlessly would be less likely to survive, since they would have been ostracised from their groups.</p><p>It makes more sense, then, to see traits such as cooperation, egalitarianism, altruism and peacefulness as innate characteristics of human beings. These were the traits that were prevalent in human life for tens of thousands of years. So presumably these traits are still strong in us now.</p><p>But if prehistoric life wasn’t really as brutal as has often been assumed, why do modern humans behave so selfishly and ruthlessly? Perhaps these negative traits should be seen as a later development, the result of environmental and psychological factors. Research has shown repeatedly that when the natural habitats of primates such as apes and gorillas are disrupted, they tend to become more violent and hierarchical.</p><p>So, it could well be that the same thing has happened to us. I believe that the end of the hunter-gatherer lifestyle and the advent of farming was connected to a psychological change that occurred in some groups of people. There was a new sense of individuality and separateness, which led to a new selfishness, and ultimately to hierarchical societies, patriarchy and warfare.</p><p>At any rate, these negative traits appear to have developed so recently that it doesn’t seem feasible to explain them in adaptive or evolutionary terms.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 6,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–6</h3><p>Do the following statements agree with the information given in Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "Forty years ago, there were fewer butterflies in Britain than at present.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Caterpillars are eaten by a number of different predators.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "‘Phenology’ is a term used to describe a creature’s ability to alter the location of a lifecycle event.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "Some species of butterfly have a reduced lifespan due to spring temperature increases.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "There is a clear reason for the adaptations that butterflies are making to climate change.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "The data used in the study was taken from the work of amateur butterfly watchers.",
            "options": [],
            "answerKey": "TRUE",
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
        "instructionHtml": "<h3>Questions 7–13</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The Small Blue</p><p>• lives in large 7_______ </p><p>• first appears at the start of 8_______ </p><p>• completes more than one reproductive cycle per year</p><p>The High Brown Fritillary</p><p>• has one reproductive cycle</p><p>• is considered to be more 9_______  than other species</p><p>• its caterpillars occupy a limited range of 10_______ </p><p>The Silver-studded Blue</p><p>• is already able to reproduce twice a year in warm areas of 11_______ </p><p>The White Admiral</p><p>• is found in 12_______  areas of England</p><p>• both climate change and the 13_______  of the caterpillar are possible reasons for decline</p>",
        "questions": [
          {
            "number": 7,
            "prompt": "* lives in large 7_______ ",
            "options": [],
            "answerKey": "colonies",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "* first appears at the start of 8_______ ",
            "options": [],
            "answerKey": "spring",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "*is considered to be more 9_______  than other species",
            "options": [],
            "answerKey": "endangered",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "*its caterpillars occupy a limited range of 10_______ ",
            "options": [],
            "answerKey": "habitats",
            "acceptedAnswers": [
              "habitat"
            ]
          },
          {
            "number": 11,
            "prompt": "*is already able to reproduce twice a year in warm areas of 11_______ ",
            "options": [],
            "answerKey": "Europe",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "*is found in 12_______  areas of England",
            "options": [],
            "answerKey": "southern",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "*both climate change and the 13_______  of the caterpillar are possible reasons for decline",
            "options": [],
            "answerKey": "diet",
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
        "instructionHtml": "<h3>Questions 14–17</h3><p>Reading Passage has six paragraphs, A-F.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p>",
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
            "prompt": "reference to the rapidly increasing need for one raw material in the transport industry",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "a rough estimate of the area of the Earth covered by the oceans",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "how a particular underwater habitat, where minerals and organisms co-exist, is formed",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "reference to the fact that the countries of the world have yet to agree on rules for the exploration of the seabed",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 18,
        "to": 23,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 18–23</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person or people, A-E.</p><p>Write the correct letter, A-E, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Professor Mat Upton",
            "Julie Hunter, Julian Aguon and Pradeep Singh",
            "Dr Jon Copley",
            "Mike Johnston",
            "Verena Tunnicliffe"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 18,
            "prompt": "A move away from the exploration of heavily mined reserves on land is a good idea.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "The negative effects of undersea exploration on local areas and their inhabitants are being ignored.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "There are more worthwhile things to extract from the sea than minerals.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "No other form of human exploration will have such a destructive impact on marine life as deep-sea mining.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "More is known about outer space than about what lies beneath the oceans.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "There is one marine life habitat where experts agree mining should not take place.",
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
        "instructionHtml": "<h3>Questions 24–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Mining the sea floor</p><p>Mining corporations believe that the mineral resources lying under the sea may be superior to those found in the earth. They also say that these can be removed without producing much 24_______ .</p><p>The extraction is often done by adapting the 25_______  that has already been used to work on land. The method of excavation involves removing the seawater from the slurry that is brought up to ships and returning it to the seabed. However, concerned groups strongly believe that 26_______  is necessary due to the possible number of unidentified consequences.</p>",
        "questions": [
          {
            "number": 24,
            "prompt": "Mining corporations believe that the mineral resources lying under the sea may be superior to those found in the earth. They also say that these can be removed without producing much 24_______ .",
            "options": [],
            "answerKey": "waste",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "The extraction is often done by adapting the 25_______  that has already been used to work on land. The method of excavation involves removing the seawater from the slurry that is brought up to ships and returning it to the seabed. However, concerned groups strongly believe that 26_______  is necessary due to the possible number of unidentified consequences.",
            "options": [],
            "answerKey": "machinery",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "The extraction is often done by adapting the 25_______  that has already been used to work on land. The method of excavation involves removing the seawater from the slurry that is brought up to ships and returning it to the seabed. However, concerned groups strongly believe that 26_______  is necessary due to the possible number of unidentified consequences.",
            "options": [],
            "answerKey": "caution",
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
            "prompt": "What is the writer doing in the first paragraph?",
            "options": [
              "setting out two opposing views about human nature",
              "justifying his opinion about our tendency to be greedy",
              "describing a commonly held belief about people’s behaviour",
              "explaining why he thinks that humans act in a selfish manner"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "What point is made about Richard Dawkins’ book The Selfish Gene?",
            "options": [
              "Its appeal lay in the radical nature of its ideas.",
              "Its success was due to the scientific support it offered.",
              "It presented a view that was in line with the attitudes of its time.",
              "It took an innovative approach to the analysis of human psychology."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "What does the writer suggest about the prehistoric era in the fourth paragraph?",
            "options": [
              "Societies were more complex than many people believe.",
              "Supplies of natural resources were probably relatively plentiful.",
              "Most estimates about population sizes are likely to be inaccurate.",
              "Humans moved across continents more than was previously thought."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "The writer refers to Bruce Knauft’s work as support for the idea that",
            "options": [
              "selfishness is a relatively recent development in human societies.",
              "only people in isolated communities can live in an unselfish manner.",
              "very few lifestyles have survived unchanged since prehistoric times.",
              "hunter-gatherer cultures worldwide are declining in number."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 31,
        "to": 35,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 31–35</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>Contemporary hunter-gatherer societies</p><p>Bruce Knauft’s research shows that contemporary hunter-gatherer societies tend to exhibit a high level of 31_______  in all areas of life. In these cultures, distributing resources fairly among all members is a moral obligation. These societies also employ strategies to prevent differences in 32_______  occurring: for example, the !Kung follow a custom whereby the credit for one person’s success at 33_______  is given to another member of the group.</p><p>Individuals who behave in a 34_______  manner are punished by being excluded from the group, and women have a considerable amount of 35_______  in choices regarding work and marriage.</p>",
        "questions": [
          {
            "number": 31,
            "prompt": "Bruce Knauft’s research shows that contemporary hunter-gatherer societies tend to exhibit a high level of 31_______  in all areas of life. In these cultures, distributing resources fairly among all members is a moral obligation. These societies also employ strategies to prevent differences in 32_______  occurring: for example, the !Kung follow a custom whereby the credit for one person’s success at 33_______  is given to another member of the group.",
            "options": [],
            "answerKey": "egalitarianism",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "Bruce Knauft’s research shows that contemporary hunter-gatherer societies tend to exhibit a high level of 31_______  in all areas of life. In these cultures, distributing resources fairly among all members is a moral obligation. These societies also employ strategies to prevent differences in 32_______  occurring: for example, the !Kung follow a custom whereby the credit for one person’s success at 33_______  is given to another member of the group.",
            "options": [],
            "answerKey": "status",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Bruce Knauft’s research shows that contemporary hunter-gatherer societies tend to exhibit a high level of 31_______  in all areas of life. In these cultures, distributing resources fairly among all members is a moral obligation. These societies also employ strategies to prevent differences in 32_______  occurring: for example, the !Kung follow a custom whereby the credit for one person’s success at 33_______  is given to another member of the group.",
            "options": [],
            "answerKey": "hunting",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Individuals who behave in a 34_______  manner are punished by being excluded from the group, and women have a considerable amount of 35_______  in choices regarding work and marriage.",
            "options": [],
            "answerKey": "domineering",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Individuals who behave in a 34_______  manner are punished by being excluded from the group, and women have a considerable amount of 35_______  in choices regarding work and marriage.",
            "options": [],
            "answerKey": "autonomy",
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
        "instructionHtml": "<h3>Questions 36–40</h3><p>Do the following statements agree with the views of the writer in Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the views of the writer</p><p>NO if the statement contradicts the views of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 36,
            "prompt": "Some anthropologists are mistaken about the point when the number of societies such as the !Kung began to decline.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Humans who developed warlike traits in prehistory would have had an advantage over those who did not.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "Being peaceful and cooperative is a natural way for people to behave.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Negative traits are more apparent in some modern cultures than in others.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Animal research has failed to reveal a link between changes in the environment and the emergence of aggressive tendencies.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-20-1",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-20-academic-reading-test-1/",
    "sections": [
      {
        "section": 1,
        "title": "The kākāpō",
        "contentHtml": "<h2>The kākāpō</h2><p>The kakapo is a nocturnal, flightless parrot that is critically endangered and one of New Zealand ‘s unique treasures.</p><p>The kakapo, also known as the owl parrot, is a large, forest-dwelling bird, with a pale owl-like face. Up to 64 cm in length, it has predominantly yellow-green feathers, forward-facing eyes, a large grey beak, large blue feet, and relatively short wings and tail. It is the world’s only flightless parrot, and is also possibly one of the world’s longest-living birds, with a reported lifespan of up to 100 years.</p><p>Kakapo are solitary birds and tend to occupy the same home range for many years. They forage on the ground and climb high into trees. They often leap from trees and flap their wings, but at best manage a controlled descent to the ground. They are entirely vegetarian, with their diet including the leaves, roots and bark of trees as well as bulbs, and fern fronds.</p><p>Kakapo breed in summer and autumn, but only in years when food is plentiful. Males play no part in incubation or chick-rearing - females alone incubate eggs and feed the chicks. The 1-4 eggs are laid in soil, which is repeatedly turned over before and during incubation. The female kakapo has to spend long periods away from the nest searching for food, which leaves the unattended eggs and chicks particularly vulnerable to predators.</p><p>Before humans arrived, kakapo were common throughout New Zealand’s forests. However, this all changed with the arrival of the first Polynesian settlers about 700 years ago. For the early settlers, the flightless kakapo was easy prey. They ate its meat and used its feathers to make soft cloaks. With them came the Polynesian dog and rat, which also preyed on kakapo.</p><p>By the time European colonisers arrived in the early 1800s, kakapo had become confined to the central North Island and forested parts of the South Island. The fall in kakapo numbers was accelerated by European colonisation. A great deal of habitat was lost through forest clearance, and introduced species such as deer depleted the remaining forests of food. Other predators such as cats, stoats and two more species of rat were also introduced. The kakapo were in serious trouble.</p><p>In 1894, the New Zealand government launched its first attempt to save the kakapo. Conservationist Richard Henry led an effort to relocate several hundred of the birds to predator-free Resolution Island in Fiordland. Unfortunately, the island didn’t remain predator free – stoats arrived within six years, eventually destroying the kakapo population. By the mid-1900s, the kakapo was practically a lost species. Only a few clung to life in the most isolated parts of New Zealand.</p><p>From 1949 to 1973, the newly formed New Zealand Wildlife Service made over 60 expeditions to find kakapo, focusing mainly on Fiordland. Six were caught, but there were no females amongst them and all but one died within a few months of captivity.</p><p>In 1974, a new initiative was launched, and by 1977, 18 more kakapo were found in Fiordland. However, there were still no females. In 1977, a large population of males was spotted in Rakiura – a large island free from stoats, ferrets and weasels. There were about 200 individuals, and in 1980 it was confirmed females were also present. These birds have been the foundation of all subsequent work in managing the species.</p><p>Unfortunately, predation by feral cats on Rakiura Island led to a rapid decline in kakapo numbers. As a result, during 1980-97, the surviving population was evacuated to three island sanctuaries: Codfish Island, Maud Island and Little Barrier Island. However, breeding success was hard to achieve. Rats were found to be a major predator of kakapo chicks, and an insufficient number of chicks survived to offset adult mortality.</p><p>By 1995, although at least 12 chicks had been produced on the islands, only three had survived.</p><p>The kakapo population had dropped to 51 birds.</p><p>The critical situation prompted an urgent review of kakapo management in New Zealand. In 1996, a new Recovery Plan was launched, together with a specialist advisory group called the Kakapo Scientific and Technical Advisory Committee and a higher amount of funding. Renewed steps were taken to control predators on the three islands. Cats were eradicated from Little Barrier Island in 1980, and possums were eradicated from Codfish Island by 1986.</p><p>However, the population did not start to increase until rats were removed from all three islands, and the birds were more intensively managed. This involved moving the birds between islands, supplementary feeding of adults, and rescuing and hand-raising any failing chicks.</p><p>After the first five years of the Recovery Plan, the population was on target. By 2000, five new females had been produced, and the total population had grown to 62 birds. For the first time, there was cautious optimism for the filture of kakapo, and by June 2020, a total of 210 birds was recorded.</p><p>Today, kakapo management continues to be guided by the kakapo Recovery Plan. Its key goals are: minimise the loss of genetic diversity in the kakapo population, restore or maintain sufficient habitat to accommodate the expected increase in the kakapo population, and ensure stakeholders continue to be fully engaged in the preservation of the species.</p>"
      },
      {
        "section": 2,
        "title": "Reintroducing elms to Britain",
        "contentHtml": "<h2>Reintroducing elms to Britain</h2><p>Mark Rowe investigates attempts to reintroduce elms to Britain</p><p><strong>A</strong> Around 25 million elms, accounting for 90% of all elm trees in the UK, died during the 1960s and ’70s of Dutch elm disease. In the aftermath, the elm, once so dominant in the British landscape, was largely forgotten. However, there’s now hope the elm may be reintroduced to the countryside of central and southern England. Any reintroduction will start from a very low base. ‘The impact of the disease is difficult to picture if you hadn’t seen what was there before,’ says Matt Elliot of the Woodland Trust.</p><p>‘You look at old photographs from the 1960s and it’s only then that you realise the impact [elms had]. They were significant, large trees then they were gone.’</p><p><strong>B</strong> The disease is caused by a fungus that blocks the elms’ vascular (water, nutrient and food transport) system, causing branches to wilt and die. A first epidemic, which occurred in the 1920s, gradually died down, but in the '70s a second epidemic was triggered by shipments of elm from Canada. The wood came in the form of logs destined for boat building and its intact bark was perfect for the elm bark beetles that spread the deadly fungus.</p><p>This time, the beetles carried a much more virulent strain that destroyed the vast majority of British elms.</p><p><strong>C</strong> Today, elms still exist in the southern English countryside but mostly only in low hedgerows between fields. ‘We have millions of small elms in hedgerows but they get targeted by the beetle as soon as they reach a certain size,’ says Karen Russell, co-author of the report Where we are with elm. Once the trunk of the elm reaches 10-15 centimetres or so in diameter, it becomes a perfect size for beetles to lay eggs and for the fungus to take hold.</p><p>Yet mature specimens have been identified, in counties such as Cambridgeshire, that are hundreds of years old, and have mysteriously escaped the epidemic.</p><p>The key, Russell says, is to identify and study those trees that have survived and work out why they stood tall when millions of others succumbed. Nevertheless, opportunities are limited as the number of these mature survivors is relatively small. 'What are the reasons for their survival?' asks Russell. 'Avoidance, tolerance, resistance? We don't know where the balance lies between the three. I don't see how it can be entirely down to luck.'</p><p><strong>D</strong> For centuries, elm ran a close second to oak as the hardwood tree of choice in Britain and was in many instances the most prominent tree in the landscape. Not only was elm common in European forests, it became a key component of birch, ash and hazel woodlands. The use of elm is thought to go back to the Bronze Age, when it was widely used for tools. Elm was also the preferred material for shields and early swords.</p><p>In the 18th century, it was planted more widely and its wood was used for items such as storage crates and flooring. It was also suitable for items that experienced high levels of impact and was used to build the keel of the l9th-century sailing ship Cutty Sark as well as mining equipment.</p><p><strong>E</strong> Given how ingrained elm is in British culture, it’s unsurprising the tree has many advocates. Amongst them is Peter Bourne of the National Elm Collection in Brighton. ‘I saw Dutch elm disease unfold as a small boy,’ he says. ‘The elm seemed to be part of rural England, but I remember watching trees just lose their leaves and that really stayed with me.’ Today, the city of Brighton’s elms total about 17,000. Local factors appear to have contributed to their survival.</p><p>Strong winds from the sea make it difficult for the determined elm bark beetle to attack this coastal city’s elm population. However, the situation is precarious. ‘The beetles can just march in if we’re not careful, as the threat is right on our doorstep,’ says Bourne.</p><p><strong>F</strong> Any prospect of the elm returning relies heavily on trees being either resistant to, or tolerant of, the disease. This means a widespread reintroduction would involve existing or new hybrid strains derived from resistant, generally non-native elm species. A new generation of seedlings have been bred and tested to see if they can withstand the fungus by cutting a small slit on the bark and in ecting a tiny amount of the pathogen. 'The effects are very quick,' says Russell.</p><p>'You return in four to six weeks and trees that are resistant show no symptoms, whereas those that are susceptible show leaf loss and may even have died completely.'</p><p><strong>G</strong> All of this raises questions of social acceptance, acknowledges Russell. ‘If we’re putting elm back into the landscape, a small element of it is not native - are we bothered about that?’ For her, the environmental case for reintroducing elm is strong. 'They will host wildlife, which is a good thing.' Others are more wary. ‘On the face of it, it seems like a good idea,’ says Elliot. The problem, he suggests, is that, ‘You’re replacing a native species with a horticultural analogue.</p><p>You’re effectively cloning.’ There’s also the risk of introducing new diseases. Rather than plant new elms, the Woodland Trust emphasises providing space to those elms that have survived independently. ‘Sometimes the best thing you can do is just give nature time to recover over time, you might get resistance,’ says Elliot.</p><p>*horticultural analogue: a cultivated plant species that is genetically similar to an existing species.</p>"
      },
      {
        "section": 3,
        "title": "How stress affects our judgement",
        "contentHtml": "<h2>How stress affects our judgement</h2><p>Some of the most important decisions of our lives occur while we’re feeling stressed and anxious. From medical decisions to financial and professional ones, we are all sometimes required to weigh up information under stressful conditions. But do we become better or worse at processing and using information under such circumstances?</p><p>My colleague and I, both neuroscientists, wanted to investigate how the mind operates under stress, so we visited some local fire stations. Firefighters’ workdays vary quite a bit. Some are pretty relaxed, they’ll spend their time washing the truck, cleaning equipment, cooking meals and reading. Other days can be hectic, with numerous life-threatening incidents to attend to, they’ll enter burning homes to rescue trapped residents, and assist with medical emergencies.</p><p>These ups and downs presented the perfect setting for an experiment on how people’s ability to use information changes when they feel under pressure.</p><p>We found that perceived threat acted as a trigger for a stress reaction that made the task of processing information easier for the firefighters – but only as long as it conveyed bad news.</p><p>This is how we arrived at these results. We asked the firefighters to estimate their likelihood of experiencing 40 different adverse events in their life, such as being involved in an accident or becoming a victim of card fraud. We then gave them either good news (that their likelihood of experiencing these events was lower than they’d thought) or bad news (that it was higher) and asked them to provide new estimates.</p><p>People are normally quite optimistic -they will ignore bad news and embrace the good. This is what happened when the firefighters were relaxed, but when they were under stress, a different pattern emerged. Under these conditions, they became hyper-vigilant to bad news, even when it had nothing to do with their job (such as learning that the likelihood of card fraud was higher than they’d thought), and altered their beliefs in response.</p><p>In contrast, stress didn’t change how they responded to good news (such as learning that the likelihood of card fraud was lower than they’d thought).</p><p>Back in our lab, we observed the same pattern in students who were told they had to give a surprise public speech, which would be judged by a panel, recorded and posted online. Sure enough, their cortisol levels spiked, their heart rates went up and they suddenly became better at processing unrelated, yet alarming, information about rates of disease and violence.</p><p>When we experience stressful events, a physiological change is triggered that causes us to take in warnings and focus on what might go wrong. Brain imaging reveals that this ‘switch’ is related to a sudden boost in a neural signal important for learning, specifically in response to unexpected warning signs, such as faces expressing fear.</p><p>Such neural engineering could have helped prehistoric humans to survive. When our ancestors found themselves surrounded by hungry animals, they would have benefited from an increased ability to team about hazards. In a safe environment, however, it would have been wasteful to be on high alert constantly. So, a neural switch that automatically increases or decreases our ability to process warnings in response to changes in our environment could have been useful.</p><p>In fact, people with clinical depression and anxiety seem unable to switch away from a state in which they absorb all the negative messages around them.</p><p>It is also important to realise that stress travels rapidly from one person to the next. If a co-worker is stressed, we are more likely to tense up and feel stressed ourselves. We don’t even need to be in the same room with someone for their emotions to influence our behaviour. Studies show that if we observe positive feeds on social media, such as images of a pink sunset, we are more likely to post uplifting messages ourselves.</p><p>If we observe negative posts, such as complaints about a long queue at the coffee shop, we will in turn create more negative posts.</p><p>In some ways, many of us now live as if we are in danger, constantly ready to tackle demanding emails and text messages, and respond to news alerts and comments on social media. Repeatedly checking your phone, according to a survey conducted by the American Psychological Association, is related to stress. In other words, a pre-programmed physiological reaction, which evolution has equipped us with to help us avoid famished predators, is now being triggered by an online post.</p><p>Social media posting, according to one study, raises your pulse, makes you sweat, and enlarges your pupils more than most daily activities.</p><p>The fact that stress increases the likelihood that we will focus more on alarming messages, together with the fact that it spreads extremely rapidly, can create collective fear that is not always justified. After a stressful public event, such as a natural disaster or major financial crash, there is often a wave of alarming information in traditional and social media, which individuals become very aware of. But that has the effect of exaggerating existing danger.</p><p>And so, a reliable pattern emerges – stress is triggered, spreading from one person to the next, which temporarily enhances the likelihood that people will take in negative reports, which increases stress further. As a result, trips are cancelled, even if the disaster took place across the globe, stocks are sold, even when holding on is the best thing to do.</p><p>The good news, however, is that positive emotions, such as hope, are contagious too, and are powerful in inducing people to act to find solutions. Being aware of the close relationship between people’s emotional state and how they process information can help us frame our messages more effectively and become conscientious agents of change.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 6,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 1–6</h3><p>Do the following statements agree with the information given in Reading Passage?</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 1,
            "prompt": "There are other parrots that share the kakapos inability to fly.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "Adult kakapo produce chicks every year.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "Adult male kakapo bring food back to nesting females.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "The Polynesian rat was a greater threat to the kakapo than Polynesian settlers.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "Kakapo were transferred from Rakiura Island to other locations because they were at risk from feral cats.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "One Recovery Plan initiative that helped increase the kakapo population size was caring for struggling young birds.",
            "options": [],
            "answerKey": "TRUE",
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
        "instructionHtml": "<h3>Questions 7–13</h3><p>Complete the notes below.</p><p>Choose ONE WORD AND/OR NUMBER ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>New Zealand’s kakapo</p><p>Diet consists of fern fronds, various parts of a tree and 7_______ </p><p>Nests are created in 8_______  . where eggs are laid.</p><p>Arrival of Polynesian settlers</p><p>The 9_______  of the kakapo were used to make clothes.</p><p>Arrival of European colonisers</p><p>10_______  were an animal which they introduced that ate the kakapo's food sources.</p><p>Protecting kakapo</p><p>Richard Henry, a conservationist, tried to protect the kakapo.</p><p>11_______ </p><p>The Recovery Plan included an increase in 12_______ </p><p>A current goal of the Recovery Plan is to maintain the involvement of 13_______  in kakapo protection.</p>",
        "questions": [
          {
            "number": 7,
            "prompt": "Diet consists of fern fronds, various parts of a tree and 7_______ ",
            "options": [],
            "answerKey": "bulbs",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "Nests are created in 8_______  . where eggs are laid.",
            "options": [],
            "answerKey": "soil",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "The 9_______  of the kakapo were used to make clothes.",
            "options": [],
            "answerKey": "feathers",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "10_______  were an animal which they introduced that ate the kakapo's food sources.",
            "options": [],
            "answerKey": "deer",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "11_______ ",
            "options": [],
            "answerKey": "1980",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "The Recovery Plan included an increase in 12_______ ",
            "options": [],
            "answerKey": "funding",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "A current goal of the Recovery Plan is to maintain the involvement of 13_______  in kakapo protection.",
            "options": [],
            "answerKey": "stakeholders",
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
        "instructionHtml": "<h3>Questions 14–18</h3><p>Reading Passage has seven paragraphs, A–G.</p><p>Which section contains the following information?</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
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
            "prompt": "Reference to the research problems that arise from there being only a few surviving large elms",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "Details of a difference of opinion about the value of reintroducing elms to Britain",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Reference to how Dutch elm disease was brought into Britain",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "A description of the conditions that have enabled a location in Britain to escape Dutch elm disease",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "Reference to the stage at which young elms become vulnerable to Dutch elm disease",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 19,
        "to": 23,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 19–23</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person, A, B, or C.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Matt Elliot",
            "Karen Russell",
            "Peter Bourne"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 19,
            "prompt": "If a tree gets infected with Dutch elm disease, the damage rapidly becomes visible",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "It may be better to wait and see if the mature elms that have survived continue to flourish",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "There must be an explanation for the survival of some mature elms",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "We need to be aware that insects carrying Dutch elm disease are not very far away",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 23,
            "prompt": "You understand the effect Dutch elm disease has had when you see evidence of how prominent the tree once was",
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
        "instructionHtml": "<h3>Questions 24–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
        "config": {},
        "questionHtml": "<p>Uses of a Popular Tree</p><p>For hundreds of years, the only tree that was more popular in Britain than elm was 24_______ . Starting in the Bronze Age, many tools were made from elm, and people also used it to make weapons. In the 18th century, it was grown to provide wood for boxes and 25_______ . Due to its strength, elm was often used for mining equipment, and the Cutty Sark’s 26_______  was also constructed from elm.</p>",
        "questions": [
          {
            "number": 24,
            "prompt": "For hundreds of years, the only tree that was more popular in Britain than elm was 24_______ . Starting in the Bronze Age, many tools were made from elm, and people also used it to make weapons. In the 18th century, it was grown to provide wood for boxes and 25_______ . Due to its strength, elm was often used for mining equipment, and the Cutty Sark’s 26_______  was also constructed from elm.",
            "options": [],
            "answerKey": "oak",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "For hundreds of years, the only tree that was more popular in Britain than elm was 24_______ . Starting in the Bronze Age, many tools were made from elm, and people also used it to make weapons. In the 18th century, it was grown to provide wood for boxes and 25_______ . Due to its strength, elm was often used for mining equipment, and the Cutty Sark’s 26_______  was also constructed from elm.",
            "options": [],
            "answerKey": "flooring",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "For hundreds of years, the only tree that was more popular in Britain than elm was 24_______ . Starting in the Bronze Age, many tools were made from elm, and people also used it to make weapons. In the 18th century, it was grown to provide wood for boxes and 25_______ . Due to its strength, elm was often used for mining equipment, and the Cutty Sark’s 26_______  was also constructed from elm.",
            "options": [],
            "answerKey": "keel",
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
            "prompt": "In the first paragraph, the writer introduces the topic of the text by",
            "options": [
              "defining some commonly used terms.",
              "questioning a widely held assumption.",
              "mentioning a challenge faced by everyone.",
              "specifying a situation which makes us most anxious."
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "What point does the writer make about firefighters in the second paragraph?",
            "options": [
              "The regular changes of stress levels in their working lives make them ideal study subjects.",
              "The strategies they use to handle stress are of particular interest to researchers.",
              "The stressful nature of their job is typical of many public service professions.",
              "Their personalities make them especially well-suited to working under stress."
            ],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "What is the writer doing in the fourth paragraph?",
            "options": [
              "Explaining their findings",
              "Justifying their approach",
              "Setting out their objectives",
              "Describing their methodology"
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "In the seventh paragraph, the writer describes a mechanism in the brain which",
            "options": [
              "Enables people to respond more quickly to stressful situations.",
              "Results in increased ability to control our levels of anxiety.",
              "Produces heightened sensitivity to indications of external threats.",
              "Is activated when there is a need to communicate a sense of danger."
            ],
            "answerKey": "C",
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
        "instructionHtml": "<h3>Questions 31–35</h3><p>Complete each sentence with the correct ending, A-G, below.</p>",
        "config": {
          "sentenceEndings": [
            "made them feel optimistic.",
            "took relatively little notice of bad news.",
            "responded to negative and positive information in the same way.",
            "were feeling under stress.",
            "put them in a stressful situation.",
            "behaved in a similar manner, regardless of the circumstances.",
            "thought it more likely that they would experience something bad."
          ]
        },
        "questionHtml": "<p>• At times when they were relaxed, the firefighters usually 31_______ </p><p>• The researchers noted that when the firefighters were stressed, they 32_______ </p><p>• When the firefighters were told good news, they always 33_______ </p><p>• The students’ cortisol levels and heart rates were affected when the researchers 34_______ </p><p>• In both experiments, negative information was processed better when the subjects 35_______ </p>",
        "questions": [
          {
            "number": 31,
            "prompt": "• At times when they were relaxed, the firefighters usually 31_______ ",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "• The researchers noted that when the firefighters were stressed, they 32_______ ",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "• When the firefighters were told good news, they always 33_______ ",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "• The students’ cortisol levels and heart rates were affected when the researchers 34_______ ",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "• In both experiments, negative information was processed better when the subjects 35_______ ",
            "options": [],
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
        "instructionHtml": "<h3>Questions 36–40</h3><p>Do the following statements agree with the information given in Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 36,
            "prompt": "The tone of the content we post on social media tends to reflect the nature of the posts in our feeds.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "Phones have a greater impact on our stress levels than other electronic media devices.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "The more we read about a stressful public event on social media, the less able we are to take the information in.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Stress created by social media posts can lead us to take unnecessary precautions.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Our tendency to be affected by other people’s moods can be used in a positive way.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-20-2",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-20-academic-reading-test-2/",
    "sections": [
      {
        "section": 1,
        "title": "Manatees",
        "contentHtml": "<h2>Manatees</h2><p>Manatees, also known as sea cows, are aquatic mammals that belong to a group of animals called Sirenia. This group also contains dugongs. Dugongs and manatees look quite alike - they are similar in size, colour and shape, and both have flexible flippers for forelimbs. However, the manatee has a broad, rounded tail, whereas the dugongs is fluked, like that of a whale.</p><p>There are three species of manatees: the West Indian manatee (Trichechus manatus), the African manatee (Trichechus senegalensis) and the Amazonian manatee (Trichechus inunguis).</p><p>Unlike most mammals, manatees have only six bones in their neck – most others, including humans and giraffes, have seven. This short neck allows a manatee to move its head up and down, but not side to side. To see something on its left or its right, a manatee must turn its entire body, steering with its flippers. Manatees have pectoral flippers but no back limbs, only a tail for propulsion. They do have pelvic bones, however – a leftover from their evolution from a four-legged to a fully aquatic animal.</p><p>Manatees share some visual similarities to elephants. Like elephants, manatees have thick, wrinkled skin. They also have some hairs covering their bodies which help them sense vibrations in the water around them.</p><p>Seagrasses and other marine plants make up most of a manatee’s diet. Manatees spend about eight hours each day grazing and uprooting plants. They eat up to 15% of their weight in food each day. African manatees are omnivorous – studies have shown that molluscs and fish make up a small part of their diets. West Indian and Amazonian manatees are both herbivores.</p><p>Manatees’ teeth are all molars - flat, rounded teeth for grinding food. Due to manatees’ abrasive aquatic plant diet, these teeth get worn down and they eventually fall out, so they continually grow new teeth that get pushed forward to replace the ones they lose. Instead of having incisors to grasp their food, manatees have lips which function like a pair of hands to help tear food away from the seafloor.</p><p>Manatees are fully aquatic, but as mammals, they need to come up to the surface to breathe. When awake, they typically surface every two to four minutes, but they can hold their breath for much longer. Adult manatees sleep underwater for 10-12 hours a day, but they come up for air every 15-20 minutes. Active manatees need to breathe more frequently. It’s thought that manatees use their muscular diaphragm and breathing to adjust their buoyancy.</p><p>They may use diaphragm contractions to compress and store gas in folds in their large intestine to help them float.</p><p>The West Indian manatee reaches about 3.5 metros long and weighs on average around 500 kilo grammes. It moves between fresh water and salt water, taking advantage of coastal mangroves and coral reefs, rivers, lakes and inland lagoons. There are two subspecies of West Indian manatee: the Antillean manatee is found in waters from the Bahamas to Brazil, whereas the Florida manatee is found in US waters, although some individuals have been recorded in the Bahamas.</p><p>In winter, the Florida manatee is typically restricted to Florida. When the ambient water temperature drops below 20°C, it takes refuge in naturally and artificially warmed water, such as at the warm-water outfalls from powerplants.</p><p>The African manatee is also about 3.5 metros long and found in the sea along the west coast of Africa, from Mauritania down to Angola. The species also makes use of rivers, with the mammals seen in landlocked countries such as Mali and Niger. The Amazonian manatee is the smallest species, though it is still a big animal. It grows to about 2.5 metros long and 350 kilo grammes.</p><p>Amazonian manatees favour calm, shallow waters that are above 23°C This species is found in fresh water in the Amazon Basin in Brazil, as well as in Colombia, Ecuador and Peru.</p><p>All three manatee species are endangered or at a heightened risk of extinction. The African manatee and Amazonian manatee are both listed as Vulnerable by the International Union for Conservation of Nature (IUCN). It is estimated that 140,000 Amazonian manatees were killed between 1935 and 1954 for their meat, fat and skin, with the latter used to make leather. In more recent years, African manatee decline has been tied to incidental capture in fishing nets and hunting.</p><p>Manatee hunting is now illegal in every country the African species is found in.</p><p>The two subspecies of West Indian manatee are listed as Endangered by the IUCN. Both are also expected to undergo a decline of 20% over the next 40 years. A review of almost 1,800 cases of entanglement in fishing nets and of plastic consumption among marine mammals in US waters from 2009 to 2020 found that at least 700 cases involved manatees. The chief cause of death in Florida manatees is boat strikes.</p><p>However, laws in certain parts of Florida now limit boat speeds during winter, allowing slow-moving manatees more time to respond.</p>"
      },
      {
        "section": 2,
        "title": "Procrastination",
        "contentHtml": "<h2>Procrastination</h2><p><strong>A</strong> psychologist explains why we put off important tasks and how we can break this habit</p><p>A Procrastination is the habit of delaying a necessary task, usually by focusing on less urgent, more enjoyable, and easier activities instead. We all do it from time to time. We might be composing a message to a friend who we have to let down, or putting together an important report for college or work, we’re doing our best to avoid doing the job at hand, but deep down we know that we should just be getting on with it. Unfortunately, berating ourselves won’t stop us procrastinating again.</p><p>In fact, it’s one of the worst things we can do. This matters because, as my research shows, procrastination doesn’t just waste time, but is actually linked to other problems, too.</p><p><strong>B</strong> Contrary to popular belief, procrastination is not due to laziness or poor time management. Scientific studies suggest procrastination is, in fact, caused by poor mood management. This makes sense if we consider that people are more likely to put off starting or completing tasks that they are really not keen to do. If just thinking about the task threatens our sense of self-worth or makes us anxious, we will be more likely to put it off.</p><p>Research involving brain imaging has found that areas of the brain linked to detection of threats and emotion regulation are actually different in people who chronically procrastinate compared to those who don’t procrastinate frequently.</p><p><strong>C</strong> Tasks that are emotionally loaded or difficult, such as preparing for exams, are prime candidates for procrastination. People with low self-esteem are more likely to procrastinate. Another group of people who tend to procrastinate are perfectionists, who worry their work will be judged harshly by others. We know that if we don’t finish that report or complete those home repairs, then what we did can’t be evaluated. When we avoid such tasks, we also avoid the negative emotions associated with them.</p><p>This is rewarding, and it conditions us to use procrastination to repair our mood. If we engage in more enjoyable tasks instead, we get another mood boost. In the long run, however, procrastination isn’t an effective way of managing emotions. The ‘mood repair’ we experience is temporary. Afterwards, people tend to be left with a sense of guilt that not only increases their negative mood, but also reinforces their tendency to procrastinate.</p><p><strong>D</strong> So why is this such a problem? When most people think of the costs of procrastination, they think of the toll on productivity. For example, studies have shown that procrastination negatively impacts on student performance. But putting off reading textbooks and writing essays may affect other areas of students’ lives.</p><p>In one study of over 3,000 German students over a six-month period, those who reported procrastinating over their university work were also more likely to engage in study-related misconduct, such as cheating and plagiarism. But the behaviour that procrastination was most closely linked with was using fraudulent excuses to get deadline extensions. Other research shows that employees on average spend almost a quarter of their workday procrastinating, and again this is linked with negative outcomes.</p><p>In fact, in one US survey of over 22,000 employees, participants who said they regularly procrastinated had less annual income and less employment stability. For every one-point increase on a measure of chronic procrastination, annual income decreased by US$15,000.</p><p><strong>E</strong> Procrastination also correlates with serious health and well-being problems. A tendency to procrastinate is linked to poor mental health, including higher levels of depression and anxiety. Across numerous studies, I’ve found people who regularly procrastinate report a greater number of health issues, such as headaches, flu and colds, and digestive issues. They also experience higher levels of stress and poor sleep quality.</p><p>They are less likely to practise healthy behaviours, such as eating a healthy diet and regularly exercising, and use destructive coping strategies to manage their stress. In one study of over 700 people, I found people prone to procrastination had a 63% greater risk ofpoor heart health after accounting for other personality traits and demographics.</p><p><strong>F</strong> Finding better ways of managing our emotions is one route out of the vicious cycle of procrastination. An important first step is to manage our environment and how we view the task. There are a number of evidence-based strategies that can help us fend off distractions that can occupy our minds when we should be focusing on the thing we should be getting on with. For example, reminding ourselves about why the task is important and valuable can increase positive feelings towards it.</p><p>Forgiving ourselves and feeling compassion when we procrastinate can help break the procrastination cycle. We should admit that we feel bad, but not be overly critical of ourselves. We should remind ourselves that we’re not the first person to procrastinate, nor the last. Doing this can take the edge off the negative feelings we have about ourselves when we procrastinate. This can all make it easier to get back on track.</p>"
      },
      {
        "section": 3,
        "title": "Invasion of the Robot Umpires",
        "contentHtml": "<h2>Invasion of the Robot Umpires</h2><p>A few years ago, Fred DeJesus from Brooklyn, New York became the first umpire in a minor league baseball game to use something called the Automated Ball-Strike System (ABS), often referred to as the ‘rob-umpire’. Instead of making any judgments himself about a strike*, DeJesus had decisions fed to him through an earpiece, connected to a modified missile-tracking system. The contraption looked like a large black pizza box with one glowing green eye, it was mounted above the press stand.</p><p>Major League Baseball (MLB), who had commissioned the system, wanted human umpires to announce the calls, just as they would have done in the past. When the first pitch came in, a recorded voice told DeJesus it was a strike. Previously, calling a strike was a judgment call on the part of the umpire.</p><p>Even if the batter does not hit the ball, a pitch that passes through the ‘strike zone’ (an imaginary zone about seventeen inches wide, stretching from the batter’s knees to the middle of his chest) is considered a strike. During that first game, when DeJesus announced calls, there was no heckling and no shouted disagreement. Nobody said a word.</p><p>For a hundred and fifty years or so, the strike zone has been the game’s animating force - countless arguments between a team’s manager and the umpire have taken place over its boundaries and whether a ball had crossed through it. The rules of play have evolved in various stages. Today, everyone knows that you may scream your disagreement in an umpire’s face, but you must never shout personal abuse at them or touch them. That’s a no-no. When the robe-umpires came, however, the arguments stopped.</p><p>During the first robe-umpire season, players complained about some strange calls. In response, MLB decided to tweak the dimensions of the zone, and the following year the consensus was that ABS is profoundly consistent. MLB says the device is near-perfect, precise to within fractions of an inch. “It’ll reduce controversy in the game, and be good for the game,” says Rob Manfred, who is Commissioner for MLB.</p><p>But the question is whether controversy is worth reducing, or whether it is the sign of a human hand.</p><p>A human, at least, yells back. When I spoke with Frank Viola, a coach for a North Carolina team, he said that ABS works as designed, but that it was also unforgiving and pedantic, almost legalistic. “Manfred is a lawyer,” Viola noted. Some pitchers have complained that, compared with a humans, the robot’s strike zone seems too precise. Viola was once a major-league player himself. When he was pitching, he explained, umpires rewarded skill.</p><p>“Throw it where you aimed, and it would be a strike, even if it was an inch or two outside. There was a dialogue between pitcher and umpire.”</p><p>The executive tasked with running the experiment for MLB is Morgan Sword, who’s in charge of baseball operations. According to Sword, ABS was part of a larger project to make baseball more exciting since executives are terrified of losing younger fans, as has been the case with horse racing and boxing. He explains how they began the process by asking fans what version of baseball they found most exciting. The results showed that everyone wanted more action: more hits, more defense, more baserunning.</p><p>This type of baseball essentially hasn’t existed since the 1960s, when the hundred-mile-an-hour fastball, which is difficult to hit and control, entered the game. It flattened the game into strikeouts, walks, and home runs - a type of play lacking much action.</p><p>Sword’s team brainstormed potential fixes. Any rule that existed, they talked about changing - from changing the bats to changing the geometry of the field. But while all of these were ruled out as potential fixes, ABS was seen as a perfect vehicle for change. According to Sword, once you get the technology right, you can load any strike zone you want into the system. “It might be a triangle, or a blob, or something shaped like Texas.</p><p>Over time, as baseball evolves, ABS can allow the zone to change with it.”</p><p>“In the past twenty years, sports have moved away from judgment calls. Soccer has Video Assistant Referees (for offside decisions, for example). Tennis has Hawk-Eye (for line calls, for example). For almost a decade, baseball has used instant replay on the base paths. This is widely liked, even if the precision can sometimes cause problems. But these applications deal with something physical: bases, lines, goals. The boundaries of action are precise, delineated like the keys of a piano.</p><p>This is not the case with ABS and the strike zone. Historically, a certain discretion has been appreciated.”</p><p>I decided to email Alva Noe, a professor at Berkeley University and a baseball fan, for his opinion. “Hardly a day goes by that I don’t wake up and run through the reasons that this [robe-umpires] is such a terrible idea,” he replied. He later told me, “This is part of a movement to use algorithms to take the hard choices of living out of life.” Perhaps he’s right. We watch baseball to kill time, not to maximize it.</p><p>Some players I have met take a dissenting stance toward the robots too, believing that accuracy is not the answer.</p><p>According to Joe Russo, who plays for a New Jersey team, “With technology, people just want everything to be perfect. That’s not reality. I think perfect would be weird. Your teams are always winning, work is always just great, there’s always money in your pocket, your car never breaks down. What is there to talk about?”</p><p>*strike: a strike is when the batter swings at a ball and misses or when the batter does not swing at a ball that passes through the strike zone.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 6,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–6</h3><p>Complete the notes below.</p><p>Choose ONE WORD AND/OR A NUMBER from the passage for each answer.</p>",
        "config": {},
        "questionHtml": "<p>Appearance</p><p>- look similar to dugongs, but with a differently shaped 1_______ </p><p>Movement</p><p>- have fewer neck bones than most mammals</p><p>- need to use their 2_______  to help to turn their bodies around in order</p><p>to look sideways</p><p>- sense vibrations in the water by means of 3_______  on their skin</p><p>Feeding</p><p>- eat mainly aquatic vegetation, such as 4_______ </p><p>- grasp and pull up plants with their 5_______ </p><p>Breathing</p><p>- come to the surface for air every 2-4 minutes when awake and every 15-20 while</p><p>sleeping</p><p>- may regulate the 6_______  of their bodies by using muscles of diaphragm to store air internally</p>",
        "questions": [
          {
            "number": 1,
            "prompt": "- look similar to dugongs, but with a differently shaped 1_______ ",
            "options": [],
            "answerKey": "tail",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "- need to use their 2_______  to help to turn their bodies around in order",
            "options": [],
            "answerKey": "flippers",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "- sense vibrations in the water by means of 3_______  on their skin",
            "options": [],
            "answerKey": "hairs",
            "acceptedAnswers": [
              "hair"
            ]
          },
          {
            "number": 4,
            "prompt": "- eat mainly aquatic vegetation, such as 4_______ ",
            "options": [],
            "answerKey": "seagrasses",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "- grasp and pull up plants with their 5_______ ",
            "options": [],
            "answerKey": "lips",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "- may regulate the 6_______  of their bodies by using muscles of diaphragm to store air internally",
            "options": [],
            "answerKey": "buoyancy",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 1,
        "from": 7,
        "to": 13,
        "type": "tfng",
        "displayType": "tfng",
        "instructionHtml": "<h3>Questions 7–13</h3><p>Do the following statements agree with the information given in Reading Passage?</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 7,
            "prompt": "West Indian manatees can be found in a variety of different aquatic habitats.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 8,
            "prompt": "The Florida manatee lives in warmer waters than the Antillean manatee.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "The African manatee’s range is limited to coastal waters between the West African countries of Mauritania and Angola.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "The extent of the loss of Amazonian manatees in the mid-twentieth century was only revealed many years later.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "It is predicted that West Indian manatee populations will fall in the coming decades.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "The risk to manatees from entanglement and plastic consumption increased significantly in the period 2009-2020.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "There is some legislation in place which aims to reduce the likelihood of boat strikes on manatees in Florida.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 14,
        "to": 16,
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–16</h3><p>Reading Passage has six paragraphs,</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A-F, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
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
            "prompt": "mention of false assumptions about why people procrastinate",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "reference to the realisation that others also procrastinate",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "neurological evidence of a link between procrastination and emotion",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 17,
        "to": 22,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 17–22</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>What makes us procrastinate?</p><p>Many people think that procrastination is the result of 17_______ </p><p>Others believe it to be the result of an inability to organise time efficiently.</p><p>But scientific studies suggest that procrastination is actually due to poor mood management. The tasks we are most likely to put off are those that could damage our self-esteem or cause us to feel 18_______ . when we think about them. Research comparing chronic procrastinators with other people even found differences in the brain regions associated with regulating emotions and identifying 19_______ .</p><p>Emotionally loaded and difficult tasks often cause us to procrastinate.</p><p>Getting ready to take 20_______  might be a typical example of one such task.</p><p>People who are likely to procrastinate tend to be either 21_______  or those with low self-esteem.</p><p>Procrastination is only a short-term measure for managing emotions. It’s often followed by a feeling of 22_______ , which worsens our mood and leads to more procrastination.</p>",
        "questions": [
          {
            "number": 17,
            "prompt": "Many people think that procrastination is the result of 17_______ ",
            "options": [],
            "answerKey": "laziness",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "But scientific studies suggest that procrastination is actually due to poor mood management. The tasks we are most likely to put off are those that could damage our self-esteem or cause us to feel 18_______ . when we think about them. Research comparing chronic procrastinators with other people even found differences in the brain regions associated with regulating emotions and identifying 19_______ .",
            "options": [],
            "answerKey": "anxious",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "But scientific studies suggest that procrastination is actually due to poor mood management. The tasks we are most likely to put off are those that could damage our self-esteem or cause us to feel 18_______ . when we think about them. Research comparing chronic procrastinators with other people even found differences in the brain regions associated with regulating emotions and identifying 19_______ .",
            "options": [],
            "answerKey": "threats",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "Getting ready to take 20_______  might be a typical example of one such task.",
            "options": [],
            "answerKey": "exams",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "People who are likely to procrastinate tend to be either 21_______  or those with low self-esteem.",
            "options": [],
            "answerKey": "perfectionists",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "Procrastination is only a short-term measure for managing emotions. It’s often followed by a feeling of 22_______ , which worsens our mood and leads to more procrastination.",
            "options": [],
            "answerKey": "guilt",
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
        "instructionHtml": "<h3>Questions 23–24</h3><p>Choose TWO letters, A-E</p><p>Write the correct letters in boxes on your answer sheet.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "Which TWO comparisons between employees who often procrastinate and those who do not are mentioned in the text?",
            "options": [
              "Their salaries are lower.",
              "The quality of their work is inferior.",
              "They don’t keep their jobs for as long.",
              "They don’t enjoy their working lives as much.",
              "They have poorer relationships with colleagues."
            ],
            "answerKey": "A",
            "acceptedAnswers": [
              "C"
            ]
          },
          {
            "number": 24,
            "prompt": "Which TWO comparisons between employees who often procrastinate and those who do not are mentioned in the text?",
            "options": [
              "Their salaries are lower.",
              "The quality of their work is inferior.",
              "They don’t keep their jobs for as long.",
              "They don’t enjoy their working lives as much.",
              "They have poorer relationships with colleagues."
            ],
            "answerKey": "C",
            "acceptedAnswers": [
              "A"
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
            "prompt": "Which TWO recommendations for getting out of a cycle of procrastination does the writer give?",
            "options": [
              "not judging ourselves harshly",
              "setting ourselves manageable aims",
              "rewarding ourselves for tasks achieved",
              "prioritising tasks according to their importance",
              "avoiding things that stop us concentrating on our tasks"
            ],
            "answerKey": "A",
            "acceptedAnswers": [
              "E"
            ]
          },
          {
            "number": 26,
            "prompt": "Which TWO recommendations for getting out of a cycle of procrastination does the writer give?",
            "options": [
              "not judging ourselves harshly",
              "setting ourselves manageable aims",
              "rewarding ourselves for tasks achieved",
              "prioritising tasks according to their importance",
              "avoiding things that stop us concentrating on our tasks"
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
        "type": "ynng",
        "displayType": "ynng",
        "instructionHtml": "<h3>Questions 27–32</h3><p>Do the following statements agree with the claims of the writer in Reading Passage?</p><p>In boxes on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "When DeJesus first used ABS, he shared decision-making about strikes with it.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "MLB considered it necessary to amend the size of the strike zone when criticisms were received from players.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "MLB is keen to justify the money spent on improving the accuracy of ABS’s calculations.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "The hundred-mile-an-hour fastball led to a more exciting style of play.",
            "options": [],
            "answerKey": "NO",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "The differing proposals for alterations to the baseball bat led to fierce debate on Sword’s team.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "ABS makes changes to the shape of the strike zone feasible.",
            "options": [],
            "answerKey": "YES",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 33,
        "to": 37,
        "type": "fill",
        "displayType": "summary-completion",
        "instructionHtml": "<h3>Questions 33–37</h3><p>Complete the summary using the list ofphrases, A-H, below.</p><p>Write the correct letter, A-H, in boxes on your answer sheet.</p>",
        "config": {
          "phraseOptions": [
            "pitch boundary",
            "numerous disputes",
            "team tactics",
            "subjective assessment",
            "widespread approval",
            "former roles",
            "total silence",
            "perceived area"
          ]
        },
        "questionHtml": "<p>Calls by the umpire</p><p>Even after ABS was developed, MLB still wanted human umpires to shout out decisions as they had in their 33_______ . The umpire’s job had, at one time, required a 34_______  about whether a ball was a strike. A ball is considered a strike when the batter does not hit it and it crosses through a 35_______  extending approximately from the batter’s knee to his chest.</p><p>In the past, 36_______  over strike calls were not uncommon, but today everyone accepts the complete ban on pushing or shoving the umpire. One difference, however, is that during the first game DeJesus used ABS, strike calls were met with 37_______ </p>",
        "questions": [
          {
            "number": 33,
            "prompt": "Even after ABS was developed, MLB still wanted human umpires to shout out decisions as they had in their 33_______ . The umpire’s job had, at one time, required a 34_______  about whether a ball was a strike. A ball is considered a strike when the batter does not hit it and it crosses through a 35_______  extending approximately from the batter’s knee to his chest.",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "Even after ABS was developed, MLB still wanted human umpires to shout out decisions as they had in their 33_______ . The umpire’s job had, at one time, required a 34_______  about whether a ball was a strike. A ball is considered a strike when the batter does not hit it and it crosses through a 35_______  extending approximately from the batter’s knee to his chest.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Even after ABS was developed, MLB still wanted human umpires to shout out decisions as they had in their 33_______ . The umpire’s job had, at one time, required a 34_______  about whether a ball was a strike. A ball is considered a strike when the batter does not hit it and it crosses through a 35_______  extending approximately from the batter’s knee to his chest.",
            "options": [],
            "answerKey": "H",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "In the past, 36_______  over strike calls were not uncommon, but today everyone accepts the complete ban on pushing or shoving the umpire. One difference, however, is that during the first game DeJesus used ABS, strike calls were met with 37_______ ",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 37,
            "prompt": "In the past, 36_______  over strike calls were not uncommon, but today everyone accepts the complete ban on pushing or shoving the umpire. One difference, however, is that during the first game DeJesus used ABS, strike calls were met with 37_______ ",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 38,
        "to": 40,
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 38–40</h3><p>Choose the correct letter, A, B, C or D.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 38,
            "prompt": "What does the writer suggest about ABS in the fifth paragraph?",
            "options": [
              "It is bound to make key decisions that are wrong.",
              "It may reduce some of the appeal of the game.",
              "It will lead to the disappearance of human umpires.",
              "lt may increase calls for the rules of baseball to be changed."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "Morgan Sword says that the introduction of ABS",
            "options": [
              "was regarded as an experiment without a guaranteed outcome.",
              "was intended to keep up with developments in other sports.",
              "was a response to changing attitudes about the role of sport.",
              "was an attempt to ensure baseball retained a young audience."
            ],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "Why does the writer include the views of Not and Russo?",
            "options": [
              "to show that attitudes to technology vary widely",
              "to argue that people have unrealistic expectations of sport",
              "to indicate that accuracy is not the same thing as enjoyment",
              "to suggest that the number of baseball fans needs to increase"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-20-3",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-20-academic-reading-test-3/",
    "sections": [
      {
        "section": 1,
        "title": "Frozen Food",
        "contentHtml": "<h2>Frozen Food</h2><p>A US perspective on the development of the frozen food industry</p><p>At some point in history, humans discovered that ice preserved food. There is evidence that winter ice was stored to preserve food in the summer as far back as 10,000 years ago. Two thousand years ago, the inhabitants of South America’s Andean mountains had a unique means of conserving potatoes for later consumption. They froze them overnight, then trampled them to squeeze out the moisture, then dried them in the sun. This preserved their nutritional value - if not their aesthetic appeal.</p><p>Natural ice remained the main form of refrigeration until late in the 19th century. In the early 1800s, ship owners from Boston, USA, had enormous blocks of Arctic ice towed all over the Atlantic for the purpose of food preservation. In 1851, railroads first began putting blocks of ice in insulated rail cars to send butter from Ogdensburg, New York, to Boston.</p><p>Finally, in 1870, Australian inventors found a way to make ‘mechanical ice’. They used a compressor to force a gas-ammonia at first and later Freon-through a condenser. The compressed gas gave up some of its heat as it moved through the condenser. Then the gas was released quickly into a low-pressure evaporator coil where it became liquid and cold. Air was blown over the evaporator coil and then this cooled air passed into an insulated compartment, lowering its temperature to freezing point.</p><p>Initially, this process was invented to keep Australian beer cool even in hot weather. But Australian cattlemen were quick to realize that, if they could put this new invention on a ship, they could export meat across the oceans. In 1880, a shipment of Australian beef and mutton was sent, frozen, to England. While the food frozen this way was still palatable, there was some deterioration.</p><p>During the freezing process, crystals formed within the cells of the food, and when the ice expanded and the cells burst, this spoilt the flavor and texture of the food.</p><p>The modern frozen food industry began with the indigenous Inuit people of Canada. In 1912, a biology student in Massachusetts, USA, named Clarence Birdseye, ran out of money and went to Labrador in Canada to trap and trade furs. While he was there, he became fascinated with how the Inuit would quickly freeze fish in the Arctic air. The fish looked and tasted fresh even months later.</p><p>Birdseye returned to the USA in 1917 and began developing mechanical freezers capable of quick-freezing food. Birdseye methodically kept inventing better freezers and gradually built a business selling frozen fish from Gloucester, Massachusetts. In 1929, his business was sold and became General Foods, but he stayed with the company as director of research, and his division continued to innovate.</p><p>Birdseye was responsible for several key innovations that made the frozen food industry possible. He developed quick-freezing techniques that reduced the damage that crystals caused, as well as the technique of freezing the product in the package it was to be sold in. He also introduced the use of cellophane, the first transparent material for food packaging, which allowed consumers to see the quality of the product.</p><p>Birdseye products also came in convenient size packages that could be prepared with a minimum of effort.</p><p>But there were still obstacles. In the 1930s, few grocery stores could afford to buy freezers for a market that wasn’t established yet. So, Birdseye leased inexpensive freezer cases to them. He also leased insulated railroad cars so that he could ship his products nationwide. However, few consumers had freezers large</p><p>enough or efficient enough to take advantage of the products.</p><p>Sales increased in the early 1940s, when World War II gave a boost to the frozen food industry because tin was being used for munitions. Canned foods were rationed to save tin for the war effort, while frozen foods were abundant and cheap. Finally, by the 1950s, refrigerator technology had developed far enough to make these appliances affordable for the average family.</p><p>By 1953, 33 million US families owned a refrigerator, and manufacturers were gradually increasing the size of the freezer compartments in them.</p><p>1950s families were also looking for convenience at mealtimes, so the moment was right for the arrival of the ‘TV Dinner’. Swanson Foods was a large, nationally recognized producer of canned and frozen poultry. In 1954, the company adapted some of Birdseye's freezing techniques, and with the help of a clever name and a huge advertising budget, it launched the first ‘TV Dinner’. This consisted of frozen turkey, potatoes and vegetables served in the same segmented aluminum tray that was used by airlines.</p><p>The product was an instant success. Within a year, Swanson had sold 13 million TV dinners. American consumers couldn’t resist the combination of a trusted brand name, a single-serving package and the convenience of a meal that could be ready after only 25 minutes in a hot oven. By 1959, Americans were spending $2.7 billion annually on frozen foods, and half a billion of that was spent on ready-prepared meals such as the TV Dinner.</p><p>Today, the US frozen food industry has a turnover of over $67 billion annually, with $26.6 billion of that sold to consumers for home consumption. The remaining $40 billion in frozen food sales come through restaurants, cafeterias, hospitals and schools, and that represents a third of the total food service sales.</p>"
      },
      {
        "section": 2,
        "title": "Can the planet’s coral reefs be saved?",
        "contentHtml": "<h2>Can the planet’s coral reefs be saved?</h2><p><strong>A</strong> Conservationists have put the final touches to a giant artificial reef they have been assembling at the world-renowned Zoological Society of London (London Zoo). Samples of the planet’s most spectacular corals – vivid green branching coral, yellow scroll, blue ridge and many more species – have been added to the giant tank along with fish that thrive in their presence: blue tang, clownfish and many others.</p><p>The reef is in the zoo’s new gallery, Tiny Giants, which is dedicated to the minuscule invertebrate creatures that sustain life across the planet. The coral reef tank and its seven-metre-wide window form the core of the exhibition.</p><p>‘Coral reefs are the most diverse ecosystems on Earth and we want to show people how wonderful they are,’ said Paul Pearce-Kelly, senior curator of invertebrates and fish at the Zoological Society of London. ‘However, we also want to highlight the research and conservation efforts that are now being carried out to try to save them from the threat of global warming.’ They want people to see what is being done to try to save these wonders.</p><p><strong>B</strong> Corals are composed of tiny animals, known as polyps, with tentacles for capturing small marine creatures in the sea water. These polyps are transparent but get their brilliant tones of pink, orange, blue, green, etc. from algae that live within them, which in turn get protection, while their photosynthesising of the sun’s rays provides nutrients for the polyps.</p><p>This comfortable symbiotic relationship has led to the growth of coral reefs that cover 0.1% of the planet’s ocean bed while providing homes for more than 25% of marine species, including fish, molluscs, sponges and shellfish.</p><p><strong>C</strong> As a result, coral reefs are often described as the ‘rainforests of the sea’, though the comparison is dismissed by some naturalists, including David Attenborough. ‘People say you cannot beat the rainforest,’ Attenborough has stated. ‘But that is simply not true. You go there and the first thing you think is: where are the birds? Where are the animals? They are hiding in the trees, of course. No, if you want beauty and wildlife, you want a coral reef. Put on a mask and stick your head under the water.</p><p>The sight is mindblowing.’</p><p><strong>D</strong> Unfortunately, these majestic sights are now under very serious threat, with the most immediate problem coming in the form of thermal stress. Rising ocean temperatures are triggering bleaching events that strip reefs of their colour and eventually kill them. And that is just the start. Other menaces include ocean acidification, sea level increase, pollution by humans, deoxygenation and ocean current changes, while the climate crisis is also increasing habitat destruction.</p><p>As a result, vast areas – including massive chunks of Australia’s Great Barrier Reef – have already been destroyed, and scientists advise that more than 90% of reefs could be lost by 2050 unless urgent action is taken to tackle global heating and greenhouse gas emissions.</p><p>Pearce-Kelly says that coral reefs have to survive really harsh conditions – wave erosion and other factors. And ‘when things start to go wrong in the oceans, then corals will be the first to react. And that is exactly what we are seeing now. Coral reefs are dying and they are telling us that all is not well with our planet.’</p><p><strong>E</strong> However, scientists are trying to pinpoint hardy types of coral that could survive our overheated oceans, and some of this research will be carried out at London Zoo. ‘Behind our … coral reef tank we have built laboratories where scientists will be studying coral species,’ said Pearce-Kelly. One aim will be to carry out research on species to find those that can survive best in warm, acidic waters. Another will be to try to increase coral breeding rates. ‘Coral spawn just once a year,’ he added.</p><p>‘However, aquarium-based research has enabled some corals to spawn artificially, which can assist coral reef restoration efforts. And if this can be extended for all species, we could consider the launching of coral-spawning programmes several times a year. That would be a big help in restoring blighted reefs.’</p><p><strong>F</strong> Research in these fields is being conducted in laboratories around the world, with the London Zoo centre linked to this global network. Studies carried out in one centre can then be tested in others. The resulting young coral can then be displayed in the tank in Tiny Giants.</p><p>‘The crucial point is that the progress we make in making coral better able to survive in a warming world can be shown to the public and encourage them to believe that we can do something to save the planet’s reefs,’ said Pearce-Kelly. ‘Saving our coral reefs is now a critically important ecological goal.’</p>"
      },
      {
        "section": 3,
        "title": "Robots and us",
        "contentHtml": "<h2>Robots and us</h2><p>Three leaders in their fields answer questions about our relationships with robot</p><p>When asked ‘Should robots be used to colonise other planets?’, cosmology and astrophysics Professor Martin Rees said he believed the solar system would be mapped by robotic craft by the end of the century. ‘The next step would be mining of asteroids, enabling fabrication of large structures in space without having to bring all the raw materials from Earth….</p><p>I think this is more realistic and benign than the … “terraforming”* of planets.’ He maintains that colonised planets ‘should be preserved with a status that is analogous to Antarctica here on Earth.’</p><p>On the question of using robots to colonise other planets and exploit mineral resources, engineering Professor Daniel Wolpert replied, ‘I don’t see a pressing need to colonise other planets unless we can bring [these] resources back to Earth. The vast majority of Earth is currently inaccessible to us. Using robots to gather resources nearer to home would seem to be a better use of our robotic tools.’</p><p>Meanwhile, for anthropology Professor Kathleen Richardson, the idea of ‘colonisation’ of other planets seemed morally dubious: ‘I think whether we do something on Earth or on Mars we should always do it in the spirit of a genuine interest in “the Other”, not to impose a particular model, but to meet “the Other”.'</p><p>In response to the second question, ‘How soon will machine intelligence outstrip human intelligence?’, Rees mentions robots that are advanced enough to beat humans at chess, but then goes on to say, ‘Robots are still limited in their ability to sense their environment: they can’t yet recognise and move the pieces on a real chessboard as cleverly as a child can. Later this century, however, their more advanced successors may relate to their surroundings, and to people, as adeptly as we do.</p><p>Moral questions then arise. … Should we feel guilty about exploiting [sophisticated robots]? Should we fret if they are underemployed, frustrated, or bored?’</p><p>Wolpert’s response to the question about machine intelligence outstripping human intelligence was this: ‘In a limited sense it already has. Machines can already navigate, remember and search for items with an ability that far outstrips humans. However, there is no machine that can identify visual objects or speech with the</p><p>reliability and flexibility of humans…. Expecting a machine close to the creative intelligence of a human within the next 50 years would be highly ambitious.’</p><p>Richardson believes that our fear of machines becoming too advanced has more to do with human nature than anything intrinsic to the machines themselves. In her view, it stems from humans’ tendency to personify inanimate objects: we create machines based on representations of ourselves, imagine that machines think and behave as we do, and therefore see them as an autonomous threat.</p><p>‘One of the consequences of thinking that the problem lies with machines is that we tend to imagine they are greater and more powerful than they really are and subsequently they become so.’</p><p>This led on to the third question, ‘Should we be scared by advances in artificial intelligence?’ To this question, Rees replied, ‘Those who should be worried are the futurologists who believe in the so-called “singularity”.** … And another worry is that we are increasingly dependent on computer networks, and that these could behave like a single “brain” with a mind of its own, and with goals that may be contrary to human welfare.</p><p>I think we should ensure that robots remain as no more than “idiot savants” lacking the capacity to outwit us, even though they may greatly surpass us in the ability to calculate and process information.’</p><p>Wolpert’s response was to say that we have already seen the damaging effects of artificial intelligence in the form of computer viruses. ‘But in this case,’ he says, ‘the real intelligence is the malicious designer. Critically, the benefits of computers outweigh the damage that computer viruses cause. Similarly, while there may be misuses of robotics in the near future, the benefits that they will bring are likely to outweigh these negative aspects.’</p><p>Richardson’s response to this question was this: ‘We need to ask why fears of artificial intelligence and robots persist; none have in fact risen up and challenged human supremacy.’ She believes that as robots have never shown themselves to be a threat to humans, it seems unlikely that they ever will. In fact, she went on, ‘Not all fear [robots]; many people welcome machine intelligence.’</p><p>In answer to the fourth question, What can science fiction tell us about robotics?’, Rees replied, ‘I sometimes advise students that it’s better to read first-rate science fiction than second-rate science - more stimulating, and perhaps no more likely to be wrong.’</p><p>As his response, Wolpert commented, ‘Science fiction has often been remarkable at predicting the future. Science fiction has painted a vivid spectrum of possible futures, from cute and helpful robots to dystopian robotic societies. Interestingly, almost no science fiction envisages a future without robots.’ Finally, on the question of science fiction, Richardson pointed out that in modern society, people tend to think there is reality on the one hand, and fiction and fantasy on the other.</p><p>She then explained that the division did not always exist, and that scientists and technologists made this separation because they wanted to carve out the sphere of their work. ‘But the divide is not so clear cut, and that is why the worlds seem to collide at times,’ she said. ‘In some cases, we need to bring these different understandings together to get a whole perspective. Perhaps then, we won’t be so frightened that something we create as a copy of ourselves will be a [threat] to us.’</p><p>*terraforming: modifying a planet’s atmosphere to suit human needs</p><p>** singularity: the point when robots will be able to start creating ever more sophisticated versions of themselves</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 7,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–7</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
        "config": {},
        "questionHtml": "<p>The history of frozen food</p><p>2,000 years ago, South America</p><p>- People conserved the nutritional value of 1_______ , using a method of freezing then drying.</p><p>1851, USA</p><p>- 2_______  was kept cool by ice during transportation in specially adapted trains.</p><p>1880, Australia</p><p>- Two kinds of 3_______  were the first frozen food shipped to England.</p><p>1917 onwards, USA</p><p>- Clarence Birdseye introduced innovations including:</p><p>• quick-freezing methods, so that 4_______  did not spoil the food.</p><p>• packaging products with 5_______ , so the product was visible.</p><p>Early 1940s, USA</p><p>- Frozen food became popular because of a shortage of 6_______ .</p><p>1950s, USA</p><p>- A large number of homes now had a 7_______ .</p>",
        "questions": [
          {
            "number": 1,
            "prompt": "- People conserved the nutritional value of 1_______ , using a method of freezing then drying.",
            "options": [],
            "answerKey": "potatoes",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "- 2_______  was kept cool by ice during transportation in specially adapted trains.",
            "options": [],
            "answerKey": "butter",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "- Two kinds of 3_______  were the first frozen food shipped to England.",
            "options": [],
            "answerKey": "MEAT",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "* quick-freezing methods, so that 4_______  did not spoil the food.",
            "options": [],
            "answerKey": "crystals",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "* packaging products with 5_______ , so the product was visible.",
            "options": [],
            "answerKey": "cellophane",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "- Frozen food became popular because of a shortage of 6_______ .",
            "options": [],
            "answerKey": "tin",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "- A large number of homes now had a 7_______ .",
            "options": [],
            "answerKey": "refrigerator",
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
        "instructionHtml": "<h3>Questions 8–13</h3><p>Do the following statements agree with the information given in Reading Passage?</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 8,
            "prompt": "The ice transportation business made some Boston ship owners very wealthy in the early 1800s.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "A disadvantage of the freezing process invented in Australia was that it affected the taste of food.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Clarence Birdseye travelled to Labrador in order to learn how the Inuit people froze fish.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "Swanson Foods invested a great deal of money in the promotion of the TV Dinner.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "Swanson Foods developed a new style of container for the launch of the TV Dinner.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "The US frozen food industry is currently the largest in the world.",
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
        "type": "matching",
        "displayType": "matching-heading",
        "instructionHtml": "<h3>Questions 14–19</h3><p>Choose the correct heading for each section from the list of headings below.</p>",
        "config": {
          "headings": [
            "Tried and tested solutions",
            "Cooperation beneath the waves",
            "Working to lessen the problems",
            "Disagreement about the accuracy of a certain phrase",
            "Two clear educational goals",
            "Promoting hope",
            "A warning of further trouble ahead"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 14,
            "prompt": "Paragraph A",
            "options": [],
            "answerKey": "v",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "Paragraph B",
            "options": [],
            "answerKey": "ii",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "Paragraph C",
            "options": [],
            "answerKey": "iv",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "Paragraph D",
            "options": [],
            "answerKey": "vii",
            "acceptedAnswers": []
          },
          {
            "number": 18,
            "prompt": "Paragraph E",
            "options": [],
            "answerKey": "iii",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "Paragraph F",
            "options": [],
            "answerKey": "vi",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 20,
        "to": 21,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 20–21</h3><p>Choose TWO letters, A–E.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 20,
            "prompt": "Which TWO of these causes of damage to coral reefs are mentioned by the writer of the text?",
            "options": [
              "a rising number of extreme storms",
              "the removal of too many fish from the sea",
              "the contamination of the sea from waste",
              "increased disease among marine species",
              "alterations in the usual flow of water in the seas"
            ],
            "answerKey": "C",
            "acceptedAnswers": [
              "E"
            ]
          },
          {
            "number": 21,
            "prompt": "Which TWO of these causes of damage to coral reefs are mentioned by the writer of the text?",
            "options": [
              "a rising number of extreme storms",
              "the removal of too many fish from the sea",
              "the contamination of the sea from waste",
              "increased disease among marine species",
              "alterations in the usual flow of water in the seas"
            ],
            "answerKey": "E",
            "acceptedAnswers": [
              "C"
            ]
          }
        ]
      },
      {
        "section": 2,
        "from": 22,
        "to": 23,
        "type": "mcq",
        "displayType": "multiple-choice-2",
        "instructionHtml": "<h3>Questions 22–23</h3><p>Choose TWO letters, A–E.</p>",
        "config": {
          "answerSlots": 2
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 22,
            "prompt": "Which TWO of the following statements are true of the researchers at London Zoo?",
            "options": [
              "They are hoping to expand the numbers of different corals being bred in laboratories.",
              "They want to identify corals that can cope well with the changed sea conditions.",
              "They are looking at ways of creating artificial reefs that corals could grow on.",
              "They are trying out methods that would speed up reproduction in some corals.",
              "They are investigating materials that might protect reefs from higher temperatures."
            ],
            "answerKey": "B",
            "acceptedAnswers": [
              "D"
            ]
          },
          {
            "number": 23,
            "prompt": "Which TWO of the following statements are true of the researchers at London Zoo?",
            "options": [
              "They are hoping to expand the numbers of different corals being bred in laboratories.",
              "They want to identify corals that can cope well with the changed sea conditions.",
              "They are looking at ways of creating artificial reefs that corals could grow on.",
              "They are trying out methods that would speed up reproduction in some corals.",
              "They are investigating materials that might protect reefs from higher temperatures."
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
        "from": 24,
        "to": 26,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 24–26</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
        "config": {},
        "questionHtml": "<p>• Corals have a number of 24_______  which they use to collect their food.</p><p>• Algae gain 25_______  from being inside the coral.</p><p>• Increases in the warmth of the sea water can remove the 26_______  from coral.</p>",
        "questions": [
          {
            "number": 24,
            "prompt": "* Corals have a number of 24_______  which they use to collect their food.",
            "options": [],
            "answerKey": "tentacles",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "* Algae gain 25_______  from being inside the coral.",
            "options": [],
            "answerKey": "protection",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "* Increases in the warmth of the sea water can remove the 26_______  from coral.",
            "options": [],
            "answerKey": "colour/ COLOR",
            "acceptedAnswers": [
              "colour",
              "color"
            ]
          }
        ]
      },
      {
        "section": 3,
        "from": 27,
        "to": 33,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 27–33</h3><p>Match each statement with the correct expert, A, B or C.</p><p>NB You may use any letter more than once.</p>",
        "config": {
          "featureOptions": [
            "Martin Rees",
            "Daniel Wolpert",
            "Kathleen Richardson"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 27,
            "prompt": "For our own safety, humans will need to restrict the abilities of robots.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "The risk of robots harming us is less serious than humans believe it to be.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "It will take many decades for robot intelligence to be as imaginative as human intelligence.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "We may have to start considering whether we are treating robots fairly.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "Robots are probably of more help to us on Earth than in space.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 32,
            "prompt": "The ideas in high-quality science fiction may prove to be just as accurate as those found in the work of mediocre scientists.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "There are those who look forward to robots developing greater intelligence.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 34,
        "to": 36,
        "type": "matching",
        "displayType": "sentence-ending",
        "instructionHtml": "<h3>Questions 34–36</h3><p>Complete each sentence with the correct ending, A–D, below.</p>",
        "config": {
          "sentenceEndings": [
            "robots to explore outer space.",
            "advances made in machine intelligence so far.",
            "changes made to other planets for our own benefit.",
            "the harm already done by artificial intelligence."
          ]
        },
        "questionHtml": "<p>• Richardson and Rees express similar views regarding the ethical aspect of 34_______ </p><p>• Rees and Wolpert share an opinion about the extent of 35_______ </p><p>• Wolpert disagrees with Richardson on the question of 36_______ </p>",
        "questions": [
          {
            "number": 34,
            "prompt": "• Richardson and Rees express similar views regarding the ethical aspect of 34_______ ",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "• Rees and Wolpert share an opinion about the extent of 35_______ ",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "• Wolpert disagrees with Richardson on the question of 36_______ ",
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
        "type": "mcq",
        "displayType": "multiple-choice",
        "instructionHtml": "<h3>Questions 37–40</h3><p>Choose the correct letter, A, B, C or D.</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 37,
            "prompt": "What point does Richardson make about fear of machines?",
            "options": [
              "It has grown alongside the development of ever more advanced robots.",
              "It is the result of our inclination to attribute human characteristics to non-human entities.",
              "It has its origins in basic misunderstandings about how inanimate objects function.",
              "It demonstrates a key difference between human intelligence and machine intelligence."
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "What potential advance does Rees see as a cause for concern?",
            "options": [
              "robots outnumbering people",
              "robots having abilities which humans do not",
              "artificial intelligence developing independent thought",
              "artificial intelligence taking over every aspect of our lives"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "What does Wolpert emphasize in his response to the question about science fiction?",
            "options": [
              "how science fiction influences our attitudes to robots",
              "how fundamental robots are to the science fiction genre",
              "how the image of robots in science fiction has changed over time",
              "how reactions to similar portrayals of robots in science fiction may vary"
            ],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "What is Richardson doing in her comment about reality and fantasy?",
            "options": [
              "warning people not to confuse one with the other",
              "outlining ways in which one has impacted on the other",
              "recommending a change of approach in how people view them",
              "explaining why scientists have a different perspective on them from other people"
            ],
            "answerKey": "C",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  },
  {
    "slug": "cam-20-4",
    "source": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-20-academic-reading-test-4/",
    "sections": [
      {
        "section": 1,
        "title": "Georgia O’Keeffe",
        "contentHtml": "<h2>Georgia O’Keeffe</h2><p>For seven decades, Georgia O’Keeffe (1887-1986) was a major figure in American art. Remarkably, she remained independent from shifting art trends and her work stayed true to her own vision, which was based on finding the essential, abstract forms in nature. With exceptionally keen powers of observation and great finesse with a paintbrush, she recorded subtle nuances of colour, shape, and light that enlivened her paintings and attracted a wide audience.</p><p>Born in 1887 near Sun Prairie, Wisconsin to cattle breeders Francis and Ida O’Keeffe, Georgia was raised on their farm along with her six siblings. By the time she graduated from high school in 1905, she had determined to make her way as an artist. She studied the techniques of traditional painting at the Art Institute of Chicago school (1905) and the Art Students League of New York (1907-8).</p><p>After attending university and then training college, she became an art teacher and taught in elementary schools, high schools, and colleges in Virginia, Texas, and South Carolina from 1911 to 1918.</p><p>During this period, O’Keeffe began to experiment with creating abstract compositions in charcoal, and produced a series of innovative drawings that led her art in a new direction. She sent some of these drawings to a friend in New York, who showed them to art collector and photographer Alfred Stieglitz in January 1916.</p><p>Stieglitz was impressed, and exhibited the drawings later that year at his gallery on Fifth Avenue, New York City, where the works of many avant-garde artists and photographers were introduced to the American public.</p><p>With Stieglitz’s encouragement and promise of financial support, O’Keeffe arrived in New York in June 1918 to begin a career as an artist. For the next three decades, Stieglitz vigorously promoted her work in twenty-two solo exhibitions and numerous group installations. The two were married in 1924. The ups and downs of their personal and professional relationship were recorded in Stieglitz’s celebrated black-and-white portraits of O’Keeffe, taken over the course of twenty years (1917-37).</p><p>By the mid-1920s, O’Keeffe was recognized as one of America’s most important and successful artists, widely known for the architectural pictures that dramatically depict the soaring skyscrapers of New York. But most often, she painted botanical subjects, inspired by annual trips to the Stieglitz family summer home. In her magnified images depicting flowers, begun in 1924, O’Keeffe brings the viewer right into the picture.</p><p>Enlarging the tiniest details to fill an entire metre-wide canvas emphasized their shapes and lines and made them appear abstract. Such daring compositions helped establish O’Keeffe’s reputation as an innovative modernist.</p><p>In 1929, O’Keeffe made her first extended trip to the state of New Mexico. It was a visit that had a lasting impact on her life, and an immediate effect on her work. Over the next two decades she made almost annual trips to New Mexico, staying up to six months there, painting in relative solitude, then returning to New York each winter to exhibit the new work at Stieglitz’s gallery. This pattern continued until she moved permanently to New Mexico in 1949.</p><p>There, O’Keeffe found new inspiration: at first, it was the numerous sun-bleached bones she came across in the state’s rugged terrain that sparked her imagination. Two of her earliest and most celebrated Southwestern paintings exquisitely reproduce a cow skull’s weathered surfaces, jagged edges, and irregular openings.</p><p>Later, she also explored another variation on this theme in her large series of Pelvis pictures, which focused on the contrasts between convex and concave surfaces, and solid and open spaces.</p><p>However, it was the region’s spectacular landscape, with its unusual geological formations, vivid colours, clarity of light, and exotic vegetation, that held the artist’s imagination for more than four decades. Often, she painted the rocks, cliffs, and mountains in striking close-up, just as she had done with her botanical subjects.</p><p>O’Keeffe eventually owned two homes in New Mexico – the first, her summer retreat at Ghost Ranch, was nestled beneath 200-metre cliffs, while the second, used as her winter residence, was in the small town of Abiquiú. While both locales provided a wealth of imagery for her paintings, one feature of the Abiquiú house – the large walled patio with its black door – was particularly inspirational.</p><p>In more than thirty pictures between 1946 and 1960, she reinvented the patio into an abstract arrangement of geometric shapes.</p><p>From the 1950s into the 1970s, O’Keeffe travelled widely, making trips to Asia, the Middle East, and Europe. Flying in planes inspired her last two major series – aerial views of rivers and expansive paintings of the sky viewed from just above clouds. In both series, O’Keeffe increased the size of her canvases, sometimes to mural proportions, reflecting perhaps her newly expanded view of the world.</p><p>When in 1965 she successfully translated one of her cloud motifs to a monumental canvas measuring 6 metres in length (with the help of assistants), it was an enormous challenge and a special feat for an artist nearing eighty years of age.</p><p>The last two decades of the artist’s life were relatively unproductive as ill health and blindness hindered her ability to work. O’Keeffe died in 1986 at the age of ninety-eight, but her rich legacy of some 900 paintings has continued to attract subsequent generations of artists and art lovers who derive inspiration from these very American images.</p>"
      },
      {
        "section": 2,
        "title": "Adapting to the effects of climate change",
        "contentHtml": "<h2>Adapting to the effects of climate change</h2><p><strong>A</strong> All around the world, nations are already preparing for, and adapting to, climate change and its impacts. Even if we stopped all CO2 emissions tomorrow, we would continue to see the impact of the CO2 already released since industrial times, with scientists forecasting that global warming would continue for around 40 years. In the meantime, ice caps would continue to melt and sea levels rise. Some countries and regions will suffer more extreme impacts from these changes than others.</p><p>It’s in these places that innovation is thriving.</p><p><strong>B</strong> In Miami Beach, Florida, USA, seawater isn’t just breaching the island city’s walls, it’s seeping up through the ground, so the only way to save the city is to lift it up above sea level. Starting in the lowest and most vulnerable neighbourhoods, roads have been raised by as much as 61 centimetres. The elevation work was carried out as part of Miami Beach’s ambitious but much-needed stormwater-management programme.</p><p>In addition to the road adaptations, the city has set up new pumps that can remove up to 75,000 litres of water per minute. In the face of floods, climate-mitigation strategies have often been overlooked, says Yanira Pineda, a senior sustainability coordinator. She knows that they’re essential and that the job is far from over. ‘We know that in 20, 30, 40 years, we’ll need to go back in there and adjust to the changing environment,’ she says.</p><p><strong>C</strong> Seawalls are a staple strategy for many coastal communities, but on the soft, muddy northern shores of Java, Indonesia, they frequently collapse, further exacerbating coastal erosion. There have been many attempts to restore the island’s coastal mangroves: ecosystems of trees and shrubs that help defend coastal areas by trapping sediment in their net-like root systems, elevating the sea bed and dampening the energy of waves and tidal currents.</p><p>But Susanna Tol of the not-for-profit organisation Wetlands International says that, while hugely popular, the majority of mangrove-planting projects fail. So, Wetlands International started out with a different approach, building semi-permeable dams, made from bamboo poles and brushwood, to mimic the role of mangrove roots and create favourable conditions for mangroves to grow back naturally. The programme has seen moderate success, mainly in areas with less subsidence.</p><p>“Unfortunately, traditional infrastructure is often single-solution focused,’ says Tol. ‘For long-term success, it’s critical that we transition towards multifunctional approaches that embed natural processes and that engage and benefit communities and local decision-makers.”</p><p><strong>D</strong> As the floodwaters rose in the rice fields of the Mekong Delta in September 2018, four small houses rose with them. Homes in this part of Vietnam are traditionally built on stilts but these ones had been built to float. The modifications were made by the Buoyant Foundation Project, a not-for-profit organisation that has been researching and retrofitting amphibious houses since 2006.</p><p>‘When I started this,’ explains founder Elizabeth English, ‘climate change was not on the tip of everybody’s tongue,' but this technology is becoming necessary in places that didn’t previously need it. It’s much cheaper than permanently elevating houses, English explains – about a third of what it would cost to completely replace a building’s foundations. It also avoids the problem of taller houses being at greater risk from wind damage.</p><p>Another plus comes from the fact that amphibious structures can be sensitively adapted to meet cultural needs and match the kind of houses that are already common in a community.</p><p><strong>E</strong> Bangladesh is especially vulnerable to climate change. Most of the country is less than a metre above sea level and 80 per cent of its land lies on floodplains. ‘Almost 35 million people living on the coastal belt of Bangladesh are currently affected by soil and water salinity,’ says Raisa Chowdhury of the international development organisation ICCO Cooperation. Rather than fighting against it, one project is helping communities adapt to salt-affected soils.</p><p>ICCO Cooperation has been working with 10,000 farmers in Bangladesh to start cultivating naturally salt-tolerant crops in the region. Certain varieties of carrot, potato, kohlrabi, cabbage and beetroot have been found to be better suited to salty soil than the rice and wheat that is typically grown there.</p><p>Chowdhury says that the results are very visible, comparing a barren plot of land to the ‘beautiful, lush green vegetable garden’ sitting beside it, in which he and his team have been working with the farmers. Since the project began, farmers trained in saline agriculture have reported increases of two to three more harvests per year.</p><p><strong>F</strong> Greg Spotts from Los Angeles (LA) in the USA is chief sustainability officer of the city’s street services department. He leads the Cool Streets LA programme, a series of pilot projects, which include the planting of trees and the installation of a ‘cool pavement’ system, designed to help reach the city’s goal of bringing down its average temperature by 1.5°C. ‘Urban cooling is literally a matter of life and death for our future in LA,’ says Spotts.</p><p>Using a Geographic Information System data mapping tool, the programme identified streets with low tree canopy cover in three of the city’s neighbourhoods and covered them with a light-grey, light-reflecting coating, which had already been shown to lower road surface temperature in Los Angeles by 6°C.</p><p>Spotts says one of these streets, in the Winnetka neighbourhood of San Fernando Valley, can now be seen as a pale crescent, the only cool spot on an otherwise red thermal image, from the International Space Station.</p>"
      },
      {
        "section": 3,
        "title": "A new role for livestock guard dogs",
        "contentHtml": "<h2>A new role for livestock guard dogs</h2><p>Livestock guard dogs, traditionally used to protect farm animals from predators, are now being used to protect the predators themselves</p><p><strong>A</strong> For thousands of years, livestock guard dogs worked alongside shepherds to protect their sheep, goats and cattle from predators such as wolves and bears. But in the 19th and 20th centuries, when such predators were largely exterminated, most guard dogs lost their jobs. In recent years, however, as increased efforts have been made to protect wild animals, predators have become more widespread again.</p><p>As a result, farmers once more need to protect their livestock, and guard dogs are enjoying an unexpected revival.</p><p><strong>B</strong> Today there are around 50 breeds of guard dogs on duty in various parts of the world. These dogs are raised from an early age with the animals they will be watching and eventually these animals become the dog’s family. The dogs will place themselves between the livestock and any threat, barking loudly. If necessary, they will chase away predators, but often their mere presence is sufficient.</p><p>‘Their initial training is to make them understand that livestock is going to be their life,’ says Dan Macon, a shepherd with three guard dogs. ‘A fluffy white puppy is fun to be around, but too much human affection makes it a great dog for guarding the front porch, rather than a great livestock guard dog.’</p><p><strong>C</strong> The evidence indicates that guard dogs are highly effective. For example, in Portugal, biologist Silvia Ribeiro has found that more than 90 per cent of the farmers participating in a programme to train and use guard dogs to protect their herds against attack from wolves rate the performance of the dogs as very good or excellent.</p><p>In a study carried out in Australia by Linda van Bommel and Chris Johnson at the University of Tasmania, more than 65 per cent of herders reported that predation stopped completely after they got the dogs, and almost all the rest saw a decrease in attacks. ‘If they are managed and used properly, livestock guard dogs are the most efficient control method that we have in terms of the amount of livestock that they save from predation,’ says van Bommel.</p><p><strong>D</strong> But today’s guard dogs also have a new role – to help preserve the predators. It is hoped that reductions in livestock losses can make farmers more tolerant of predators and less likely to kill them. In Namibia, more than 90 per cent of cheetahs live outside protected areas, close to humans raising livestock. As a result, the cheetahs are often held responsible for animal losses, and large numbers have been killed by farmers.</p><p>When guard dogs were introduced, more than 90 per cent of farmers reported a dramatic reduction in livestock losses, and said that as a result they were less likely to kill predators. Julie Young, at Utah State University in the US, believes this result applies widely. “There is common ground from the livestock perspective and from the conservation perspective,’ she says. ‘If ranchers don’t have a dead cow, they will not make a call to apply for a permit to kill a wolf.'</p><p><strong>E</strong> Looking at all the published evidence, Bethany Smith at Nottingham Trent University in the UK found that up to 88 per cent of farmers said they no longer killed predators after using dogs – but warned that such self-reported results must be taken with a pinch of salt. What’s more, it is possible that livestock guard dogs merely displace predators to unprotected neighbouring properties, where their fate isn’t recorded.</p><p>‘In some regions, we work with almost every farmer, but in others only one or two have dogs,’ says Ribeiro. ‘If we are not working with everybody, we are transferring the wolf pressure to the neighbour’s herd and he can use poison and kill an entire pack of wolves.’</p><p><strong>F</strong> Another concern is whether there may be unintended ecological effects of using guard dogs. Studies suggest that reducing deaths of one type of predator may have a negative impact on other species. The extent of this problem isn’t known, but the consequences are clear in Namibia. Cheetahs aren’t the only species that cause sheep and goat losses there: other predators also attack livestock.</p><p>In 2015, researchers reported that in spite of the impact farmers obtaining guard dogs had on cheetahs, the number of jackals killed by dogs and people actually increased. Guard dogs have other ecological impacts too. They have been found to spread diseases to wild animals, including endangered Ethiopian wolves. They may also compete with other carnivores for food. And by creating a ‘landscape of fear’, their mere presence can influence the behaviour of prey animals.</p><p><strong>G</strong> The evidence so far, however, indicates that these consequences aren’t always negative. Guard dogs can deliver unexpected benefits by protecting vulnerable wildlife from predators. For example, their presence has been found to protect birds which build their nests on the ground in fields, where foxes would normally raid them. Indeed, Australian researchers are now using dogs to enhance biodiversity and create refuges for species threatened by predation.</p><p>So if we can get this right, there may be a bright future for guard dogs in promoting harmonious coexistence between humans and wildlife.</p>"
      }
    ],
    "groups": [
      {
        "section": 1,
        "from": 1,
        "to": 7,
        "type": "fill",
        "displayType": "note-completion",
        "instructionHtml": "<h3>Questions 1–7</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>The Life and Work of Georgia O’Keefe</p><p>- studied art, then worked as a 1_______  in various places in the USA</p><p>- created drawings using 2_______  which were exhibited in New York City</p><p>- moved to New York and became famous for her paintings of the city’s 3_______ </p><p>- produced a series of innovative close-up paintings of 4_______ </p><p>- went to New Mexico and was initially inspired to paint the many 5_______  that could be found there</p><p>- continued to paint various features that together formed the dramatic 6_______  of New Mexico for over forty years</p><p>- travelled widely by plane in later years, and painted pictures of clouds and 7_______  seen from above.</p>",
        "questions": [
          {
            "number": 1,
            "prompt": "- studied art, then worked as a 1_______  in various places in the USA",
            "options": [],
            "answerKey": "teacher",
            "acceptedAnswers": []
          },
          {
            "number": 2,
            "prompt": "- created drawings using 2_______  which were exhibited in New York City",
            "options": [],
            "answerKey": "charcoal",
            "acceptedAnswers": []
          },
          {
            "number": 3,
            "prompt": "- moved to New York and became famous for her paintings of the city’s 3_______ ",
            "options": [],
            "answerKey": "skyscrapers",
            "acceptedAnswers": []
          },
          {
            "number": 4,
            "prompt": "- produced a series of innovative close-up paintings of 4_______ ",
            "options": [],
            "answerKey": "flowers",
            "acceptedAnswers": []
          },
          {
            "number": 5,
            "prompt": "- went to New Mexico and was initially inspired to paint the many 5_______  that could be found there",
            "options": [],
            "answerKey": "bones",
            "acceptedAnswers": []
          },
          {
            "number": 6,
            "prompt": "- continued to paint various features that together formed the dramatic 6_______  of New Mexico for over forty years",
            "options": [],
            "answerKey": "landscape",
            "acceptedAnswers": []
          },
          {
            "number": 7,
            "prompt": "- travelled widely by plane in later years, and painted pictures of clouds and 7_______  seen from above.",
            "options": [],
            "answerKey": "rivers",
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
        "instructionHtml": "<h3>Questions 8–13</h3><p>Do the following statements agree with the information given in Reading Passage?</p>",
        "config": {},
        "questionHtml": "",
        "questions": [
          {
            "number": 8,
            "prompt": "Georgia O’Keeffe’s style was greatly influenced by the changing fashions in art over the seven decades of her career.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 9,
            "prompt": "When O’Keeffe finished high school, she had already made her mind up about the career that she wanted.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 10,
            "prompt": "Alfred Stieglitz first discovered O’Keeffe’s work when she sent some abstract drawings to his gallery in New York City.",
            "options": [],
            "answerKey": "FALSE",
            "acceptedAnswers": []
          },
          {
            "number": 11,
            "prompt": "O’Keeffe was the subject of Stieglitz’s photographic work for many years.",
            "options": [],
            "answerKey": "TRUE",
            "acceptedAnswers": []
          },
          {
            "number": 12,
            "prompt": "O’Keeffe’s paintings of the patio of her house in Abiquiu were among the artist’s favourite works.",
            "options": [],
            "answerKey": "NOT GIVEN",
            "acceptedAnswers": []
          },
          {
            "number": 13,
            "prompt": "O’Keeffe produced a greater quantity of work during the 1950s to 1970s than at any other time in her life.",
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
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 14–17</h3><p>Reading Passage has six paragraphs, A–F.</p><p>Which paragraph contains the following information?</p><p>Write the correct letter, A–F, in boxes on your answer sheet.</p>",
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
            "prompt": "how a type of plant functions as a natural protection for coastlines",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 15,
            "prompt": "a prediction about how long it could take to stop noticing the effects of climate change",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 16,
            "prompt": "a reference to the fact that a solution is particularly cost-effective",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 17,
            "prompt": "a mention of a technology used to locate areas most in need of intervention",
            "options": [],
            "answerKey": "F",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 18,
        "to": 22,
        "type": "fill",
        "displayType": "sentence-completion",
        "instructionHtml": "<h3>Questions 18–22</h3><p>Complete the sentences below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p><p>Write your answers in boxes on your answer sheet.</p>",
        "config": {},
        "questionHtml": "<p>• The stormwater-management programme in Miami Beach has involved the installation of efficient 18_______ </p><p>• The construction of 19_______  was the first stage of a project to ensure the success of mangroves in Indonesia.</p><p>• As a response to rising floodwaters in the Mekong Delta, a not-for-profit organisation has been building houses that can 20_______ .</p><p>• Rising sea levels in Bangladesh have made it necessary to introduce various 21_______  that are suitable for areas of high salt content.</p><p>• A project in LA has increased the number of 22_______  on the city’s streets.</p>",
        "questions": [
          {
            "number": 18,
            "prompt": "* The stormwater-management programme in Miami Beach has involved the installation of efficient 18_______ ",
            "options": [],
            "answerKey": "pumps",
            "acceptedAnswers": []
          },
          {
            "number": 19,
            "prompt": "* The construction of 19_______  was the first stage of a project to ensure the success of mangroves in Indonesia.",
            "options": [],
            "answerKey": "dams",
            "acceptedAnswers": []
          },
          {
            "number": 20,
            "prompt": "* As a response to rising floodwaters in the Mekong Delta, a not-for-profit organisation has been building houses that can 20_______ .",
            "options": [],
            "answerKey": "float",
            "acceptedAnswers": []
          },
          {
            "number": 21,
            "prompt": "* Rising sea levels in Bangladesh have made it necessary to introduce various 21_______  that are suitable for areas of high salt content.",
            "options": [],
            "answerKey": "crops",
            "acceptedAnswers": []
          },
          {
            "number": 22,
            "prompt": "* A project in LA has increased the number of 22_______  on the city’s streets.",
            "options": [],
            "answerKey": "trees",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 2,
        "from": 23,
        "to": 26,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 23–26</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person,</p><p>Write the correct letter, A E, in boxes on your answer sheet.</p>",
        "config": {
          "featureOptions": [
            "Yanira Pineda",
            "Susanna Tol",
            "Elizabeth English",
            "Raisa Chowdhury",
            "Greg Spotts"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 23,
            "prompt": "It is essential to adopt strategies which involve and help residents of the region.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 24,
            "prompt": "Interventions which reduce heat are absolutely vital for our survival in this location.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 25,
            "prompt": "More work will need to be done in future decades to deal with the impact of rising water levels.",
            "options": [],
            "answerKey": "A",
            "acceptedAnswers": []
          },
          {
            "number": 26,
            "prompt": "The number of locations requiring action to adapt to flooding has grown in recent years.",
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
        "type": "matching",
        "displayType": "matching-info",
        "instructionHtml": "<h3>Questions 27–31</h3><p>Which paragraph contains the following information ?</p><p>Write the correct letter, A-G, in boxes on your answer sheet.</p><p>NB You may use any letter more than once.</p>",
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
            "prompt": "An example of how one predator has been protected by the introduction of livestock guard dogs",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 28,
            "prompt": "An optimistic suggestion about the possible positive developments in the use of livestock guard dogs",
            "options": [],
            "answerKey": "G",
            "acceptedAnswers": []
          },
          {
            "number": 29,
            "prompt": "A description of how the methods used by livestock guard dogs help to keep predators away",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 30,
            "prompt": "Claims by different academics that the use of livestock guard dogs is a successful way of protecting farmers’ herds",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 31,
            "prompt": "A reference to how livestock guard dogs gain their skills",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          }
        ]
      },
      {
        "section": 3,
        "from": 32,
        "to": 36,
        "type": "matching",
        "displayType": "matching-feature",
        "instructionHtml": "<h3>Questions 32–36</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person,</p><p>Write the correct letter, A E, in boxes on your answer sheet</p>",
        "config": {
          "featureOptions": [
            "Dan Macon",
            "Silvia Ribeiro",
            "Linda van Bommel",
            "Julie Young",
            "Bethany Smith"
          ]
        },
        "questionHtml": "",
        "questions": [
          {
            "number": 32,
            "prompt": "The use of guard dogs may save the lives of both livestock and wild animals.",
            "options": [],
            "answerKey": "D",
            "acceptedAnswers": []
          },
          {
            "number": 33,
            "prompt": "Claims of a change in behaviour from those using livestock guard dogs may not be totally accurate.",
            "options": [],
            "answerKey": "E",
            "acceptedAnswers": []
          },
          {
            "number": 34,
            "prompt": "There may be negative results if the use of livestock guard dogs is not sufficiently widespread.",
            "options": [],
            "answerKey": "B",
            "acceptedAnswers": []
          },
          {
            "number": 35,
            "prompt": "Livestock guard dogs are the best way of protecting farm animals, as long as the dogs are appropriately handled.",
            "options": [],
            "answerKey": "C",
            "acceptedAnswers": []
          },
          {
            "number": 36,
            "prompt": "Teaching a livestock guard dog how to do its work needs a different focus from teaching a house guard dog.",
            "options": [],
            "answerKey": "A",
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
        "questionHtml": "<p>Unintended Ecological Effects of Using Guard Dogs</p><p>In Namibia, livestock guard dogs have been used to protect domestic animals from attacks by cheetahs.</p><p>This has led to a rise in the deaths of other predators, particularly 37_______ . In addition, it has been suggested that the dogs could have 38_______  which may affect other species, and that they may reduce the amount of 39_______  available to certain wild animals.</p><p>On the other hand, these dogs may help birds by protecting their nests. These might otherwise be threatened by predators such as 40_______ .</p>",
        "questions": [
          {
            "number": 37,
            "prompt": "This has led to a rise in the deaths of other predators, particularly 37_______ . In addition, it has been suggested that the dogs could have 38_______  which may affect other species, and that they may reduce the amount of 39_______  available to certain wild animals.",
            "options": [],
            "answerKey": "jackals",
            "acceptedAnswers": []
          },
          {
            "number": 38,
            "prompt": "This has led to a rise in the deaths of other predators, particularly 37_______ . In addition, it has been suggested that the dogs could have 38_______  which may affect other species, and that they may reduce the amount of 39_______  available to certain wild animals.",
            "options": [],
            "answerKey": "diseases",
            "acceptedAnswers": []
          },
          {
            "number": 39,
            "prompt": "This has led to a rise in the deaths of other predators, particularly 37_______ . In addition, it has been suggested that the dogs could have 38_______  which may affect other species, and that they may reduce the amount of 39_______  available to certain wild animals.",
            "options": [],
            "answerKey": "food",
            "acceptedAnswers": []
          },
          {
            "number": 40,
            "prompt": "On the other hand, these dogs may help birds by protecting their nests. These might otherwise be threatened by predators such as 40_______ .",
            "options": [],
            "answerKey": "foxes",
            "acceptedAnswers": []
          }
        ]
      }
    ]
  }
]$data$::jsonb)
  loop
    select id into strict exam_id from public.skill_tests where slug = exam_data->>'slug' and skill = 'reading';
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
insert into public.schema_migrations (name) values ('025_correct_cambridge_16_through_20.sql') on conflict do nothing;
commit;
