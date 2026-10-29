-- Import four Cambridge 21 tests supplied as PDFs by the user.
-- Upserts preserve existing IDs and attempts when this migration is rerun.
begin;
do $import$
declare
 exam jsonb; passage jsonb; question_group jsonb; question jsonb;
 exam_id uuid; section_id_value uuid; group_id_value uuid;
begin
 for exam in select value from jsonb_array_elements($data$[
  {
    "id": "cam-21-1",
    "slug": "cam-21-1",
    "skill": "reading",
    "title": "Cambridge 21 - Test 1",
    "level": "Band 6.0-9.0",
    "series": "Cambridge",
    "seriesNo": 21,
    "durationMinutes": 60,
    "testType": "academic",
    "description": "3 passages · 40 questions",
    "questionCount": 40,
    "sortOrder": 49,
    "passages": [
      {
        "sourceId": "cam-21-1-1",
        "title": "The Davies Sisters",
        "contentHtml": "<h2>The Davies Sisters</h2><p>Between 1908 and 1924, Gwendoline and Margaret Davies amassed one of the largest collections of late-nineteenth and early-twentieth-century French paintings in Britain</p><p>Gwendoline (1882-1951) and Margaret (1884-1963) Davies were the granddaughters of David Davies, a Welshman who amassed a fortune in the shipping and mining industries. In 1907, when Gwendoline came into her inheritance (Margaret would follow in 1909), the sisters were said to be the wealthiest unmarried women in Britain. Their religious upbringing in rural Wales gave them a deep sense of social responsibility and they chose to use their inheritance for cultural and philanthropic* purposes.</p><p>While there was no real family history of art collecting, the sisters' education was rigorously geared toward such pursuits. Their London school focused on cultural rather than academic study, and they travelled extensively with their governess, Jane Blaker, visiting art galleries and making extensive notes on the collections there.</p><p>The sisters began to make regular art purchases from 1908, which roughly coincided with the dates of their inheritance. They took advice from various people, including the art dealer Hugh Blaker (the brother of Jane Blaker) and David Croal Thompson, who was also an art dealer. While it was long assumed that these men were largely responsible for the nature of the sisters' collection, it has recently been accepted that Gwendoline and Margaret retained a far more active role in the process.</p><p>The sisters' journals reveal their preference for Old Master** paintings. Yet they initially made very few attempts to secure any such works. While the sisters were wealthy in relative terms, their income was nothing compared to the fortunes of American art collectors of this period, such as J. Pierpont Morgan. Quite simply, high quality Old Master works were, if not beyond their means, then beyond what they were willing to pay for them.</p><p>Instead, their early purchases were of the fashionable, safe variety, and included, for example, paintings by the French artist Jean-Baptiste-Camille Corot.</p><p>However, it was only a few years before their collecting took a new direction and they turned to the work of the French Impressionists***. We know that Hugh Blaker, as a champion of contemporary French art had a hand in the decision, and we know also that they would have seen examples on their various trips to Paris. Whatever the precise reason for this change, their first purchases of Impressionist art, made in October 1912, were scenes of Venice by the French artist Claude Monet.</p><p>Over the next 12 years, the sisters amassed the bulk of their Impressionist collection, including six further works by Monet, two more by Manet, and three by Renoir, including his well-known painting La Parisienne.</p><p>The First World War (1914-1918) played a part in the development of the sisters' collection. Their initial response to the war effort was to finance the safe passage of artists from occupied Belgium to Wales, as a humanitarian act, but also with the hope of establishing a vibrant artists' community in the area. Later in the conflict, both sisters decided to volunteer at a canteen for troops at Troyes, in northern France; Gwendoline in 1916, followed by Margaret in 1917.</p><p>It was tedious and distressing work, which would have a permanent effect on Gwendoline's health. Yet on one of numerous trips to nearby Paris, she visited the Bernheim-Jeune Gallery. Here she acquired two works by Cézanne - Provençal Landscape and The François Zola Dam. The paintings were shipped directly to Bath, England, where they became the first works by Cézanne to go on display in a public gallery in Britain.</p><p>Commentators have often described the sisters as unlikely pioneer collectors. Much is made of their isolation in rural Wales and the fact that they didn't make friends with artists or gallery owners. Yet they didn't feel obliged to follow fashionable tastes and were free to pursue their own preferences. Although they relied on a trusted circle of advisers, they made frequent trips to London and Paris, and also regularly had paintings sent to their home for consideration.</p><p>By the early 1920s, Gwendoline felt increasingly uncomfortable buying art works when faced with the poverty and social upheaval created by the First World War. Her philanthropic pursuits then became focused almost exclusively on social causes and the development of the sisters' home at Gregynog Hall into a conference center and venue for the Gregynog Festival of Music and Poetry. Gwendoline made her final art purchase in March 1926.</p><p>Margaret also stopped collecting around this time, but started again in the 1930s acquiring, on a relatively small scale, work by contemporary British artists.</p><p>The sisters collected French Impressionist paintings at a time when such art was routinely ignored by individuals and institutions alike. The Gwendoline and Margaret Davies collection, donated in 1951 and 1963 respectively to the National Museum Wales, contains major examples of work by leading French Impressionists. In collecting paintings that they loved, the sisters created a lasting and meaningful cultural legacy for the people of Wales and beyond.</p><p>* philanthropic: seeking to promote the welfare of others, often by charitable funding</p><p>** Old Master: a highly respected artist of great skill who worked in Europe before about 1800</p><p>*** Impressionist: an artist with a style of painting that developed in France in the late 1800s by Renoir, including his well-known painting La Parisienne</p>",
        "sectionNo": 1,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-1-1-1-7",
            "order": 1,
            "displayType": "note-completion",
            "instructionHtml": "<h3>Questions 1–7</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "1",
                "sourceNumber": 1,
                "order": 1,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* their grandfather's wealth came from 1_______  and transportation businesses",
                "questionHtml": "<p>Gwendoline and Margaret Davies</p><p>Family and early life</p><p>• their grandfather's wealth came from 1_______  and transportation businesses</p><p>• their upbringing gave them a sense of social responsibility</p><p>• their 2_______  was designed to give them an interest in activities such as collecting art</p><p>• their governess took them on trips to art galleries</p><p>• they took lengthy 3_______  about the things they saw in art galleries</p><p>The sisters as art collectors</p><p>• their 4_______  showed they liked Old Master paintings, but they were expensive to buy</p><p>• their early purchases were safe, popular paintings</p><p>• the first Impressionist paintings they bought showed places in 5_______ </p><p>Impact of First World War</p><p>• they helped bring artists from Belgium to Wales</p><p>• they worked in a 6_______  for soldiers in France</p><p>Opinions about the sisters as art collectors</p><p>• were not considered typical collectors - they lived in isolation in the countryside and did not have any 7_______  who were artists</p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "mining",
                "explanation": "Gwendoline (1882-1951) and Margaret (1884-1963) Davies were the granddaughters of David Davies, a Welshman who amassed a fortune in the shipping and mining industries"
              },
              {
                "sourceId": "2",
                "sourceNumber": 2,
                "order": 2,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* their 2_______  was designed to give them an interest in activities such as collecting art",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "education",
                "explanation": "While there was no real family history of art collecting, the sisters' education was rigorously geared toward such pursuits"
              },
              {
                "sourceId": "3",
                "sourceNumber": 3,
                "order": 3,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* they took lengthy 3_______  about the things they saw in art galleries",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "notes",
                "explanation": "Their London school focused on cultural rather than academic study, and they travelled extensively with their governess, Jane Blaker, visiting art galleries and making extensive notes on the collections there"
              },
              {
                "sourceId": "4",
                "sourceNumber": 4,
                "order": 4,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* their 4_______  showed they liked Old Master paintings, but they were expensive to buy",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "journals",
                "explanation": "The sisters' journals reveal their preference for Old Master* * paintings Quite simply, high quality Old Master works were, if not beyond their means, then beyond what they were willing to pay for them"
              },
              {
                "sourceId": "5",
                "sourceNumber": 5,
                "order": 5,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* the first Impressionist paintings they bought showed places in 5_______ ",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "Venice",
                "explanation": "Whatever the precise reason for this change, their first purchases of Impressionist art, made in October 1912, were scenes of Venice by the French artist Claude Monet"
              },
              {
                "sourceId": "6",
                "sourceNumber": 6,
                "order": 6,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* they worked in a 6_______  for soldiers in France",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "canteen",
                "explanation": "Later in the conflict, both sisters decided to volunteer at a canteen for troops at Troyes, in northern France; Gwendoline in 1916, followed by Margaret in 1917"
              },
              {
                "sourceId": "7",
                "sourceNumber": 7,
                "order": 7,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* were not considered typical collectors - they lived in isolation in the countryside and did not have any 7_______  who were artists",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "friends",
                "explanation": "Much is made of their isolation in rural Wales and the fact that they didn't make friends with artists or gallery owners"
              }
            ]
          },
          {
            "key": "cam-21-1-1-8-13",
            "order": 2,
            "displayType": "tfng",
            "instructionHtml": "<h3>Questions 8–13</h3><p>Do the following statements agree with the information given in Reading Passage 1?</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "8",
                "sourceNumber": 8,
                "order": 1,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "The Davies sisters' childhood influenced the way they decided to use their wealth.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "TRUE",
                "explanation": "Their religious upbringing in rural Wales gave them a deep sense of social responsibility and they chose to use their inheritance for cultural and philanthropic* purposes"
              },
              {
                "sourceId": "9",
                "sourceNumber": 9,
                "order": 2,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "The Jean-Baptiste-Camille Corot paintings in the Davies sisters' collection were purchased from a gallery in France.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "Instead, their early purchases were of the fashionable, safe variety, and included, for example, paintings by the French artist Jean-Baptiste-Camille Corot "
              },
              {
                "sourceId": "10",
                "sourceNumber": 10,
                "order": 3,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Hugh Blaker opposed the Davies sisters' decision to buy art by French Impressionists.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "FALSE",
                "explanation": "We know that Hugh Blaker, as a champion of contemporary French art had a hand in the decision, and we know also that they would have seen examples on their various trips to Paris"
              },
              {
                "sourceId": "11",
                "sourceNumber": 11,
                "order": 4,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "The exhibition of Cézanne paintings at the Bath gallery was very popular with the public.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "The paintings were shipped directly to Bath, England, where they became the first works by Cézanne to go on display in a public gallery in Britain"
              },
              {
                "sourceId": "12",
                "sourceNumber": 12,
                "order": 5,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "The impact of the First World War encouraged Gwendoline to reconsider her interest in collecting art.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "TRUE",
                "explanation": "By the early 1920s, Gwendoline felt increasingly uncomfortable buying art works when faced with the poverty and social upheaval created by the First World War"
              },
              {
                "sourceId": "13",
                "sourceNumber": 13,
                "order": 6,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "The Davies sisters bought French Impressionist art during a period when very few people were doing so.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "TRUE",
                "explanation": "The sisters collected French Impressionist paintings at a time when such art was routinely ignored by individuals and institutions alike"
              }
            ]
          }
        ]
      },
      {
        "sourceId": "cam-21-1-2",
        "title": "Why we need silence",
        "contentHtml": "<h2>Why we need silence</h2><p><strong>A</strong> Humans are finely attuned to noise, and for good reason. From an evolutionary perspective, sounds give us vital information, helping us navigate the world and avoid danger. To help ensure loud or unexpected noises get the attention they deserve, our internal chemistry alters in response to them. Our blood pressure goes up, muscles tense and glands release hormones that prepare us for fight or flight. In the short term, this is a good thing.</p><p>When we are exposed to too much noise over the long term, however, those responses can lead to a multitude of health issues, from sleep disturbance to even cardiovascular disease.</p><p><strong>B</strong> The World Health Organization has recently designated excessive noise as an 'underestimated threat' to public health, and has said that people living in cities such as Mumbai, Tokyo and Buenos Aires are being exposed to far more than the recommended 40 decibels of noise at night. A report from the European Environment Agency concluded that noise was an ongoing and widespread issue in Europe, with at least 1 in 5 people consistently exposed to levels considered harmful to health.</p><p>'There are no &quot;earlids&quot; that can protect your brain from noise,' says Nick Antonio, an acoustic consultant who has contributed to the British and international standards for noise.</p><p><strong>C</strong> The good news is that several cities have been working to turn the volume down. One of the first to do so was London. 'By providing recommendations for quieter buses, reducing noise from roads and also controlling noise from aircraft, they were able to make the city quieter,' says Antonio. Other cities have introduced noise-reducing road coatings, for instance, alongside greenery that muffles sound.</p><p>Some solutions are more specific: Washington DC's ban on petrol-powered leaf blowers came into effect recently, while in New York City, legislation has been approved to fine people who modify their vehicles to make them noisier. 'People are seeing the benefits of these more quiet environments in their cities,' Antonio says. 'I expect we will see much more of this in the future.'</p><p><strong>D</strong> Researchers are also seeking to understand what aspects of silent experiences are most beneficial to our health. One of the best-researched is the flotation tank: a lightproof, soundproof tank of salt water in which a person floats as a form of deep relaxation. While some people experience altered perception in the tanks, involving subtle humming sounds and visual effects, these effects are benign and do not detract from the benefits of the experience, says Justin Feinstein, a clinical neuropsychologist.</p><p>'When you don't have external sensory stimuli coming in, the brain tries to fill the void to make sense of this dark and silent world,' he explains. 'In these tanks, some people can even hear the sound of their eyes blinking,' says Feinstein. 'But it is the ability to focus on the breath that helps people reach a relaxed or meditative state.'</p><p><strong>E</strong> To further explore flotation tanks as a therapeutic tool, Feinstein and his colleagues recruited 50 people with a variety of conditions related to stress and had them answer a questionnaire prior to and following a flotation session. Participants reported decreases in muscle tension, pain and symptoms of their conditions after a single, 1-hour float, alongside an increase in feelings of relaxation and overall wellbeing.</p><p>Less is known about what effects sensory deprivation can have on the brain. To investigate, Feinstein's team had 48 people participate in either three 90-minute float sessions or three 90-minute periods of relaxing on a chair which reclined. Participants had their brains scanned using functional magnetic resonance imaging at the beginning and end of the trial. Float sessions uniquely decreased activity in the default mode network (DMN), a collection of brain regions commonly linked with depression.</p><p>Feinstein says it is an exciting finding, because flotation tanks seem to offer a way of 'resetting' our nervous system to prevent it from getting out of balance.</p><p><strong>F</strong> Neurobiologist Tal Dotan Ben-Soussan is also an advocate of silence as a therapy. 'When we find ways to be quiet, we are not only quiet in our environment, but quiet in our inner selves,' she explains. 'This allows us to be more aware of what is happening around us and what the situation may require from us so we can provide [a more] adequate response.'</p><p>Not everyone will benefit from silence to the same extent, but Ben-Soussan says one characteristic is key: the person must need to want to engage in the experience. 'We see from animal models and human studies that volition and intentionality is important,' she says. 'When people do not want silence, it can be very distressing.'</p><p><strong>G</strong> Eric Pfeifer, a psychotherapy researcher, also concedes that some people may not benefit from silence, particularly those who are in a heightened state of stress. 'People in these states may not be able to relax or calm down in a silent condition,' he says. Professional guidance can be useful, he adds, allowing people to approach silence slowly so that they can gradually enjoy the benefits. And Pfeifer is convinced that silence is more attainable in everyday life than people think.</p><p>First, complete silence isn't necessary. In a recent study, he found that participants reported more relaxation and less boredom when they sat quietly in an outdoor garden compared with a completely silent room. Second, Pfeifer believes we don't need a lot of silence to gain benefits. 'You don't need to spend hours in silence,' he says. 'It is likely better to have more frequency of silence for a few minutes at a time than a longer period of silence only once a week.</p><p>Just finding those places in your daily life where you can find some silence ... can make a big difference.'</p>",
        "sectionNo": 2,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-1-2-14-17",
            "order": 1,
            "displayType": "matching-info",
            "instructionHtml": "<h3>Questions 14–17</h3><p>Reading Passage 2 has seven sections, A-G.</p><p>Which section contains the following information?</p>",
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
            "questions": [
              {
                "sourceId": "14",
                "sourceNumber": 14,
                "order": 1,
                "type": "matching",
                "displayType": "matching-info",
                "prompt": "examples of strategies to decrease the noise that the public are exposed to",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "C",
                "explanation": "'By providing recommendations for quieter buses, reducing noise from roads and also controlling noise from aircraft, they were able to make the city quieter,' says Antonio. Other cities have introduced noise-reducing road coatings, for instance, alongside greenery that muffles sound. Some solutions are more specific: Washington DC's ban on petrol-powered leaf blowers came into effect recently, while in New York City, legislation has been approved to fine people who modify their vehicles to make them noisier"
              },
              {
                "sourceId": "15",
                "sourceNumber": 15,
                "order": 2,
                "type": "matching",
                "displayType": "matching-info",
                "prompt": "data indicating the extent of the problem of excessive noise",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "B",
                "explanation": "A report from the European Environment Agency concluded that noise was an ongoing and widespread issue in Europe, with at least 1 in 5 people consistently exposed to levels considered harmful to health"
              },
              {
                "sourceId": "16",
                "sourceNumber": 16,
                "order": 3,
                "type": "matching",
                "displayType": "matching-info",
                "prompt": "a description of physiological changes in our bodies when we hear sudden noises",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "To help ensure loud or unexpected noises get the attention they deserve, our internal chemistry alters in response to them. Our blood pressure goes up, muscles tense and glands release hormones that prepare us for fight or flight"
              },
              {
                "sourceId": "17",
                "sourceNumber": 17,
                "order": 4,
                "type": "matching",
                "displayType": "matching-info",
                "prompt": "evidence that a relatively quiet environment can be more beneficial than a totally silent one",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "G",
                "explanation": "In a recent study, he found that participants reported more relaxation and less boredom when they sat quietly in an outdoor garden compared with a completely silent room "
              }
            ]
          },
          {
            "key": "cam-21-1-2-18-21",
            "order": 2,
            "displayType": "summary-completion",
            "instructionHtml": "<h3>Questions 18–21</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "18",
                "sourceNumber": 18,
                "order": 1,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "According to Justin Feinstein, flotation tanks allow people to concentrate on their own 18_______  , which helps them relax and enables them to meditate.",
                "questionHtml": "<p>Flotation Tanks</p><p>According to Justin Feinstein, flotation tanks allow people to concentrate on their own 18_______  , which helps them relax and enables them to meditate.</p><p>Feinstein and his colleagues conducted an experiment in which 50 people, who were all suffering from stress and related issues, were given a 19_______  to complete before and after using a flotation tank. Participants reported a reduction in their symptoms after an hour in the tank, together with signs of relaxation and improved general 20_______  .</p><p>In another experiment, the researchers had 48 people spend periods of 90 minutes either lying back in a chair or floating in a tank. Brain scans then revealed that those people who had been in a tank had decreased activity in parts of the brain associated with 21_______  .</p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "breath",
                "explanation": "'But it is the ability to focus on the breath that helps people reach a relaxed or meditative state.'"
              },
              {
                "sourceId": "19",
                "sourceNumber": 19,
                "order": 2,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "Feinstein and his colleagues conducted an experiment in which 50 people, who were all suffering from stress and related issues, were given a 19_______  to complete before and after using a flotation tank. Participants reported a reduction in their symptoms after an hour in the tank, together with signs of relaxation and improved general 20_______  .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "questionnaire",
                "explanation": "To further explore flotation tanks as a therapeutic tool, Feinstein and his colleagues recruited 50 people with a variety of conditions related to stress and had them answer a questionnaire prior to and following a flotation session"
              },
              {
                "sourceId": "20",
                "sourceNumber": 20,
                "order": 3,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "Feinstein and his colleagues conducted an experiment in which 50 people, who were all suffering from stress and related issues, were given a 19_______  to complete before and after using a flotation tank. Participants reported a reduction in their symptoms after an hour in the tank, together with signs of relaxation and improved general 20_______  .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "wellbeing",
                "explanation": "Participants reported decreases in muscle tension, pain and symptoms of their conditions after a single, I-hour float, alongside an increase in feelings of relaxation and overall wellbeing"
              },
              {
                "sourceId": "21",
                "sourceNumber": 21,
                "order": 4,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "In another experiment, the researchers had 48 people spend periods of 90 minutes either lying back in a chair or floating in a tank. Brain scans then revealed that those people who had been in a tank had decreased activity in parts of the brain associated with 21_______  .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "depression",
                "explanation": "Float sessions uniquely decreased activity in the default mode network (DMN), a collection of brain regions commonly linked with depression"
              }
            ]
          },
          {
            "key": "cam-21-1-2-22-26",
            "order": 3,
            "displayType": "matching-feature",
            "instructionHtml": "<h3>Questions 22–26</h3><p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person, A, B, C or D.</p><p>NB You may use any letter more than once.</p>",
            "config": {
              "featureOptions": [
                "Nick Antonio",
                "Justin Feinstein",
                "Tal Dotan Ben-Soussan",
                "Eric Pfeifer"
              ]
            },
            "questions": [
              {
                "sourceId": "22",
                "sourceNumber": 22,
                "order": 1,
                "type": "matching",
                "displayType": "matching-feature",
                "prompt": "It is unpleasant and upsetting for people to be placed in a silent environment against their will.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "C",
                "explanation": "'When people do not want silence, it can be very distressing.'"
              },
              {
                "sourceId": "23",
                "sourceNumber": 23,
                "order": 2,
                "type": "matching",
                "displayType": "matching-feature",
                "prompt": "The trend towards creating quieter urban locations is likely to increase in the coming years.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "'People are seeing the benefits of these more quiet environments in their cities,' Antonio says. 'l expect we will see much more of this in the future.'"
              },
              {
                "sourceId": "24",
                "sourceNumber": 24,
                "order": 3,
                "type": "matching",
                "displayType": "matching-feature",
                "prompt": "When our body's senses are completely deprived of input, our minds compensate for this by creating the illusion of images and sounds.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "B",
                "explanation": "While some people experience altered perception in the tanks, involving subtle humming sounds and visual effects, these effects are benign and do not detract from the benefits of the experience, says Justin Feinstein, a clinical neuropsychologist. 'When you don't have external sensory stimuli coming in, the brain tries to fill the void to make sense of this dark and silent world,' he explains"
              },
              {
                "sourceId": "25",
                "sourceNumber": 25,
                "order": 4,
                "type": "matching",
                "displayType": "matching-feature",
                "prompt": "Even a short amount of silent time can have a positive impact.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "D",
                "explanation": "Second, Pfeifer believes we don't need a lot of silence to gain benefits. 'You don't need to spend hours in silence,' he says. 'It is likely better to have more frequency of silence for a few minutes at a time than a longer period of silence only once a week"
              },
              {
                "sourceId": "26",
                "sourceNumber": 26,
                "order": 5,
                "type": "matching",
                "displayType": "matching-feature",
                "prompt": "External and internal quietness makes us more conscious of events occurring in our surroundings and helps us react appropriately to these events.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "C",
                "explanation": "'When we find ways to be quiet, we are not only quiet in our environment, but quiet in our inner selves,' she explains. 'This allows us to be more aware of what is happening around us and what the situation may require from us so we can provide [a more] adequate response.' "
              }
            ]
          }
        ]
      },
      {
        "sourceId": "cam-21-1-3",
        "title": "Book review: The World of Sugar by Ulbe Bosma",
        "contentHtml": "<h2>Book review: The World of Sugar by Ulbe Bosma</h2><p>Ulbe Bosma's The World of Sugar is a genuinely global history. Bosma discusses all the sugar-growing places of the world, beginning with Cuba and Java, the largest exporters of the early 20th century. But this is a history not just of cane sugar but also of beet sugar, an equally important form of traded sugar over the last hundred years. Beet sugar is grown mainly in Europe and the United States.</p><p>It has also been massively subsidised and sold at artificially low prices on world markets, threatening the livelihood of producers of cane sugar.</p><p>Bosma's discussion of the sugar market in Britain gives a sense of the book's range. The sweet-toothed British first bought cane sugar from their own slavery-dependent colonial plantations. Following the abolition of slavery in the British Empire, cane sugar was imported to Britain from places which retained the practice, such as Cuba and Brazil. Towards the end of the 19th century, the British started to import beet sugar from continental Europe.</p><p>Only in the 20th century was there a move to develop a national beet sugar industry.</p><p>The book provides a global labour history, investigating the wide range of labour regimes associated with growing sugar. Contrary to popular belief, cane sugar production was never just restricted to large, dedicated plantations owned by rich men. For example, in Java, a huge exporter of sugar in the early 20th century, sugar cane was grown together with rice in an extraordinarily labour-intensive way by small farmers.</p><p>The World of Sugar is also a story of similarity and continuity in sugar cultivation. For example, imported labour has been used for much large-scale production. German beet fields employed Polish workers; Mexicans and many others, including Sicilians, were vital to US sugar production. Cane cutting, Bosma shows, remains a poorly paid and brutal business to this day in many places in the world. But as well as this, the book is about the continuity of the use of traditional methods on small farms.</p><p>In the mid 20th-century, this type of sugar production dominated in South Asia and Latin America.</p><p>This is also a history of capitalists and sugar dynasties, as well as corporations that in some cases have remained influential over very long periods. Great firms and great interests have had profound influence on the policies of states. In many places - not just the British Caribbean but Cuba and the Philippines too - a powerful sugar bourgeoisie played a major role in politics and their interests were consequently protected by trade barriers and subsidies.</p><p>In the battle for control of the industry, it was inevitably the poor countries which came off worse. All this is explored by Bosma with wonderful subtlety and control.</p><p>But sugar production was never just a matter of agriculture. It also involved the extraction, close to the place of harvest, of sucrose from the sugar plant, a process which required machinery powered by humans, animals, wind or steam. Further processes involved boiling (from the 19th century, this often involved vacuum systems) and the separation of sugar from other materials in a process known as refinement.</p><p>From very early on, sugar production was an energy-intensive industrial process, mostly taking place in the countryside and in refineries in centres of consumption, both small and large. The growth of the industry entailed a very rapid diffusion of ideas and techniques from one country to another. Cuba, for example, developed an extraordinarily dense system of railways to transport workers and cane, as well as steam-powered sugar factories.</p><p>Particular varieties of cane sugar and beet sugar spread very rapidly across the world, in accordance with local needs and demands.</p><p>Where once only tiny quantities of sugar could be produced, now new techniques, varieties, fertilisers, irrigation systems and much more have turned gleaming white sugar into a ubiquitous chemical. Over the same time, there has been a massive increase in consumption. Once regarded as a luxury, sugar came to be promoted as a valuable source of energy. But as the consumption of sugar has increased, so has the harm it does, whether to people's teeth or weight.</p><p>In the face of appalling obstruction from the sugar industry to attempts to reduce consumption, some countries have been forced to tax sugar in order to bring that about. The sugar industry has a history of attacking its critics and, when it comes to obesity, of trying to blame fats, and lack of exercise and self-control. And the recent past has seen worrying new developments in mass sweetening.</p><p>High-fructose corn syrup made from maize using an enzymatic process invented in Japan in the 1960s has a similar number of calories to table sugar but is far cheaper to produce. It is now widely consumed, having been adopted in the making of soft drinks and a large number of processed foods, and is regarded as a leading cause of obesity.</p><p>This is a wonderfully rich book, a model of global history, the history of production and the history of capitalism. Bosma avoids outbursts of emotion, celebratory or critical, even if they might have made his analysis of the multiple tragedies involving sugar all the more powerful. He shows that we could always have done without sugar and that today we have many alternative sources of sweetness. Yet many of the poorest people in the world still depend on it to make a living.</p>",
        "sectionNo": 3,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-1-3-27-30",
            "order": 1,
            "displayType": "multiple-choice",
            "instructionHtml": "<h3>Questions 27–30</h3><p>Choose the correct letter, A, B, C or D.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "27",
                "sourceNumber": 27,
                "order": 1,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "What does the reviewer suggest about the cultivation and trading of sugar in the first paragraph?",
                "questionHtml": "",
                "options": [
                  "Sugar has played a major role in international relations.",
                  "Beet sugar has been made more internationally competitive.",
                  "Cane sugar is thought to be of superior quality to beet sugar.",
                  "New locations for cultivating sugar have increased production."
                ],
                "acceptedAnswers": [],
                "answerKey": "B",
                "explanation": "It has also been massively subsidised and sold at artificially low prices on world markets, threatening the livelihood of producers of cane sugar"
              },
              {
                "sourceId": "28",
                "sourceNumber": 28,
                "order": 2,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "In the second paragraph, when discussing the sugar market in Britain, the reviewer stresses",
                "questionHtml": "",
                "options": [
                  "how the sources used changed over time.",
                  "how developments in agriculture affected trade.",
                  "the increased demand for sugar over the years.",
                  "the growing support for ethical methods of cultivation."
                ],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "The sweet-toothed British first bought cane sugar from their own slavery- dependent colonial plantations. Following the abolition of slavery in the British Empire, cane sugar was imported to Britain from places which retained the practice, such as Cuba and Brazil. Towards the end of the 19th century, the British started to import beet sugar from continental Europe. Only in the 20th century was there a move to develop a national beet sugar industry"
              },
              {
                "sourceId": "29",
                "sourceNumber": 29,
                "order": 3,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "What is the reviewer doing in the third paragraph?",
                "questionHtml": "",
                "options": [
                  "describing an efficient approach to sugar cultivation",
                  "explaining why the use of sugar plantations declined",
                  "addressing a misconception about the growing of sugar cane",
                  "evaluating different approaches to the cultivation of sugar cane"
                ],
                "acceptedAnswers": [],
                "answerKey": "C",
                "explanation": "Contrary to popular belief, cane sugar production was never just restricted to large, dedicated plantations owned by rich men"
              },
              {
                "sourceId": "30",
                "sourceNumber": 30,
                "order": 4,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "In the final paragraph, what does the reviewer suggest is the overall message of Bosma's book?",
                "questionHtml": "",
                "options": [
                  "Sugar is a harmful and unnecessary product.",
                  "Economic pressure is needed to control sugar production.",
                  "Conditions for workers in sugar production should be improved.",
                  "Intensive marketing of sugar has had disastrous consequences."
                ],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "Bosma avoids outbursts of emotion, celebratory or critical, even if they might have made his analysis of the multiple tragedies involving sugar all the more powerful. He shows that we could always have done without sugar and that today we have many alternative sources of sweetness"
              }
            ]
          },
          {
            "key": "cam-21-1-3-31-36",
            "order": 2,
            "displayType": "summary-completion",
            "instructionHtml": "<h3>Questions 31–36</h3><p>Complete the summary using the list of words, A-I, below.</p>",
            "config": {
              "phraseOptions": [
                "national governments",
                "agricultural developments",
                "less wealthy nations",
                "untrained workers",
                "small-scale cultivation",
                "outdated methods",
                "financial controls",
                "migrant workers",
                "powerful individuals and businesses"
              ]
            },
            "questions": [
              {
                "sourceId": "31",
                "sourceNumber": 31,
                "order": 1,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The book The World of Sugar points out the similarities in the way that sugar was cultivated around the world. In the big industries in both Germany and the US, sugar farming depended on 31_______  . However, in other parts of the world such as South Asia and Latin America, 32_______  continued.",
                "questionHtml": "<p>Sugar cultivation and production</p><p>The book The World of Sugar points out the similarities in the way that sugar was cultivated around the world. In the big industries in both Germany and the US, sugar farming depended on 31_______  . However, in other parts of the world such as South Asia and Latin America, 32_______  continued.</p><p>Sugar production has also involved 33_______  who were eager to protect their markets. In countries such as Cuba the sugar industry therefore had a major influence on 34_______  .</p><p>To support the interests of sugar producers, 35_______  were established. As a result of this, 36_______  were penalised.</p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "H",
                "explanation": "German beet fields employed Polish workers; Mexicans and many others, including Sicilians, were vital to US sugar production"
              },
              {
                "sourceId": "32",
                "sourceNumber": 32,
                "order": 2,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The book The World of Sugar points out the similarities in the way that sugar was cultivated around the world. In the big industries in both Germany and the US, sugar farming depended on 31_______  . However, in other parts of the world such as South Asia and Latin America, 32_______  continued.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "E",
                "explanation": "But as well as this, the book is about the continuity of the use of traditional methods on small farms. In the mid 20th-century, this type of sugar production dominated in South Asia and Latin America"
              },
              {
                "sourceId": "33",
                "sourceNumber": 33,
                "order": 3,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "Sugar production has also involved 33_______  who were eager to protect their markets. In countries such as Cuba the sugar industry therefore had a major influence on 34_______  .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "I",
                "explanation": "This is also a history of capitalists and sugar dynasties, as well as corporations that in some cases have remained influential over very long periods. Great firms and great interests have had profound influence on the policies of states"
              },
              {
                "sourceId": "34",
                "sourceNumber": 34,
                "order": 4,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "Sugar production has also involved 33_______  who were eager to protect their markets. In countries such as Cuba the sugar industry therefore had a major influence on 34_______  .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "In many places — not just the British Caribbean but Cuba and the Philippines too — a powerful sugar bourgeoisie played a major role in politics and their interests were consequently protected by trade barriers and subsidies "
              },
              {
                "sourceId": "35",
                "sourceNumber": 35,
                "order": 5,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "To support the interests of sugar producers, 35_______  were established. As a result of this, 36_______  were penalised.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "G",
                "explanation": "In many places — not just the British Caribbean but Cuba and the Philippines too — a powerful sugar bourgeoisie played a major role in politics and their interests were consequently protected by trade barriers and subsidies"
              },
              {
                "sourceId": "36",
                "sourceNumber": 36,
                "order": 6,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "To support the interests of sugar producers, 35_______  were established. As a result of this, 36_______  were penalised.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "C",
                "explanation": "In the battle for control of the industry, it was inevitably the poor countries which came off worse"
              }
            ]
          },
          {
            "key": "cam-21-1-3-37-40",
            "order": 3,
            "displayType": "ynng",
            "instructionHtml": "<h3>Questions 37–40</h3><p>Do the following statements agree with the views of the writer in Reading Passage 3?</p><p>YES if the statement agrees with the views of the writer</p><p>NO if the statement contradicts the views of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "37",
                "sourceNumber": 37,
                "order": 1,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "Sugar has now become available in large quantities due to a range of agricultural developments.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "YES",
                "explanation": "Where once only tiny quantities of sugar could be produced, now new techniques, varieties, fertilisers, irrigation systems and much more have turned gleaming white sugar into a ubiquitous chemical"
              },
              {
                "sourceId": "38",
                "sourceNumber": 38,
                "order": 2,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "Advertisers initially marketed sugar as a luxury product.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "Once regarded as a luxury, sugar came to be promoted as a valuable source of energy"
              },
              {
                "sourceId": "39",
                "sourceNumber": 39,
                "order": 3,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "The invention of high-fructose corn syrup was a positive development.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NO",
                "explanation": "And the recent past has seen worrying new developments in mass sweetening. High-fructose corn syrup made from maize using an enzymatic process invented in Japan in the 1960s has a similar number of calories to table sugar but is far cheaper to produce. It is now widely consumed, having been adopted in the making of soft drinks and a large number of processed foods, and is regarded as a leading cause of obesity"
              },
              {
                "sourceId": "40",
                "sourceNumber": 40,
                "order": 4,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "High-fructose corn syrup is an ingredient in many processed foods.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "YES",
                "explanation": "It is now widely consumed, having been adopted in the making of soft drinks and a large number of processed foods, and is regarded as a leading cause of obesity"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cam-21-2",
    "slug": "cam-21-2",
    "skill": "reading",
    "title": "Cambridge 21 - Test 2",
    "level": "Band 6.0-9.0",
    "series": "Cambridge",
    "seriesNo": 21,
    "durationMinutes": 60,
    "testType": "academic",
    "description": "3 passages · 40 questions",
    "questionCount": 40,
    "sortOrder": 50,
    "passages": [
      {
        "sourceId": "cam-21-2-1",
        "title": "Do animals dream?",
        "contentHtml": "<h2>Do animals dream?</h2><p>Studies using electrodes attached to the heads of sleepers have shown that when we sleep, we do so in two ways that alternate throughout the night. The first is rapid eye movement (REM) or active sleep. During this stage our eyes move, even though our eyelids are closed. Our muscles also twitch slightly, though they are largely paralysed so we don't hurt ourselves. In contrast, we also engage in non-REM sleep, during which we barely move at all.</p><p>Most dream states, and certainly those with the most vivid dreams, happen during REM sleep.</p><p>There's some evidence that other mammals may also dream. For example, researchers compared the brain patterns of rats running through a maze when awake with their brain patterns during REM sleep. They found the patterns were very similar and concluded that the sleeping rats were dreaming about going through the maze.</p><p>But finding evidence of dreaming in non-mammals has proved more difficult. Their brains are very different from those of humans, and it can often be difficult to record their activity while they are sleeping. Recently, however, researchers succeeded in recording brain activity in sleeping pigeons. As in mammals, the recordings revealed both REM and non-REM sleep.</p><p>Intriguingly, REM sleep activity was high in brain regions involved in processing visual information, especially images related to physical activities such as flying, which suggests that this may possibly be what the pigeons were dreaming about.</p><p>That said, dreaming and REM sleep are unlikely to be universal in the animal kingdom. For example, sponges don't have brains, so they lack the machinery for dreaming. There are also some animals with unusual sleep patterns. These include whales and dolphins, which do not shut down their entire brain when they sleep, but only half of it, keeping the rest awake. They also show no sign of REM sleep, suggesting that they may only experience non-REM dreams, which are less vivid.</p><p>This is surprising because we tend to think of whales and dolphins as having complex inner lives. It's thought that they don't experience REM sleep because during REM sleep animals are more vulnerable to extremes of temperature.</p><p>Nevertheless, in many cases REM sleep does seem to have benefits. Growing evidence from birds and mammals suggests that REM sleep and dreaming are important for forming memories and learning. It is believed that when events are replayed in dreams, this helps to integrate memories into longer-term storage. As soon as animals evolved moderately complex lifestyles, they would have needed to dream in order to manage these lifestyles.</p><p>However, we still don't understand how this outward behaviour relates to internal experience. It seems impossible to know what it is like to be a rat or a pigeon, let alone imagine their dreamscapes. We are quick to interpret the twitching limbs and quiet barks of sleeping dogs, but the truth is that we don't know if there is an internal experience of chasing rabbits that comes along with that.</p><p>Another non-human dreamer offers insight here. In 2019, while making a documentary, David Scheel of Alaska Pacific University in the USA housed an octopus named Heidi in a tank in his living room. At one point, in the middle of the night, Heidi seemed to dream: her limbs and head moved, and her skin rapidly changed colour, as though she was pursuing a crab.</p><p>Similarly, a report recently emerged of a sleeping octopus apparently having a nightmare. Costello, as the octopus was called, thrashed around, extended his mantle as if trying to make himself look bigger, and squirted ink as though he were being attacked by a predator. The nightmare study is intriguing, says Scheel, but is only based on one animal.</p><p>He argues that as well as outward behaviour, brain imaging is needed to show that the octopuses are replaying sequences of activities from their waking lives in dreams.</p><p>The trouble is that we will never be able to experience any animal's dreams. That goes for other humans' dreams too. But we can try to imagine what these dreamscapes are like by meeting animals on their own terms. For example, vision is the dominant sense for many humans, and so our dreams are heavily visual too. Dogs primarily navigate the world using smell while spiders rely much more on vibrations.</p><p>It is likely that dreaming has served multiple purposes since the first complex animals evolved. And if this is the case, it is possible that better understanding of these purposes might shed light on the true purpose of our own dreams.</p>",
        "sectionNo": 1,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-2-1-1-5",
            "order": 1,
            "displayType": "table-completion",
            "instructionHtml": "<h3>Questions 1–5</h3><p>Complete the table below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "1",
                "sourceNumber": 1,
                "order": 1,
                "type": "fill",
                "displayType": "table-completion",
                "prompt": "1_______  |",
                "questionHtml": "<p>Research into sleep and dreaming</p><table><tbody><tr><td></td><td>Research findings</td><td>Comment</td></tr><tr><td>Humans</td><td><p>• humans experience REM sleep and non-REM sleep</p><p>• in REM sleep, the eyes and muscles move</p></td><td></td></tr><tr><td>1_______</td><td><p>• similar brain patterns were observed when active and sleeping</p></td><td>indicative of dreaming</td></tr><tr><td>Pigeons</td><td><p>• when sleeping, pigeons displayed activity in parts of the brain that deal with 2_______  input</p></td><td>may have been dreaming of flying</td></tr><tr><td>Whales and dolphins</td><td><p>• still have 3_______  their brain awake when they sleep</p><p>• don't experience REM sleep, as this could affect their sensitivity to 4_______ </p></td><td>their dreams are probably not very 5_______</td></tr></tbody></table>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "rats",
                "explanation": "For example, researchers compared the brain patterns of rats running through a maze when awake with their brain patterns during REM sleep. They found the patterns were very similar and concluded that the sleeping rats were dreaming about going through the maze"
              },
              {
                "sourceId": "2",
                "sourceNumber": 2,
                "order": 2,
                "type": "fill",
                "displayType": "table-completion",
                "prompt": "* when sleeping, pigeons displayed activity in parts of the brain that deal with 2_______  input",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "visual",
                "explanation": "Intriguingly, REM sleep activity was high in brain regions involved in processing visual information, especially images related to physical activities such as flying, which suggests that this may possibly be what the pigeons were dreaming about"
              },
              {
                "sourceId": "3",
                "sourceNumber": 3,
                "order": 3,
                "type": "fill",
                "displayType": "table-completion",
                "prompt": "* still have 3_______  their brain awake when they sleep",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "half",
                "explanation": "These include whales and dolphins, which do not shut down their entire brain when they sleep, but only half of it, keeping the rest awake"
              },
              {
                "sourceId": "4",
                "sourceNumber": 4,
                "order": 4,
                "type": "fill",
                "displayType": "table-completion",
                "prompt": "* don't experience REM sleep, as this could affect their sensitivity to 4_______ ",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "temperature",
                "explanation": "It's thought that they don't experience REM sleep because during REM sleep animals are more vulnerable to extremes of temperature"
              },
              {
                "sourceId": "5",
                "sourceNumber": 5,
                "order": 5,
                "type": "fill",
                "displayType": "table-completion",
                "prompt": "| their dreams are probably not very 5_______ ",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "vivid",
                "explanation": "They also show no sign of REM sleep, suggesting that they may only experience non-REM dreams, which are less vivid"
              }
            ]
          },
          {
            "key": "cam-21-2-1-6-13",
            "order": 2,
            "displayType": "tfng",
            "instructionHtml": "<h3>Questions 6–13</h3><p>Do the following statements agree with the information given in Reading Passage 1?</p><p>In boxes 6-13 on your answer sheet, write</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "6",
                "sourceNumber": 6,
                "order": 1,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Dreaming about past experiences helps us to create lasting memories of them.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "TRUE",
                "explanation": "It is believed that when events are replayed in dreams, this helps to integrate memories into longer-term storage"
              },
              {
                "sourceId": "7",
                "sourceNumber": 7,
                "order": 2,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "It is now possible to tell what type of dream a dog is having.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "FALSE",
                "explanation": "We are quick to interpret the twitching limbs and quiet barks of sleeping dogs, but the truth is that we don't know if there is an internal experience of chasing rabbits that comes along with that"
              },
              {
                "sourceId": "8",
                "sourceNumber": 8,
                "order": 3,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "David Scheel's documentary was influential on other research into the sleeping patterns of octopuses.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "In 2019, while making a documentary, David Scheel of Alaska Pacific University in the USA housed an octopus named Heidi in a tank in his living room"
              },
              {
                "sourceId": "9",
                "sourceNumber": 9,
                "order": 4,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "While it was asleep, the octopus called Costello reacted as if it was hunting.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "FALSE",
                "explanation": "Costello, as the octopus was called, thrashed around, extended his mantle as if trying to make himself look bigger, and squirted ink as though he were being attacked by a predator "
              },
              {
                "sourceId": "10",
                "sourceNumber": 10,
                "order": 5,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Scheel believes more research into octopuses' dreams should be carried out.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "TRUE",
                "explanation": "The nightmare study is intriguing, says Scheel, but is only based on one animal. He argues that as well as outward behaviour, brain imaging is needed to show that the octopuses are replaying sequences of activities from their waking lives in dreams"
              },
              {
                "sourceId": "11",
                "sourceNumber": 11,
                "order": 6,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "We may soon be able to share the dreams of other human beings.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "FALSE",
                "explanation": "The trouble is that we will never be able to experience any animal's dreams. That goes for other humans' dreams too"
              },
              {
                "sourceId": "12",
                "sourceNumber": 12,
                "order": 7,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Hearing may be an important part of the dreams of some animals.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "For example, vision is the dominant sense for many humans, and so our dreams are heavily visual too. Dogs primarily navigate the world using smell while spiders rely much more on vibrations"
              },
              {
                "sourceId": "13",
                "sourceNumber": 13,
                "order": 8,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Interest in the reasons why humans dream has increased greatly in recent times.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "And if this is the case, it is possible that better understanding of these purposes might shed light on the true purpose of our own dreams"
              }
            ]
          }
        ]
      },
      {
        "sourceId": "cam-21-2-2",
        "title": "Mapungubwe",
        "contentHtml": "<h2>Mapungubwe</h2><p>Located in southern Africa just below the Limpopo River, the kingdom of Mapungubwe, flourished between the 11th and 13th century CE</p><p><strong>A</strong> Mapungubwe, which was one of the first states in southern Africa, was formed by Bantu-speaking peoples who were farmers. The area controlled by the rulers of Mapungubwe had at its heart a large sandstone plateau, which was easily defended due to its inaccessibility. As with other kingdoms in the region of southern Africa, cattle herding and other types of farming brought plenty of food and a surplus that could be traded for needed goods.</p><p>Archaeology has revealed extensive layers of bones and manure, which indicate that from the 9th century CE there were large cattle herds, the traditional source of political power in southern African communities. The archaeological record for the 10th century shows a marked increase in the number of domesticated cattle in the area as well as cotton cultivation and weaving, as indicated by abundant finds of spindle whorls.</p><p><strong>B</strong> The total population of Mapungubwe at its peak in the mid-13th century was around 5,000 people. The chief or king of Mapungubwe was likely the wealthiest individual in the society, and would have owned more cattle and precious materials than anyone else. The king and his advisers dwelt in a stone enclosure composed of stone walls and housing built on the highest level of the community's territory, a natural sandstone hill which is some 30 metres high and 100 metres in length.</p><p>Occupation on the hill dates from the 11th century and the entire complex was surrounded by a wooden palisade*, as indicated by postholes made in the rock. The rest of the community lived in mud and thatch housing spread out below the hill, although there is one stone structure here. This settlement, known as Babandyanalo, covers around 5 hectares (12.3 acres) and predates the hilltop structures.</p><p><strong>C</strong> The kings of Mapungubwe were buried at the top of the hill site in a demarcated area away from the dwellings, while other members of the community were buried at the surrounding valley level. A wooden staircase connected the two levels, the sockets for the steps being clearly visible in the sandstone cliff face. There were some grander residences dotted around the outskirts of Babandyanalo, and these probably belonged to male relatives of the king.</p><p>There are many other smaller but still impressive sites across the Mapungubwe plateau, which are located anywhere from 15 to 100 kilometres from the major hill site. Containing stone residences and walls, they likely belonged to local chiefs who acted as servants to the king.</p><p><strong>D</strong> The Mapungubwe plateau has a very high number of carnivore animal remains and ivory splinters, suggesting that the skins of these large animals and ivory elephant tusks were accumulated, probably for trade with coastal areas reached by the Limpopo River. The presence of glass beads, almost certainly from India, indicate there was trade of some sort with other states on the coast who, in turn, traded with merchants travelling from India by sea.</p><p>Mapungubwe also benefitted from locally-sourced copper and the gold trade as it passed from the kingdom of Great Zimbabwe (12-15th century), situated to the north of Mapungubwe, to the coastal city of Kosala. It is likely that trade links led to a strengthening of political authority in order to control and even monopolise these lucrative interregional connections.</p><p><strong>E</strong> Archaeological discoveries reveal that pottery was produced on a scale large enough to suggest the presence of professional potters, and is another indicator of the prosperity of Mapungubwe society. Archaeological finds include spherical vessels with short necks, beakers, and bowls, many of which have decorative stamps. There are also ceramic discs, and whistles.</p><p>In addition, cattle, sheep, and goat figurines, and small figures of highly stylised humans with elongated bodies and short limbs have been found. The figures may have been used in ceremonies as offerings to ancestors, but their precise function is not known. Other discoveries include small jewellery items made from locally sourced copper.</p><p><strong>F</strong> Beautifully decorated artefacts made of gold have also been found at Mapungubwe. A type of decoration, found nowhere else except Great Zimbabwe, involved the crafting of gold into small rectangular sheets and carving geometrical patterns into it. These sheets were then used to cover wooden objects (which have not survived) using small tacks, also made of gold.</p><p>One such object that has been discovered may have been a sceptre, while additional evidence of local gold-working is a rhinoceros figurine made from small hammered sheets, and thousands of small gold beads. These objects were all found at the royal burial site and date to c. 1150. They are the first known indicators that gold had an intrinsic value of its own (as opposed to that of a currency) in southern Africa.</p><p><strong>G</strong> The kingdom of Mapungubwe was already in decline by the late 13th century, probably because overpopulation placed too much stress on local resources, a situation that may have been brought to a crisis point by a series of droughts. Trade routes may also have shifted northwards. Certainly, the areas that now prospered were to the north, such as Great Zimbabwe.</p><p>* palisade: typically a row of closely placed, high vertical wooden or iron posts used as a means of defence</p>",
        "sectionNo": 2,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-2-2-14-19",
            "order": 1,
            "displayType": "matching-info",
            "instructionHtml": "<h3>Questions 14–19</h3><p>Reading Passage 2 has seven paragraphs, A-G.</p><p>Which paragraph contains the following information?</p>",
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
            "questions": [
              {
                "sourceId": "14",
                "sourceNumber": 14,
                "order": 1,
                "type": "matching",
                "displayType": "matching-info",
                "prompt": "a mention of the uncertainty regarding the purpose of certain objects",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "E",
                "explanation": "The figures may have been used in ceremonies as offerings to ancestors, but their precise function is not known"
              },
              {
                "sourceId": "15",
                "sourceNumber": 15,
                "order": 2,
                "type": "matching",
                "displayType": "matching-info",
                "prompt": "the likelihood that a climatic factor increased the problems Mapungubwe faced",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "G",
                "explanation": "The kingdom of Mapungubwe was already in decline by the late 13th century, probably because overpopulation placed too much stress on local resources, a situation that may have been brought to a crisis point by a series of droughts"
              },
              {
                "sourceId": "16",
                "sourceNumber": 16,
                "order": 3,
                "type": "matching",
                "displayType": "matching-info",
                "prompt": "a mention of the location where members of the king's family are thought to have lived",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "C",
                "explanation": "There were some grander residences dotted around the outskirts of Babandyanalo, and these probably belonged to male relatives of the king"
              },
              {
                "sourceId": "17",
                "sourceNumber": 17,
                "order": 4,
                "type": "matching",
                "displayType": "matching-info",
                "prompt": "a reference to people who brought goods by ship",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "D",
                "explanation": "The presence of glass beads, almost certainly from India, indicate there was trade of some sort with other States on the coast who, in turn, traded with merchants travelling from India by sea"
              },
              {
                "sourceId": "18",
                "sourceNumber": 18,
                "order": 5,
                "type": "matching",
                "displayType": "matching-info",
                "prompt": "an estimate of the size to which the Mapungubwe community grew",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "B",
                "explanation": "The total population of Mapungubwe at its peak in the mid-13th century was around 5,000 people"
              },
              {
                "sourceId": "19",
                "sourceNumber": 19,
                "order": 6,
                "type": "matching",
                "displayType": "matching-info",
                "prompt": "a mention of agricultural produce being exchanged for other items",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "cattle herding and other types of farming brought plenty of food and a surplus that could be traded for needed goods "
              }
            ]
          },
          {
            "key": "cam-21-2-2-20-21",
            "order": 2,
            "displayType": "multiple-choice-2",
            "instructionHtml": "<h3>Questions 20–21</h3><p>Choose TWO letters, A-E.</p>",
            "config": {
              "answerSlots": 2
            },
            "questions": [
              {
                "sourceId": "20",
                "sourceNumber": 20,
                "order": 1,
                "type": "mcq",
                "displayType": "multiple-choice-2",
                "prompt": "The archaeological record reveals information about gold and the kingdom of Mapungubwe. Which TWO pieces of information are mentioned by the writer?",
                "questionHtml": "",
                "options": [
                  "Not everyone in Mapungubwe used gold as a form of payment.",
                  "Items of gold were placed close to where Mapungubwe kings were buried.",
                  "The most valuable item discovered in Mapungubwe was a sceptre made of gold.",
                  "The way gold was decorated in Mapungubwe was also practised in another kingdom.",
                  "Working with gold was a respected occupation in the Mapungubwe community."
                ],
                "acceptedAnswers": [
                  "D"
                ],
                "answerKey": "B",
                "explanation": "A type of decoration, found nowhere else except Great Zimbabwe, involved the crafting of gold into small rectangular sheets and carving geometrical patterns into it These objects were all found at the royal burial site and date to c. 1150"
              },
              {
                "sourceId": "21",
                "sourceNumber": 21,
                "order": 2,
                "type": "mcq",
                "displayType": "multiple-choice-2",
                "prompt": "The archaeological record reveals information about gold and the kingdom of Mapungubwe. Which TWO pieces of information are mentioned by the writer?",
                "questionHtml": "",
                "options": [
                  "Not everyone in Mapungubwe used gold as a form of payment.",
                  "Items of gold were placed close to where Mapungubwe kings were buried.",
                  "The most valuable item discovered in Mapungubwe was a sceptre made of gold.",
                  "The way gold was decorated in Mapungubwe was also practised in another kingdom.",
                  "Working with gold was a respected occupation in the Mapungubwe community."
                ],
                "acceptedAnswers": [
                  "B"
                ],
                "answerKey": "D",
                "explanation": "A type of decoration, found nowhere else except Great Zimbabwe, involved the crafting of gold into small rectangular sheets and carving geometrical patterns into it These objects were all found at the royal burial site and date to c. 1150"
              }
            ]
          },
          {
            "key": "cam-21-2-2-22-26",
            "order": 3,
            "displayType": "summary-completion",
            "instructionHtml": "<h3>Questions 22–26</h3><p>Complete the summary below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "22",
                "sourceNumber": 22,
                "order": 1,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The Mapungubwe community's 22_______  is indicated by the amount of professionally made pottery discovered at the site. Many of these objects, such as beakers and bowls, are highly decorated and have been marked with stamps. Other finds include round ceramic objects, 23_______  and figures of various animals, as well as models of people with stretched 24_______  . It is possible that these had a role in ceremonies to honour 25_______  .",
                "questionHtml": "<p>Archaeological discoveries</p><p>The Mapungubwe community's 22_______  is indicated by the amount of professionally made pottery discovered at the site. Many of these objects, such as beakers and bowls, are highly decorated and have been marked with stamps. Other finds include round ceramic objects, 23_______  and figures of various animals, as well as models of people with stretched 24_______  . It is possible that these had a role in ceremonies to honour 25_______  .</p><p>In addition, pieces of 26_______  made from a local metal have been found at the site.</p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "prosperity",
                "explanation": "Archaeological discoveries reveal that pottery was produced on a scale large enough to suggest the presence of professional potters, and is another indicator of the prosperity of Mapungubwe society"
              },
              {
                "sourceId": "23",
                "sourceNumber": 23,
                "order": 2,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The Mapungubwe community's 22_______  is indicated by the amount of professionally made pottery discovered at the site. Many of these objects, such as beakers and bowls, are highly decorated and have been marked with stamps. Other finds include round ceramic objects, 23_______  and figures of various animals, as well as models of people with stretched 24_______  . It is possible that these had a role in ceremonies to honour 25_______  .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "whistles",
                "explanation": "There are also ceramic discs, and whistles"
              },
              {
                "sourceId": "24",
                "sourceNumber": 24,
                "order": 3,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The Mapungubwe community's 22_______  is indicated by the amount of professionally made pottery discovered at the site. Many of these objects, such as beakers and bowls, are highly decorated and have been marked with stamps. Other finds include round ceramic objects, 23_______  and figures of various animals, as well as models of people with stretched 24_______  . It is possible that these had a role in ceremonies to honour 25_______  .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "bodies",
                "explanation": "In addition, cattle, sheep, and goat figurines, and small figures of highly stylised humans with elongated bodies and short limbs have been found"
              },
              {
                "sourceId": "25",
                "sourceNumber": 25,
                "order": 4,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The Mapungubwe community's 22_______  is indicated by the amount of professionally made pottery discovered at the site. Many of these objects, such as beakers and bowls, are highly decorated and have been marked with stamps. Other finds include round ceramic objects, 23_______  and figures of various animals, as well as models of people with stretched 24_______  . It is possible that these had a role in ceremonies to honour 25_______  .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "ancestors",
                "explanation": "In addition, cattle, sheep, and goat figurines, and small figures of highly stylised humans with elongated bodies and short limbs have been found. The figures may have been used in ceremonies as offerings to ancestors, but their precise function is not known"
              },
              {
                "sourceId": "26",
                "sourceNumber": 26,
                "order": 5,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "In addition, pieces of 26_______  made from a local metal have been found at the site.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [
                  "jewelry"
                ],
                "answerKey": "jewellery",
                "explanation": "Other discoveries include small jewellery items made from locally sourced copper"
              }
            ]
          }
        ]
      },
      {
        "sourceId": "cam-21-2-3",
        "title": "Artificial Intelligence",
        "contentHtml": "<h2>Artificial Intelligence</h2><p>In many countries in the West, hysteria about the future of artificial intelligence (AI) is everywhere. There seems to be no shortage of sensationalist news about how AI could cure diseases, accelerate human innovation and improve human creativity. Just looking at the media headlines, you might think that we are already living in a future where AI has infiltrated every aspect of society.</p><p>While it is undeniable that AI has opened up a wealth of promising opportunities, it has also led to the emergence of a mindset that can be best described as 'AI solutionism'. This is the philosophy that, given enough data, machine learning algorithms can solve all of humanity's problems.</p><p>But, in fact, instead of supporting AI progress, this mindset actually jeopardises the value of machine intelligence by disregarding important AI safety principles and setting unrealistic expectations about what AI can really do for humanity.</p><p>In only a few years, AI solutionism has made its way from the technology evangelists' mouths in Silicon Valley in California to the minds of government officials and policymakers around the world. The pendulum has swung from the dystopian notion that AI will destroy humanity to the utopian belief that our algorithmic saviour is here.</p><p>We are now seeing governments pledge support to national AI initiatives and compete in a technological race to dominate the burgeoning machine-learning sector. While many politicians proclaim the transformative effects of the coming 'AI revolution', they fail to realise the complexity around deploying advanced machine learning systems in the real world.</p><p>One of the most promising varieties of AI technologies are neural networks. This form of machine learning is loosely modelled on the neuronal structure of the human brain, but on a much smaller scale. But what many politicians do not understand is that simply adding a neural network to a problem will not automatically mean that you'll find a solution. Similarly, adding a neural network to a system of government does not mean it will be instantaneously more inclusive or fair.</p><p>AI systems need a lot of data to function, but the public sector typically does not have the appropriate data infrastructure to support advanced machine learning. Most of the data remains stored in offline archives. The few digitised sources of data that exist tend to be buried in bureaucracy. More often than not, data is spread across different government departments that each require special permissions to be accessed.</p><p>Above all, the public sector typically lacks the human talent with the right technological capabilities to fully reap the benefits of machine intelligence.</p><p>For these reasons, the sensationalism over AI has attracted many critics. Stuart Russell, a professor of computer science at the University of California, Berkeley, has long advocated a more sensible and realistic approach that focuses on simple everyday applications of AI instead of the hypothetical takeover by super-intelligent robots.</p><p>Similarly, Rodney Brooks, professor of robotics at Massachusetts Institute of Technology, writes that 'almost all innovations in robotics and AI take far, far, longer to be really widely deployed than people in the field and outside the field imagine'.</p><p>One of the many difficulties in deploying machine learning systems is that AI is extremely susceptible to adversarial attacks. This means that a malicious AI can target another AI to make it behave in a certain way, such as forcing it to make wrong predictions. Many researchers have warned against the rolling out of AI without appropriate security standards and defence mechanisms. Still, AI security remains an often overlooked topic when machine learning systems are installed.</p><p>If we are to reap the benefits and minimise the potential harms of AI, we must start thinking about how machine learning can be meaningfully applied to specific areas of government, business and society. This means we need to have a discussion about AI ethics and the distrust that many people have towards machine learning.</p><p>Most importantly, we need to be aware of the limitations of AI and where people still need to take the lead. Instead of painting an unrealistic picture of the power of AI, it is important to take a step back and separate the actual technological capabilities of AI from fantasy.</p><p>The medical profession has also recognised the drawbacks to AI. The IBM Watson for Oncology programme was a piece of AI that was meant to help doctors treat cancer. Even though it was developed to deliver the best recommendations, human experts found it hard to trust the machine. As a result, the AI programme was abandoned in most hospitals where it was trialled.</p><p>Similar difficulties arose in the legal domain when algorithms were used in courts in the US to sentence criminals. An algorithm calculated risk assessment scores and advised judges on the sentencing. The system was found to amplify structural racial discrimination and was later abandoned.</p><p>There are some crucial lessons here for everyone aiming to boost investments in national AI programmes. These examples demonstrate that there is no AI solution for everything. Using AI simply for the sake of AI may not always be productive or useful, and not every issue is best addressed by applying machine intelligence to it. All solutions come with a cost and not everything that can be automated should be.</p>",
        "sectionNo": 3,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-2-3-27-29",
            "order": 1,
            "displayType": "multiple-choice",
            "instructionHtml": "<h3>Questions 27–29</h3><p>Choose the correct letter, A, B, C or D.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "27",
                "sourceNumber": 27,
                "order": 1,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "What is the writer doing in the first paragraph?",
                "questionHtml": "",
                "options": [
                  "predicting the future impact of AI",
                  "describing a public perception of AI",
                  "outlining some possible benefits of AI",
                  "highlighting the breadth of the influence of AI"
                ],
                "acceptedAnswers": [],
                "answerKey": "B",
                "explanation": "In many countries in the West, hysteria about the future of artificial intelligence (Al) is everywhere. There seems to be no shortage of sensationalist news about how Al could cure diseases, accelerate human innovation and improve human creativity. Just looking at the media headlines, you might think that we are already living in a future where Al has infiltrated every aspect of society"
              },
              {
                "sourceId": "28",
                "sourceNumber": 28,
                "order": 2,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "When discussing AI solutionism in the second paragraph, the writer",
                "questionHtml": "",
                "options": [
                  "points out a risk involved.",
                  "specifies its probable origins.",
                  "mentions its chief supporters.",
                  "weighs up some pros and cons."
                ],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "But, in fact, instead of supporting Al progress, this mindset actually jeopardises the value of machine intelligence by disregarding important Al safety principles and setting unrealistic expectations about what AI can really do for humanity"
              },
              {
                "sourceId": "29",
                "sourceNumber": 29,
                "order": 3,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "In the fourth paragraph, the writer suggests that many politicians may",
                "questionHtml": "",
                "options": [
                  "have failed to appreciate the true potential of AI initiatives.",
                  "have misunderstood the function of the machine-learning sector.",
                  "be unaware of the challenges of implementing national AI initiatives.",
                  "be too keen to enter the race to dominate the machine-learning sector."
                ],
                "acceptedAnswers": [],
                "answerKey": "C",
                "explanation": "While many politicians proclaim the transformative effects of the coming 'Al revolution', they fail to realise the complexity around deploying advanced machine learning systems in the real world"
              }
            ]
          },
          {
            "key": "cam-21-2-3-30-35",
            "order": 2,
            "displayType": "summary-completion",
            "instructionHtml": "<h3>Questions 30–35</h3><p>Complete the summary using the list of words, A-I, below.</p>",
            "config": {
              "phraseOptions": [
                "reliability",
                "funding",
                "skills",
                "prejudices",
                "computers",
                "equality",
                "framework",
                "confidentiality",
                "approval"
              ]
            },
            "questions": [
              {
                "sourceId": "30",
                "sourceNumber": 30,
                "order": 1,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "Neural networks are a promising area of AI technology for governments. However, many politicians overestimate their capabilities, believing that the mere addition of a neural network will produce solutions and promote 30_______  .",
                "questionHtml": "<p>AI in government, medicine and the law</p><p>Neural networks are a promising area of AI technology for governments. However, many politicians overestimate their capabilities, believing that the mere addition of a neural network will produce solutions and promote 30_______  .</p><p>Most public sector organisations have not set up the necessary 31_______  to manage the huge amount of data required to enable AI to function. Complex bureaucracy is another issue, as each person involved needs 32_______  to access the relevant data, which is often spread across different departments. But the main problem is that few public sector employees have the 33_______  to take full advantage of machine intelligence.</p><p>The medical profession experimented with an AI programme, but their experts had little faith in its 34_______  , and the programme was abandoned. US courts also abandoned the use of algorithms when it was found that these reflected and magnified the existing 35_______  within the legal profession.</p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "F",
                "explanation": "Similarly, adding a neural network to a system of government does not mean it will be instantaneously more inclusive or fair"
              },
              {
                "sourceId": "31",
                "sourceNumber": 31,
                "order": 2,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "Most public sector organisations have not set up the necessary 31_______  to manage the huge amount of data required to enable AI to function. Complex bureaucracy is another issue, as each person involved needs 32_______  to access the relevant data, which is often spread across different departments. But the main problem is that few public sector employees have the 33_______  to take full advantage of machine intelligence.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "G",
                "explanation": "Al systems need a lot of data to function, but the public sector typically does not have the appropriate data infrastructure to support advanced machine learning"
              },
              {
                "sourceId": "32",
                "sourceNumber": 32,
                "order": 3,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "Most public sector organisations have not set up the necessary 31_______  to manage the huge amount of data required to enable AI to function. Complex bureaucracy is another issue, as each person involved needs 32_______  to access the relevant data, which is often spread across different departments. But the main problem is that few public sector employees have the 33_______  to take full advantage of machine intelligence.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "I",
                "explanation": "More often than not, data is spread across different government departments that each require special permissions to be accessed"
              },
              {
                "sourceId": "33",
                "sourceNumber": 33,
                "order": 4,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "Most public sector organisations have not set up the necessary 31_______  to manage the huge amount of data required to enable AI to function. Complex bureaucracy is another issue, as each person involved needs 32_______  to access the relevant data, which is often spread across different departments. But the main problem is that few public sector employees have the 33_______  to take full advantage of machine intelligence.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "C",
                "explanation": "Above all, the public sector typically lacks the human talent with the right technological capabilities to fully reap the benefits of machine intelligence"
              },
              {
                "sourceId": "34",
                "sourceNumber": 34,
                "order": 5,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The medical profession experimented with an AI programme, but their experts had little faith in its 34_______  , and the programme was abandoned. US courts also abandoned the use of algorithms when it was found that these reflected and magnified the existing 35_______  within the legal profession.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "The IBM Watson for Oncology programme was a piece of Al that was meant to help doctors treat cancer. Even though it was developed to deliver the best recommendations, human experts found it hard to trust the machine. As a result, the Al programme was abandoned in most hospitals where it was trialled"
              },
              {
                "sourceId": "35",
                "sourceNumber": 35,
                "order": 6,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The medical profession experimented with an AI programme, but their experts had little faith in its 34_______  , and the programme was abandoned. US courts also abandoned the use of algorithms when it was found that these reflected and magnified the existing 35_______  within the legal profession.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "D",
                "explanation": "The system was found to amplify structural racial discrimination and was later abandoned"
              }
            ]
          },
          {
            "key": "cam-21-2-3-36-39",
            "order": 3,
            "displayType": "ynng",
            "instructionHtml": "<h3>Questions 36–39</h3><p>Do the following statements agree with the claims of the writer in Reading Passage 3?</p><p>In boxes 36-39 on your answer sheet, write</p><p>YES if the statement agrees with the claims of the writer</p><p>NO if the statement contradicts the claims of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "36",
                "sourceNumber": 36,
                "order": 1,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "Stuart Russell's proposals regarding the use of AI are impractical.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NO",
                "explanation": "Stuart Russell, a professor of computer science at the University of California, Berkeley, has long advocated a more sensible and realistic approach that focuses on simple everyday applications of Al instead of the hypothetical takeover by super-intelligent robots"
              },
              {
                "sourceId": "37",
                "sourceNumber": 37,
                "order": 2,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "Rodney Brooks' view has attracted unfair criticism from supporters of AI.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "Similarly, Rodney Brooks, professor of robotics at Massachusetts Institute of Technology, writes that 'almost all innovations in robotics and Al take far, far, longer to be really widely deployed than people in the field and outside the field imagine'"
              },
              {
                "sourceId": "38",
                "sourceNumber": 38,
                "order": 3,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "Nowadays, the need to protect AI systems is always taken into account when they are set up.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NO",
                "explanation": "Still, Al security remains an often overlooked topic when machine learning systems are installed"
              },
              {
                "sourceId": "39",
                "sourceNumber": 39,
                "order": 4,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "In order to benefit from AI and minimise the harms, we have to explore people's concerns about its use.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "YES",
                "explanation": "If we are to reap the benefits and minimise the potential harms of Al, we must start thinking about how machine learning can be meaningfully applied to specific areas of government, business and society. This means we need to have a discussion about Al ethics and the distrust that many people have towards machine learning"
              }
            ]
          },
          {
            "key": "cam-21-2-3-40-40",
            "order": 4,
            "displayType": "multiple-choice",
            "instructionHtml": "<h3>Questions 40</h3><p>Choose the correct letter, A, B, C or D.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "40",
                "sourceNumber": 40,
                "order": 1,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "What would be a suitable subtitle for Reading Passage 3?",
                "questionHtml": "",
                "options": [
                  "How to make the most of what AI has to offer",
                  "Why AI may not be the answer to our problems",
                  "Why governments should not invest in AI systems",
                  "How AI could improve the efficiency of the public sector"
                ],
                "acceptedAnswers": [],
                "answerKey": "B",
                "explanation": "These examples demonstrate that there is no Al solution for everything. Using Al simply for the sake of Al may not always be productive or useful, and not every issue is best addressed by applying machine intelligence to it"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cam-21-3",
    "slug": "cam-21-3",
    "skill": "reading",
    "title": "Cambridge 21 - Test 3",
    "level": "Band 6.0-9.0",
    "series": "Cambridge",
    "seriesNo": 21,
    "durationMinutes": 60,
    "testType": "academic",
    "description": "3 passages · 40 questions",
    "questionCount": 40,
    "sortOrder": 51,
    "passages": [
      {
        "sourceId": "cam-21-3-1",
        "title": "Saving the saiga",
        "contentHtml": "<h2>Saving the saiga</h2><p>The saiga, a species of antelope native to Central Asia, once roamed the vast grasslands of this region in enormous herds, many millions strong. Regrettably, such spectacular sights are a thing of the past. Today, the saiga is largely confined to a single country: Kazakhstan. This country is estimated to be home to well over 90% of the global saiga population, with Russia, Mongolia and Uzbekistan accounting for the rest.</p><p>The saiga is perfectly adapted to the tough conditions of the remote wilderness of the steppes of Central Asia. One such adaptation is its bizarre bulbous nose, which enables the animal to survive the extreme seasonal temperature swings of the region. The swollen nostrils of the nose serve several purposes: they filter out dust and cool the blood during hot, dry summers, and they warm the cold air before it enters the saiga's lungs in winter.</p><p>Other seasonal adaptations include a heavy winter coat that the saiga sheds when the weather warms up.</p><p>Despite these superb adaptations to harsh conditions, the saiga has no defence against the threats posed by humans. It was almost driven to extinction by hunters in the 19th century. Legal protection ensured its survival for a while, and numbers steadily recovered throughout most of the 20th century. But the respite was only temporary.</p><p>In the ten years following the break-up of the former Soviet Union in 1991, over 95% of the global population was lost - one of the fastest examples of species loss ever recorded for a mammal.</p><p>The dramatic decline during this decade was due to illegal poaching on an industrial scale. Male saiga are a particular target, because their horns are highly prized by traditional medicine practitioners. Poaching reached epidemic levels after misguided conservationists tried to relieve the pressure on threatened African rhinos by actively encouraging the use of saiga horns in traditional medicine as an alternative to those of rhinos.</p><p>Male saiga were almost wiped out, leading to a population crash from which the species has been struggling to recover ever since.</p><p>Another threat to the survival of the saiga is loss of habitat, as a result of agricultural expansion and human settlement. Physical barriers such as railways, pipelines and fences can block the seasonal migration routes of this transboundary species. In the worst cases, herds may starve to death after being trapped.</p><p>Then there is the risk of disease. In 2015, an outbreak of haemorrhagic septicaemia, caused by the normally harmless bacterium Pasteurella multocida, killed over 75% of the global adult saiga population in just three weeks. In 2017, 60% of the Mongolian saiga population - a subspecies found nowhere else in the world - was killed by a virus that spilled over from livestock. These so-called mass mortality events represent an unpredictable and serious threat to the species.</p><p>Climate change poses a further threat. Although well adapted to cold winters and hot summers, saiga struggle to cope with temperature extremes and unpredictable fluctuations in climate. Experts believe that unusually warm weather may have triggered the 2015 mass mortality event. The steppe region has also become increasingly arid in recent years, and many of the smaller streams that the species normally depended on have dried up and vanished.</p><p>Recent efforts to save the saiga have been spearheaded by the Altyn Dala Conservation Initiative, a project led by the Association for the Conservation of Biodiversity of Kazakhstan, working in partnership with the Kazakh government's Committee for Forestry and Wildlife, Frankfurt Zoological Society and Fauna and Flora, an international conservation charity.</p><p>Its purpose is to protect and restore Kazakhstan's steppe, semi-desert and desert ecosystems and the many species they support, including the critically endangered saiga. In 2022 the United Nations recognised the initiative as a World Restoration Flagship project, an accolade reserved for the ten best examples of large-scale ecosystem restoration around the globe.</p><p>So, how many saiga are there now? By 2000, the global saiga population had hit an all-time low of just 21,000 individuals. There was some recovery in the first decade of the new millennium but this was then crushed by devastating mass mortality events that saw the loss of hundreds of thousands of the species. But thanks to the intervention of the Altyn Dala Conservation Initiative, the most recent episodes in the ongoing story of the saiga have been relatively uplifting.</p><p>Three years ago, the Ustyurt Plateau population in Kazakhstan experienced its largest mass birth of saiga calves in many years. An aerial census two years ago recorded an estimated 842,000 saiga across Kazakhstan as a whole, and according to an aerial survey earlier this year, the saiga population in Kazakhstan now exceeds 1.9 million. The world's strangest-looking antelope remains critically endangered, but the direction of travel is positive.</p>",
        "sectionNo": 1,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-3-1-1-7",
            "order": 1,
            "displayType": "note-completion",
            "instructionHtml": "<h3>Questions 1–7</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "1",
                "sourceNumber": 1,
                "order": 1,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "- keep 1_______  out",
                "questionHtml": "<p>The saiga</p><p>Adaptations</p><p>• has a large bulbous nose with swollen nostrils that</p><p>- keep 1_______  out</p><p>- lower the temperature of its 2_______  in summer</p><p>- warm the air entering its lungs in winter</p><p>• grows a thick 3_______  in winter, which it loses in spring</p><p>Reasons for population decline</p><p>• poaching, especially for the 4_______  of male saiga</p><p>• expansion of farms and settlements, causing</p><p>- reduction in the size of the saiga's 5_______ .</p><p>- loss of access to the 6_______  which they use for migration</p><p>• various forms of disease, leading to mass mortality events</p><p>• climate change, causing the disappearance of 7_______  which the saiga relied on</p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "dust",
                "explanation": "The swollen nostrils of the nose serve several purposes: they filter out dust and cool the blood during hot, dry summers, and they warm the cold air before it enters the saiga’s lungs in winter"
              },
              {
                "sourceId": "2",
                "sourceNumber": 2,
                "order": 2,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "- lower the temperature of its 2_______  in summer",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "blood",
                "explanation": "The swollen nostrils of the nose serve several purposes: they filter out dust and cool the blood during hot, dry summers, and they warm the cold air before it enters the saiga’s lungs in winter"
              },
              {
                "sourceId": "3",
                "sourceNumber": 3,
                "order": 3,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* grows a thick 3_______  in winter, which it loses in spring",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "coat",
                "explanation": "Other seasonal adaptations include a heavy winter coat that the saiga sheds when the weather warms up"
              },
              {
                "sourceId": "4",
                "sourceNumber": 4,
                "order": 4,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* poaching, especially for the 4_______  of male saiga",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "horns",
                "explanation": "Male saiga are a particular target, because their horns are highly prized by traditional medicine practitioners"
              },
              {
                "sourceId": "5",
                "sourceNumber": 5,
                "order": 5,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "- reduction in the size of the saiga's 5_______ .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "habitat",
                "explanation": "Another threat to the survival of the saiga is loss of habitat, as a result of agricultural expansion and human settlement"
              },
              {
                "sourceId": "6",
                "sourceNumber": 6,
                "order": 6,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "- loss of access to the 6_______  which they use for migration",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "routes",
                "explanation": "Physical barriers such as railways, pipelines and fences can block the seasonal migration routes of this transboundary species"
              },
              {
                "sourceId": "7",
                "sourceNumber": 7,
                "order": 7,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* climate change, causing the disappearance of 7_______  which the saiga relied on",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "streams",
                "explanation": "The steppe region has also become increasingly arid in recent years, and many of the smaller streams that the species normally depended on have dried up and vanished"
              }
            ]
          },
          {
            "key": "cam-21-3-1-8-13",
            "order": 2,
            "displayType": "tfng",
            "instructionHtml": "<h3>Questions 8–13</h3><p>Do the following statements agree with the information given in Reading Passage 1?</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "8",
                "sourceNumber": 8,
                "order": 1,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Today, numbers of saiga are distributed evenly across four nations in Central Asia: Kazakhstan, Russia, Mongolia and Uzbekistan.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "FALSE",
                "explanation": "This country is estimated to be home to well over 90% of the global saiga population, with Russia, Mongolia and Uzbekistan accounting for the rest"
              },
              {
                "sourceId": "9",
                "sourceNumber": 9,
                "order": 2,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "For most of the 20th century, the population of saiga were falling.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "FALSE",
                "explanation": "Legal protection ensured its survival for a while, and numbers steadily recovered throughout most of the 20th century"
              },
              {
                "sourceId": "10",
                "sourceNumber": 10,
                "order": 3,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Efforts to protect rhinos in Africa had a significant effect on saiga populations.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "TRUE",
                "explanation": "Poaching reached epidemic levels after misguided conservationists tried to relieve the pressure on threatened African rhinos by actively encouraging the use of saiga horns in traditional medicine as an alternative to those of rhinos. Male saiga were almost wiped out, leading to a population crash from which the species has been struggling to recover ever since"
              },
              {
                "sourceId": "11",
                "sourceNumber": 11,
                "order": 4,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Unpredictable fluctuations in climate are threatening the wildlife of Central Asia more than in other parts of the world.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "Climate change poses a further threat. Although well adapted to cold winters and hot summers, saiga struggle to cope with temperature extremes and unpredictable fluctuations in climate"
              },
              {
                "sourceId": "12",
                "sourceNumber": 12,
                "order": 5,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "The Altyn Dala Conservation Initiative was formed for the benefit of a number of different animals.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "TRUE",
                "explanation": "Its purpose is to protect and restore Kazakhstan’s steppe, semi-desert and desert ecosystems and the many species they support, including the critically endangered saiga"
              },
              {
                "sourceId": "13",
                "sourceNumber": 13,
                "order": 6,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "The Altyn Dala Conservation Initiative's recognition as a World Restoration Flagship project attracted additional international funding for the scheme.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "In 2022 the United Nations recognised the initiative as a World Restoration Flagship project, an accolade reserved for the ten best examples of large- scale ecosystem restoration around the globe"
              }
            ]
          }
        ]
      },
      {
        "sourceId": "cam-21-3-2",
        "title": "The problems of getting around the city of Dar es Salaam",
        "contentHtml": "<h2>The problems of getting around the city of Dar es Salaam</h2><p>Dar es Salaam in Tanzania is one of the fastest growing cities in Africa. Its population has increased eightfold since 1980 and swells by half a million people every year. United Nations projections anticipate it will become a megacity within seven years as its population passes 10 million, reaching 13.4 million by 2035. Daniel Hoornweg for the Global Cities Institute forecasts the city could be home to an incredible 73.7 million people by 2100.</p><p>Today, four out of five of its people live in single-storey informal settlements on the spreading edges of the city, where the journey to and from the centre regularly takes over two hours. It can be longer if rain turns the dirt roads to mud.</p><p>Even in the middle of the day, traffic frequently slows to a stop without warning. It is not unusual for cars and minibuses to queue for 20 minutes at a key intersection. A single suburban rail line serves residents in a few areas to the south but is tiny in the context of the wider city. Outside the centre many rely on boda boda (motorbike taxis) to navigate the narrow side streets and potholed mud roads that make up much of the metropolis. Their safety record is scandalous.</p><p>Dar es Salaam's reliance on four arterial roads into the city is a legacy of the colonial government that planned the city at the start of the 20th century to cater for a population of 35,000. Most of the current growth is made up of young people arriving from the countryside to find work, and as the population has exploded, Dar es Salaam has grown around those four highways. Nearly all the expansion is happening on the periphery, and nearly all takes place informally without any agreed strategy.</p><p>But Dar es Salaam is pinning its hopes on a solution that could offer a different model for Africa's megacities, giving them an alternative to a future controlled by the private car. Unlike many cities on the continent, Dar es Salaam isn't trying to build a metro. It has chosen a less exciting but cheaper and more achievable method: the bus.</p><p>The DART bus rapid transit (BRT) system runs on bus lanes separated from other traffic, mostly in the middle of the road to reduce stoppages. Ticket purchase and control takes place at stations prior to boarding and the buses are step-free, which means the entire route is accessible to people using wheelchairs or who are travelling with baby buggies.</p><p>'The new buses are much, much better,' says Paulas George, a young IT worker. He takes the bus every day and it has cut his journey time by two-thirds. He says it is not perfect, though, complaining that drivers often refuse to turn on the air conditioning to save fuel.</p><p>That is not the only problem. A shortage of buses after a serious flood at the main depot during the rainy season means the system is carrying 200,000 people a day - half the expected capacity. Smartcards can't be used as the mechanical readers aren't working either, forcing passengers to buy individual paper tickets for every journey. Each is printed with a scannable QR code, but there are no scanners. Staff stand by the gates and tear tickets as people enter.</p><p>As a result, queues are considerable at peak times.</p><p>Morogoro Road to the north-west of the city was phase I of the BRT project. Phases II and III will install bus lanes along Nyerere Road to the south-west and Kilwa Road to the south. Construction on both routes is due to start imminently. Phase IV, towards Bagamoyo in the north, is in the preliminary design stage.</p><p>'Much of the city will have access to a world-class transport system within the space of a few years,' says Chris Kost, the Africa director of ITDP (the Institute for Transportation and Development Policy). All phases are being planned to high standards and, once complete, a third of city residents will be within a short walk of the BRT network.</p><p>The ITDP regrets Africa's obsession with metros. 'With a metro, an international firm will often just parachute in its own system,' says Kost. 'Bus rapid transit allows existing stakeholders to get involved. That's what we did in Dar es Salaam and what we're planning in Nairobi, where the bus bodies will be built in the city and local operators will look after tickets, fare collection and IT ...Bus rapid transit has been transformational for Dar es Salaam.</p><p>For millions of people in African cities, this is their best hope of ever being connected.'</p>",
        "sectionNo": 2,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-3-2-14-18",
            "order": 1,
            "displayType": "tfng",
            "instructionHtml": "<h3>Questions 14–18</h3><p>Do the following statements agree with the information given in Reading Passage 2?</p><p>TRUE if the statement agrees with the information</p><p>FALSE if the statement contradicts the information</p><p>NOT GIVEN if there is no information on this</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "14",
                "sourceNumber": 14,
                "order": 1,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "The population of Dar es Salaam is rising more rapidly than was previously predicted.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "United Nations projections anticipate it will become a megacity within seven years as its population passes 10 million, reaching 13.4 million by 2035. Daniel Hoornweg for the Global Cities Institute forecasts the city could be home to an incredible 73.7 million people by 2100"
              },
              {
                "sourceId": "15",
                "sourceNumber": 15,
                "order": 2,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Most of the residents of Dar es Salaam live in high-rise blocks on the edge of the city.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "FALSE",
                "explanation": "Today, four out of five of its people live in single-storey informal settlements on the spreading edges of the city"
              },
              {
                "sourceId": "16",
                "sourceNumber": 16,
                "order": 3,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Residents have been consulted about their views on the suburban rail line in Dar es Salaam.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "A single suburban rail line serves residents in a few areas to the south but is tiny in the context of the wider city"
              },
              {
                "sourceId": "17",
                "sourceNumber": 17,
                "order": 4,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "The majority of the present residential development in Dar es Salaam is unplanned.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "TRUE",
                "explanation": "Nearly all the expansion is happening on the periphery, and nearly all takes place informally without any agreed strategy"
              },
              {
                "sourceId": "18",
                "sourceNumber": 18,
                "order": 5,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Dar es Salaam's authorities have decided to follow the public transport plan adopted by a large number of African cities.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "FALSE",
                "explanation": "Unlike many cities on the continent, Dar es Salaam isn’t trying to build a metro. It has chosen a less exciting but cheaper and more achievable method: the bus"
              }
            ]
          },
          {
            "key": "cam-21-3-2-19-26",
            "order": 2,
            "displayType": "note-completion",
            "instructionHtml": "<h3>Questions 19–26</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "19",
                "sourceNumber": 19,
                "order": 1,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* the buses use designated 19_______  to cut down on delays",
                "questionHtml": "<p>Dar es Salaam's DART Bus Rapid Transit system</p><p>Features</p><p>• the buses use designated 19_______  to cut down on delays</p><p>• passengers pay fares before 20_______ </p><p>• passengers in 21_______  can use every part of the system</p><p>Problems</p><p>• the temperature control is sometimes not activated in order to reduce 22_______  use</p><p>• insufficient number of vehicles are available due to the effects of a severe 23_______ </p><p>• passengers are unable to use 24_______  because some equipment is out of action</p><p>• tickets have to be checked manually at station 25_______ </p><p>• 26_______  frequently build up during rush hours</p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "lanes",
                "explanation": "The DART bus rapid transit (BRT) system runs on bus lanes separated from other traffic, mostly in the middle of the road to reduce stoppages"
              },
              {
                "sourceId": "20",
                "sourceNumber": 20,
                "order": 2,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* passengers pay fares before 20_______ ",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "boarding",
                "explanation": "Ticket purchase and control takes place at stations prior to boarding and the buses are step-free, which means the entire route is accessible to people using wheelchairs or who are travelling with baby buggies"
              },
              {
                "sourceId": "21",
                "sourceNumber": 21,
                "order": 3,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* passengers in 21_______  can use every part of the system",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "wheelchairs",
                "explanation": "Ticket purchase and control takes place at stations prior to boarding and the buses are step-free, which means the entire route is accessible to people using wheelchairs or who are travelling with baby buggies"
              },
              {
                "sourceId": "22",
                "sourceNumber": 22,
                "order": 4,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* the temperature control is sometimes not activated in order to reduce 22_______  use",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "fuel",
                "explanation": "He says it is not perfect, though, complaining that drivers often refuse to turn on the air conditioning to save fuel"
              },
              {
                "sourceId": "23",
                "sourceNumber": 23,
                "order": 5,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* insufficient number of vehicles are available due to the effects of a severe 23_______ ",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "flood",
                "explanation": "A shortage of buses after a serious flood at the main depot during the rainy season means the system is carrying 200,000 people a day – half the expected capacity"
              },
              {
                "sourceId": "24",
                "sourceNumber": 24,
                "order": 6,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* passengers are unable to use 24_______  because some equipment is out of action",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "smartcards",
                "explanation": "Smartcards can’t be used as the mechanical readers aren’t working either, forcing passengers to buy individual paper tickets for every journey"
              },
              {
                "sourceId": "25",
                "sourceNumber": 25,
                "order": 7,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* tickets have to be checked manually at station 25_______ ",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "gates",
                "explanation": "Staff stand by the gates and tear tickets as people enter"
              },
              {
                "sourceId": "26",
                "sourceNumber": 26,
                "order": 8,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* 26_______  frequently build up during rush hours",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "queues",
                "explanation": "As a result, queues are considerable at peak times"
              }
            ]
          }
        ]
      },
      {
        "sourceId": "cam-21-3-3",
        "title": "Rethinking the Past",
        "contentHtml": "<h2>Rethinking the Past</h2><p>It is by now a truism that the story of human evolution is being rethought. Discoveries have come thick and fast over the last decade or so, and these have forced us to rethink many crucial points, such as how old our species is - about 300,000 years old as opposed to 200,000 - and what extinct hominins, such as our cousins the Neanderthals, were really like. But because there are so many species and eras involved, it's hard to discern the common threads linking them.</p><p>However, I do think it's possible to draw out some overall messages from the blizzard of archaeological finds in recent years. Two things stand out to me. One is the growing evidence that many supposedly 'advanced' behaviours, such as architecture and art, can be traced much further back in time than we thought, often to hominin species that existed before modern humans.</p><p>And the other is that we have badly misunderstood gender roles in prehistoric societies, imposing patriarchal values onto cultures that had very different ideas about how women should behave.</p><p>Let's start with architecture. At Kalambo Falls in Zambia, researchers found buried logs that had been shaped with stone tools so that they interlocked. They seem to have once been part of a larger structure, perhaps a building. This would be unsurprising if they weren't 476,000 years old. That's almost 200,000 years before our species, Homo sapiens, evolved. Extinct hominins also managed to settle in extreme places.</p><p>For instance, we now know that extinct hominins such as the Denisovans lived on the frozen heights of high-altitude regions 200,000 years ago - upending the old notion that such environments were only settled by modern humans around 3,600 years ago.</p><p>Art also seems to have been invented by older hominins. We have had evidence for a long time now that Neanderthals painted on cave walls. Even earlier species, such as Homo erectus, may also have made art, for example by engraving patterns on shells. By far the most contentious claim in this area is that Homo naledi made art. H. naledi lived around 250,000 years ago, making it a contemporary of our species.</p><p>However, it had quite a small brain, typical of older hominins - and was therefore, according to palaeoanthropological dogma, incapable of complex behaviours. Nevertheless, in the Rising Star cave system in South Africa where the H. naledi remains were found, researchers have found what seem to be etchings - resembling rudimentary artwork - on the cave walls, though these have yet to be firmly dated.</p><p>To say these claims about H. naledi are controversial is to understate the situation. Many experts say the evidence presented so far is completely inadequate to support them. The dispute has only been heightened by the way the results were released, in a non-traditional journal that publishes peer reviews publicly alongside the paper. My views on the H. naledi controversy are complicated. I do think more evidence is needed: in particular with regard to the dating of the etchings.</p><p>At the same time, I think the species' small brains are a distraction. Palaeoanthropologists got fixated on brain size because it was what they could see: if what you have is skeletons, then all you know about brains are their shapes and sizes. But other properties, such as the brain's internal wiring, are surely equally important and may explain how a species like H. naledi might have been capable of complex behaviours, despite their small brains.</p><p>In a sense, we shouldn't be surprised that so many of these behaviours had their origins in older, extinct hominins. Evolution usually works by incremental steps and so does technology. The first birds weren't great at flying, and the first mobile phones weren't great at, well, anything really. The idea that there was a sudden explosion of intelligence and creativity at some point in our evolution isn't inherently ridiculous: sometimes a system hits a tipping point and undergoes runaway change.</p><p>But there was never that much evidence that human evolution worked this way. Instead, it seems the Neanderthals and many others all walked so we could run.</p><p>One way or another, the H. naledi story is going to be an example of letting our preconceptions get in the way of the evidence. The same is true for our ideas about gender in prehistory. Archaeology was invented by individuals with now unfashionably patriarchal views about gender, and those notions fed into their research. Today's researchers are trying to unpick this stuff, and there have been some significant steps in recent years.</p><p>Perhaps the most dramatic was the demolition of 'Man the Hunter'. This was the idea, promoted for decades, that in most prehistoric societies the men went out to hunt and the women looked after the home. However, a meta-analysis published in June 2023 compiled data on several dozen foraging societies and found women hunted in 80 per cent of them. In line with this, it emerged that an ancient spear-throwing tool called an atlatl enables women to launch projectiles at the same speed as men.</p><p>We have also seen growing evidence of women occupying positions of authority in ancient societies. The Viking queen Thyra may have helped unify Denmark in the 900s. Going further back, an Iberian leader from around 4000 years ago turned out to be female, not male as many had assumed, when proteins in her teeth were analysed.</p><p>It seems that the more we find out about past societies, the more our preconceptions about the ways society 'has to be' turn out to be wrong. Inequality, authoritarianism and patriarchy aren't inevitable. They're choices, and prehistory shows us that we can choose differently.</p>",
        "sectionNo": 3,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-3-3-27-30",
            "order": 1,
            "displayType": "multiple-choice",
            "instructionHtml": "<h3>Questions 27–30</h3><p>Choose the correct letter, A, B, C or D.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "27",
                "sourceNumber": 27,
                "order": 1,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "What is the writer doing in the second paragraph?",
                "questionHtml": "",
                "options": [
                  "pinpointing some key changes in our understanding of prehistory",
                  "outlining some aspects of prehistory which are still poorly understood",
                  "summarising some attitudes towards recent archaeological revelations",
                  "giving an overview of some current disagreements among archaeologists"
                ],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "Two things stand out to me. One is the growing evidence that many supposedly ‘advanced’ behaviours, such as architecture and art, can be traced much further back in time than we thought, often to hominin species that existed before modern humans. And the other is that we have badly misunderstood gender roles in prehistoric societies, imposing patriarchal values onto cultures that had very different ideas about how women should behave"
              },
              {
                "sourceId": "28",
                "sourceNumber": 28,
                "order": 2,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "In the sixth paragraph, the writer mentions mobile phones to make the point that",
                "questionHtml": "",
                "options": [
                  "most developments happen in a gradual way.",
                  "innovation can come from a variety of sources.",
                  "not all technological advancements are positive.",
                  "the path of evolution can often be unpredictable."
                ],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "Evolution usually works by incremental steps and so does technology. The first birds weren’t great at flying, and the first mobile phones weren’t great at, well, anything really"
              },
              {
                "sourceId": "29",
                "sourceNumber": 29,
                "order": 3,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "In the seventh paragraph, the phrase 'unpick this stuff' refers to the task of",
                "questionHtml": "",
                "options": [
                  "assessing the impact of certain recent research findings.",
                  "questioning the authenticity of evidence used in earlier research.",
                  "conducting research into how prehistoric societies were organised.",
                  "reevaluating research influenced by outdated beliefs about society."
                ],
                "acceptedAnswers": [],
                "answerKey": "D",
                "explanation": "Archaeology was invented by individuals with now unfashionably patriarchal views about gender, and those notions fed into their research. Today’s researchers are trying to unpick this stuff, and there have been some significant steps in recent years"
              },
              {
                "sourceId": "30",
                "sourceNumber": 30,
                "order": 4,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "What does the writer suggest in the final paragraph?",
                "questionHtml": "",
                "options": [
                  "Studying past societies could help us create a fairer society today.",
                  "We should not judge past societies by the standards of modern society.",
                  "We still have much to learn about how societies have evolved over history.",
                  "There is more than one way to interpret evidence about societies in prehistoric times."
                ],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "Inequality, authoritarianism and patriarchy aren’t inevitable. They’re choices, and prehistory shows us that we can choose differently"
              }
            ]
          },
          {
            "key": "cam-21-3-3-31-34",
            "order": 2,
            "displayType": "sentence-ending",
            "instructionHtml": "<h3>Questions 31–34</h3><p>Complete each sentence with the correct ending, A-F, below.</p>",
            "config": {
              "sentenceEndings": [
                "Homo sapiens emerged at an earlier point in time than experts previously believed.",
                "previous assumptions about who had power in the prehistoric world were inaccurate.",
                "gender roles in extinct hominin species were different from those in Homo sapiens societies.",
                "experts may have been mistaken about who looked for food in early human communities.",
                "Homo sapiens was probably not the only species capable of sophisticated workmanship.",
                "other species managed to survive in harsh environments before the arrival of Homo sapiens."
              ]
            },
            "questions": [
              {
                "sourceId": "31",
                "sourceNumber": 31,
                "order": 1,
                "type": "matching",
                "displayType": "sentence-ending",
                "prompt": "• The findings at Kalambo Falls revealed that 31_______ ",
                "questionHtml": "<p>• The findings at Kalambo Falls revealed that 31_______ </p><p>• Evidence from high-altitude regions suggests that 32_______ </p><p>• An academic publication from June 2023 shows that 33_______ </p><p>• Analysis of a 4000-year-old Iberian leader indicates that 34_______ </p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "E",
                "explanation": "At Kalambo Falls in Zambia, researchers found buried logs that had been shaped with stone tools so that they interlocked. They seem to have once been part of a larger structure, perhaps a building. This would be unsurprising if they weren’t 476,000 years old. That’s almost 200,000 years before our species, Homo sapiens, evolved"
              },
              {
                "sourceId": "32",
                "sourceNumber": 32,
                "order": 2,
                "type": "matching",
                "displayType": "sentence-ending",
                "prompt": "• Evidence from high-altitude regions suggests that 32_______ ",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "F",
                "explanation": "For instance, we now know that extinct hominins such as the Denisovans lived on the frozen heights of high-altitude regions 200,000 years ago – upending the old notion that such environments were only settled by modern humans around 3,600 years ago"
              },
              {
                "sourceId": "33",
                "sourceNumber": 33,
                "order": 3,
                "type": "matching",
                "displayType": "sentence-ending",
                "prompt": "• An academic publication from June 2023 shows that 33_______ ",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "D",
                "explanation": "This was the idea, promoted for decades, that in most prehistoric societies the men went out to hunt and the women looked after the home. However, a meta-analysis published in June 2023 compiled data on several dozen foraging societies and found women hunted in 80 per cent of them"
              },
              {
                "sourceId": "34",
                "sourceNumber": 34,
                "order": 4,
                "type": "matching",
                "displayType": "sentence-ending",
                "prompt": "• Analysis of a 4000-year-old Iberian leader indicates that 34_______ ",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "B",
                "explanation": "Going further back, an Iberian leader from around 4000 years ago turned out to be female, not male as many had assumed, when proteins in her teeth were analysed"
              }
            ]
          },
          {
            "key": "cam-21-3-3-35-40",
            "order": 3,
            "displayType": "ynng",
            "instructionHtml": "<h3>Questions 35–40</h3><p>Do the following statements agree with the views of the writer in Reading Passage 3?</p><p>YES if the statement agrees with the views of the writer</p><p>NO if the statement contradicts the views of the writer</p><p>NOT GIVEN if it is impossible to say what the writer thinks about this</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "35",
                "sourceNumber": 35,
                "order": 1,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "It seems likely that the Neanderthals' cave paintings were the first examples of artwork ever created.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NO",
                "explanation": "Even earlier species, such as Homo erectus, may also have made art, for example by engraving patterns on shells"
              },
              {
                "sourceId": "36",
                "sourceNumber": 36,
                "order": 2,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "It is very rare to find prehistoric artwork carved onto shells.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "Even earlier species, such as Homo erectus, may also have made art, for example by engraving patterns on shells"
              },
              {
                "sourceId": "37",
                "sourceNumber": 37,
                "order": 3,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "The methods which the researchers used to examine the Rising Star cave system were rather unconventional.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "The dispute has only been heightened by the way the results were released, in a non-traditional journal that publishes peer reviews publicly alongside the paper"
              },
              {
                "sourceId": "38",
                "sourceNumber": 38,
                "order": 4,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "It is unclear how old the etchings in the Rising Star cave system are.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "YES",
                "explanation": "Nevertheless, in the Rising Star cave system in South Africa where the H. naledi remains were found, researchers have found what seem to be etchings – resembling rudimentary artwork – on the cave walls, though these have yet to be firmly dated"
              },
              {
                "sourceId": "39",
                "sourceNumber": 39,
                "order": 5,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "The means used to publicise the findings from the Rising Star cave system added to the controversy that surrounds them.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "YES",
                "explanation": "The dispute has only been heightened by the way the results were released, in a non-traditional journal that publishes peer reviews publicly alongside the paper"
              },
              {
                "sourceId": "40",
                "sourceNumber": 40,
                "order": 6,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "The size of H. naledi brains is a key factor in the question of whether these hominins were able to produce art.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NO",
                "explanation": "At the same time, I think the species’ small brains are a distraction"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cam-21-4",
    "slug": "cam-21-4",
    "skill": "reading",
    "title": "Cambridge 21 - Test 4",
    "level": "Band 6.0-9.0",
    "series": "Cambridge",
    "seriesNo": 21,
    "durationMinutes": 60,
    "testType": "academic",
    "description": "3 passages · 40 questions",
    "questionCount": 40,
    "sortOrder": 52,
    "passages": [
      {
        "sourceId": "cam-21-4-1",
        "title": "The problems and benefits created by the spread of the water hyacinth in Kenya",
        "contentHtml": "<h2>The problems and benefits created by the spread of the water hyacinth in Kenya</h2><p>Water hyacinth (Eichhornia crassipes), an aquatic plant native to South America, first appeared in countries in Africa in the early 1900s. Scientists there called it the 'world's worst aquatic weed', after it spread from the southernmost tip of Africa in the early 1900s and started obstructing major dams and rivers.</p><p>In east Africa the plant arrived with Belgian colonists in Rwanda, who liked the look of its glossy leaves and delicate purple flowers floating in their ponds. But by the 1980s, it had 'escaped' out of the country via the Kagera river and made its way downstream to Lake Victoria. There, with no natural predators and perfect temperature conditions, the plant began spreading in the open water, blocking fishing routes and providing a new habitat for disease-carrying mosquitoes.</p><p>For the women who smoke fish from the lake to sell it has meant declining income, as the boats that once brought the fish to shore by the hundreds struggle to navigate through the mass of plants. But water hyacinth isn't their only headache. In order to smoke the fish that they buy, they must gather huge quantities of firewood, sometimes walking as far as 10km each way to collect enough to complete their work. And each day as they cook, they breathe in the thick, grey smoke.</p><p>About three out of four families in Kenya depend on wood or charcoal to cook their daily meals, and the rate is even higher in rural areas, Kenya's latest demographic and health survey shows. Using solid fuels like these for cooking increases indoor pollution. The World Health Organization estimates that about 14,300 Kenyans die annually as a result of indoor air pollution - most of which is caused by cooking and heating sources.</p><p>Some years ago, on the shores of Lake Victoria, huge piles of water hyacinth that villagers had taken out of the water in an attempt to clear it were a common sight. But buried in those decaying waxy leaves was a renewable energy gold mine. It turns out the floating plant isn't just good at spreading - its foliage also contains a high ratio of carbon to nitrogen.</p><p>It's a magic combination that has captivated researchers' imaginations since as early as the 1980s when, across the world, they began to explore its potential as a biofuel. Just about 4kg of the dried plant would be enough to cater for a large family's daily energy needs, early research predicted.</p><p>In 2014, Nigerian academics announced they had got better yields of biofuel gas when they mixed the plant with chicken manure. A few years later, Kenyan scientists confirmed what their Nigerian peers and others had already found: manure worked to improve the process of converting the weed into gas.</p><p>In 2018, the technology came to a village on the shore of Lake Victoria, called Dunga. The project promised a two-for-one solution to the dual menaces of the water hyacinth and dependence on firewood. The community received a pair of donated biogas digesters - machines that would transform a mix of water hyacinth and cow dung into biogas for cooking.</p><p>The digesters work a bit like a stomach. The mixture goes in one end - think of it as a mouth - and over the next 20 to 30 days, it goes through a fermentation process and breaks down, giving off gas that comes out the other end. From there, the clean-burning gas is passed through pipes to the point of use, just like traditional domestic gas. In Dunga, the machines produce enough gas to serve about 60% of the village's population.</p><p>It is used in domestic stoves and for other household tasks such as purifying water and incubating chicks.</p><p>The project is testing whether biogas can provide an effective alternative to firewood and charcoal in rural Kenyan communities. Results indicate that the programme seems to be working. The women who smoke the lake fish are already getting sick less often. Besides, they don't have to devote a lot of time every day to gathering firewood, which is a great relief. As a result, they're able to make more money for their families from other enterprises.</p><p>Kanyiva Muindi is an epidemiologist and air pollution research fellow at the African Population and Health Research Centre in Nairobi. She says families who switch to the smokeless cooking method could expect fewer respiratory diseases. Women, young girls and children are particularly vulnerable because they are the ones who cook in the kitchen or outside over fires.</p><p>How much better the biogas stoves will be for the community's health still needs more research, says Dominic Kahumbu Wanjihia, Biogas International's chief executive. But unless the price of the machines drops, it's pretty clear that most communities will never be able to afford any, since they sell for about $750.</p><p>Kanyiva says affordability is a challenge worth addressing, given the huge health and environmental dangers posed by 'dirty' fuels such as wood, charcoal and kerosene. If biogas could become affordable on a large scale, she says it 'would be life-changing for millions on the African continent and beyond'.</p>",
        "sectionNo": 1,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-4-1-1-7",
            "order": 1,
            "displayType": "tfng",
            "instructionHtml": "<h3>Questions 1–7</h3><p>Do the following statements agree with the information given in Reading Passage 1?</p><p><strong>TRUE</strong> if the statement agrees with the information</p><p><strong>FALSE</strong> if the statement contradicts the information</p><p><strong>NOT GIVEN</strong> if there is no information on this</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "1",
                "sourceNumber": 1,
                "order": 1,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Water hyacinth was introduced as a decorative plant in east Africa.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "TRUE",
                "explanation": "In east Africa the plant arrived with Belgian colonists in Rwanda, who liked the look of its glossy leaves and delicate purple flowers floating in their ponds"
              },
              {
                "sourceId": "2",
                "sourceNumber": 2,
                "order": 2,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Fishermen took some water hyacinth plants to Lake Victoria.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "FALSE",
                "explanation": "it had ‘escaped’ out of the country via the Kagera river and made its way downstream to Lake Victoria"
              },
              {
                "sourceId": "3",
                "sourceNumber": 3,
                "order": 3,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "It is now difficult to force boats through the thick water hyacinth on Lake Victoria.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "TRUE",
                "explanation": "as the boats that once brought the fish to shore by the hundreds struggle to navigate through the mass of plants"
              },
              {
                "sourceId": "4",
                "sourceNumber": 4,
                "order": 4,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Chemicals produced by the water hyacinth plants are affecting the numbers of fish in Lake Victoria.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "There, with no natural predators and perfect temperature conditions, the plant began spreading in the open water, blocking fishing routes and providing a new habitat for disease-carrying mosquitoes"
              },
              {
                "sourceId": "5",
                "sourceNumber": 5,
                "order": 5,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Cooking with charcoal has been proved to be even worse for people's health than cooking with wood.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "About three out of four families in Kenya depend on wood or charcoal to cook their daily meals, and the rate is even higher in rural areas, Kenya’s latest demographic and health survey shows. Using solid fuels like these for cooking increases indoor pollution"
              },
              {
                "sourceId": "6",
                "sourceNumber": 6,
                "order": 6,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "People found it impossible to remove much water hyacinth from Lake Victoria.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "FALSE",
                "explanation": "Some years ago, on the shores of Lake Victoria, huge piles of water hyacinth that villagers had taken out of the water in an attempt to clear it were a common sight"
              },
              {
                "sourceId": "7",
                "sourceNumber": 7,
                "order": 7,
                "type": "tfng",
                "displayType": "tfng",
                "prompt": "Scientists started investigating the possibility of using water hyacinth to generate biogas in the last century.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "TRUE",
                "explanation": "It’s a magic combination that has captivated researchers’ imaginations since as early as the 1980s when, across the world, they began to explore its potential as a biofuel"
              }
            ]
          },
          {
            "key": "cam-21-4-1-8-10",
            "order": 2,
            "displayType": "note-completion",
            "instructionHtml": "<h3>Questions 8–10</h3><p>Complete the flow-chart below.</p><p>Choose NO MORE THAN TWO WORDS from the passage for each answer.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "8",
                "sourceNumber": 8,
                "order": 1,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "First, place water hyacinth together with some 8_______  into a digester",
                "questionHtml": "<p>Generating biogas for domestic use in Dunga</p><p>First, place water hyacinth together with some 8_______  into a digester</p><p>↓</p><p>Leave the mixture until the 9_______  is completed</p><p>↓</p><p>Capture the gas emitted by the digester and use 10_______  to transport it to individual homes</p><p>↓</p><p>Then use the gas for cooking as well as making water fit for human consumption</p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "cow dung",
                "explanation": "The community received a pair of donated biogas digesters – machines that would transform a mix of water hyacinth and cow dung into biogas for cooking"
              },
              {
                "sourceId": "9",
                "sourceNumber": 9,
                "order": 2,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "Leave the mixture until the 9_______  is completed",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [
                  "fermentation process"
                ],
                "answerKey": "fermentation",
                "explanation": "The mixture goes in one end – think of it as a mouth – and over the next 20 to 30 days, it goes through a fermentation process and breaks down, giving off gas that comes out the other end"
              },
              {
                "sourceId": "10",
                "sourceNumber": 10,
                "order": 3,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "Capture the gas emitted by the digester and use 10_______  to transport it to individual homes",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "pipes",
                "explanation": "From there, the clean-burning gas is passed through pipes to the point of use, just like traditional domestic gas"
              }
            ]
          },
          {
            "key": "cam-21-4-1-11-13",
            "order": 3,
            "displayType": "note-completion",
            "instructionHtml": "<h3>Questions 11–13</h3><p>Complete the notes below.</p><p>Choose ONE WORD ONLY from the passage for each answer.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "11",
                "sourceNumber": 11,
                "order": 1,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* no need for them to spend so much 11_______  collecting fuel",
                "questionHtml": "<p>Cooking with biogas in Dunga</p><p>Benefits for the women in the village of cooking with biogas</p><p>• no need for them to spend so much 11_______  collecting fuel</p><p>• they can focus on different tasks that bring in 12_______ </p><p>• they are less likely to experience certain diseases connected to burning wood</p><p>Drawbacks of changing to biogas</p><p>• the 13_______  of the digesters is beyond the reach of most villages</p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "time",
                "explanation": "Besides, they don’t have to devote a lot of time every day to gathering firewood, which is a great relief"
              },
              {
                "sourceId": "12",
                "sourceNumber": 12,
                "order": 2,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* they can focus on different tasks that bring in 12_______ ",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "money",
                "explanation": "As a result, they’re able to make more money for their families from other enterprises"
              },
              {
                "sourceId": "13",
                "sourceNumber": 13,
                "order": 3,
                "type": "fill",
                "displayType": "note-completion",
                "prompt": "* the 13_______  of the digesters is beyond the reach of most villages",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "price",
                "explanation": "But unless the price of the machines drops, it’s pretty clear that most communities will never be able to afford any, since they sell for about $750"
              }
            ]
          }
        ]
      },
      {
        "sourceId": "cam-21-4-2",
        "title": "How could multilingualism benefit India's poorest schoolchildren?",
        "contentHtml": "<h2>How could multilingualism benefit India's poorest schoolchildren?</h2><p>The crowded and bustling streets of Delhi teem with life. Stop to listen and, above the din of rickshaws and buses, you'll hear a multitude of languages, as more than 20 million people go about their daily lives. Many were born and raised here, and many millions more have recently made India's capital their home, having moved from surrounding neighbourhoods, cities and states or across the country, often in the hope of gaining better jobs and a better life.</p><p>Some arrive speaking fluent Hindi, the dominant language in Delhi (and the official language of government), but many arrive speaking any number of India's 22 officially recognised languages, let alone the hundreds of regional languages in a country of more than 1.3 billion people.</p><p>A team of researchers led by Professor Ianthi Tsimpli of Cambridge University is currently working on a project collecting data on 1,000 primary-age children in Delhi and the cities of Hyderabad and Bihar.</p><p>The overriding aim of the four-year project, called 'Multilingualism and Multiliteracy', is to find out why in a country where multilingualism is so common (more than 255 million people in India speak at least two languages, and nearly 90 million speak three or more languages), the many benefits of speaking more than one language, observed in schools in Europe for instance, do not apply to many of India's schoolchildren.</p><p>'Each year across India, 600,000 children are tested, and year after year over 50% of children in Standard 5 [ten-year-olds] cannot read a Standard 2 [seven-year-olds] task fluently, and just under 50% of them cannot solve a Standard 2 subtraction task,' says Tsimpli. She explains that low educational achievement can lead to many of these students dropping out of school - a problem disproportionately affecting female students.</p><p>Tsimpli and her colleagues are investigating whether these low learning outcomes could be caused by an Indian school system where the language that children are taught in often differs from the language used at home. The research project, which focuses on 8 to 11-year-old schoolchildren in rural and urban areas, collects data on whether the schoolchildren live in slum* or non-slum areas. Many of the children have moved from remote, rural areas to urban areas.</p><p>They are so poor they have to live in slums and, as a result of migration, they may speak languages that are different from the regional language.</p><p>Having already tested 1,000 children, the researchers will now embark on retesting them. They intend to look not only at test results, but also at variables such as the standard of schooling, the environment and the teaching practices themselves. It's possible that one of the causes of low performance is the lack of pupil-centred teaching methods; in many Indian primary schools the teacher dominates and there is little room for independent learning.</p><p>Although the findings are at a preliminary stage, Tsimpli and her team have found that the medium of instruction used in schools, especially English, may hold back those children who have little familiarity with, or exposure to, the language before starting school and outside of school life.</p><p>According to Tsimpli, most of the evidence from this and other projects shows that English instruction for children from low socio-economic areas might not be the best way for them to learn, at least in the first three years of primary education.</p><p>'What we would recommend for everyone, not just low socio-economic status children, would be to start learning in the language they feel comfortable learning in ... English can still be used, but perhaps not as the medium of instruction in primary schools. It could, for example, be one of the subjects that are being taught alongside other subjects. We are not suggesting that English be withdrawn - that ship has sailed - but we perhaps have to think more about learner needs.</p><p>There is perhaps too much uniformity in teaching and less tailoring to the children's language abilities and needs,' says Tsimpli.</p><p>While the preliminary results show there is no difference in general intelligence among boys and girls from slum areas versus those from urban poor backgrounds, an unanticipated finding has been that children from slum backgrounds do not seem to lag behind children from other urban poor backgrounds - and in some cases outperform them (e.g. in numeracy and literacy tasks). According to the researchers, this unexpected finding may be down to the life experiences of children growing up in slums.</p><p>They are likely to mature faster and come into closer contact with the numeracy skills essential for day-to-day survival.</p><p>The project has already caught the attention of government ministers, who are keen to use the findings of the study to inform and adjust school policy in Delhi and the wider state. 'They are as keen as us to understand how the challenging context of deprivation can be attenuated when focusing on the languages children learn and use while at school. Our findings don't mean you're doomed if you're poor.</p><p>It may be that these low learning outcomes are because of the way education is provided in India, with a huge focus on Hindi and English as the mediums of instruction, to the potential detriment of children unfamiliar with those languages,' explains Tsimpli.</p><p>'Language is central to the way knowledge is transferred - so the medium of instruction is obviously hugely influential. We hope to ... show that problem solving, numeracy and literacy can and do improve in children who are educated in a language of instruction they know. The trick may be to bridge school skills with life skills and make use of the richness of a child's life experience to help them learn in the most effective ways possible,' says Tsimpli.</p><p>* slum: a very densely populated area in which the infrastructure is incomplete and services inadequate or non-existent</p>",
        "sectionNo": 2,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-4-2-14-19",
            "order": 1,
            "displayType": "summary-completion",
            "instructionHtml": "<h3>Questions 14–19</h3><p>Complete the summary using the list of words, A-J, below.</p>",
            "config": {
              "phraseOptions": [
                "basic outlook",
                "employment opportunities",
                "wealthy visitors",
                "distant country",
                "primary objective",
                "similar advantages",
                "thriving economy",
                "nearby district",
                "dense population",
                "new immigrants"
              ]
            },
            "questions": [
              {
                "sourceId": "14",
                "sourceNumber": 14,
                "order": 1,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The city of Delhi has a 14_______  and as you walk through its streets you hear people speaking a variety of languages. Some of them have spent their entire life in Delhi, while others are 15_______ . Whether they have come from a 16_______  or have travelled from the other side of India, they have all come in search of things such as improved 17_______ .",
                "questionHtml": "<p>Multilingualism in Delhi</p><p>The city of Delhi has a 14_______  and as you walk through its streets you hear people speaking a variety of languages. Some of them have spent their entire life in Delhi, while others are 15_______ . Whether they have come from a 16_______  or have travelled from the other side of India, they have all come in search of things such as improved 17_______ .</p><p>A team of researchers led by Professor Ianthi Tsimpli of Cambridge University is collecting data on primary-age schoolchildren in Delhi and other Indian cities. The 18_______  of the research is to discover why multilingual Indian schoolchildren do not experience 19_______  to those that multilingual schoolchildren in Europe experience.</p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "I",
                "explanation": "The crowded and bustling streets of Delhi teem with life. Stop to listen and, above the din of rickshaws and buses, you’ll hear a multitude of languages, as more than 20 million people go about their daily lives"
              },
              {
                "sourceId": "15",
                "sourceNumber": 15,
                "order": 2,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The city of Delhi has a 14_______  and as you walk through its streets you hear people speaking a variety of languages. Some of them have spent their entire life in Delhi, while others are 15_______ . Whether they have come from a 16_______  or have travelled from the other side of India, they have all come in search of things such as improved 17_______ .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "J",
                "explanation": "Many were born and raised here, and many millions more have recently made India’s capital their home, having moved from surrounding neighbourhoods, cities and states or across the country, often in the hope of gaining better jobs and a better life"
              },
              {
                "sourceId": "16",
                "sourceNumber": 16,
                "order": 3,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The city of Delhi has a 14_______  and as you walk through its streets you hear people speaking a variety of languages. Some of them have spent their entire life in Delhi, while others are 15_______ . Whether they have come from a 16_______  or have travelled from the other side of India, they have all come in search of things such as improved 17_______ .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "H",
                "explanation": "Many were born and raised here, and many millions more have recently made India’s capital their home, having moved from surrounding neighbourhoods, cities and states or across the country, often in the hope of gaining better jobs and a better life"
              },
              {
                "sourceId": "17",
                "sourceNumber": 17,
                "order": 4,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "The city of Delhi has a 14_______  and as you walk through its streets you hear people speaking a variety of languages. Some of them have spent their entire life in Delhi, while others are 15_______ . Whether they have come from a 16_______  or have travelled from the other side of India, they have all come in search of things such as improved 17_______ .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "B",
                "explanation": "Many were born and raised here, and many millions more have recently made India’s capital their home, having moved from surrounding neighbourhoods, cities and states or across the country, often in the hope of gaining better jobs and a better life"
              },
              {
                "sourceId": "18",
                "sourceNumber": 18,
                "order": 5,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "A team of researchers led by Professor Ianthi Tsimpli of Cambridge University is collecting data on primary-age schoolchildren in Delhi and other Indian cities. The 18_______  of the research is to discover why multilingual Indian schoolchildren do not experience 19_______  to those that multilingual schoolchildren in Europe experience.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "E",
                "explanation": "The overriding aim of the four-year project, called ‘Multilingualism and Multiliteracy’, is to find out why in a country where multilingualism is so common (more than 255 million people in India speak at least two languages, and nearly 90 million speak three or more languages), the many benefits of speaking more than one language, observed in schools in Europe for instance, do not apply to many of India’s schoolchildren"
              },
              {
                "sourceId": "19",
                "sourceNumber": 19,
                "order": 6,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "A team of researchers led by Professor Ianthi Tsimpli of Cambridge University is collecting data on primary-age schoolchildren in Delhi and other Indian cities. The 18_______  of the research is to discover why multilingual Indian schoolchildren do not experience 19_______  to those that multilingual schoolchildren in Europe experience.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "F",
                "explanation": "The overriding aim of the four-year project, called 'Multilingualism and Multiliteracy', is to find out why in a country where multilingualism is so common (more than 255 million people in India speak at least two languages, and nearly 90 million speak three or more languages), the many benefits of speaking more than one language, observed in schools in Europe for instance, do not apply to many of India's schoolchildren"
              }
            ]
          },
          {
            "key": "cam-21-4-2-20-23",
            "order": 2,
            "displayType": "ynng",
            "instructionHtml": "<h3>Questions 20–23</h3><p>Do the following statements agree with the claims of the writer in Reading Passage 2?</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "20",
                "sourceNumber": 20,
                "order": 1,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "Ten-year-old Indian schoolchildren tend to perform better in literacy tests than in numeracy tests.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NO",
                "explanation": "‘Each year across India, 600,000 children are tested, and year after year over 50% of children in Standard 5 [ten-year-olds] cannot read a Standard 2 [seven-year-olds] task fluently, and just under 50% of them cannot solve a Standard 2 subtraction task,’ says Tsimpli"
              },
              {
                "sourceId": "21",
                "sourceNumber": 21,
                "order": 2,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "Tsimpli had problems convincing some female students to take part in the study.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "She explains that low educational achievement can lead to many of these students dropping out of school – a problem disproportionately affecting female students"
              },
              {
                "sourceId": "22",
                "sourceNumber": 22,
                "order": 3,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "Tsimpli and her team wanted to know if there is a connection between poor academic performance and being taught in an unfamiliar language.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "YES",
                "explanation": "Tsimpli and her colleagues are investigating whether these low learning outcomes could be caused by an Indian school system where the language that children are taught in often differs from the language used at home"
              },
              {
                "sourceId": "23",
                "sourceNumber": 23,
                "order": 4,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "The researchers have decided against investigating the impact teaching methodology may have on learning outcomes.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NO",
                "explanation": "They intend to look not only at test results, but also at variables such as the standard of schooling, the environment and the teaching practices themselves"
              }
            ]
          },
          {
            "key": "cam-21-4-2-24-26",
            "order": 3,
            "displayType": "multiple-choice",
            "instructionHtml": "<h3>Questions 24–26</h3><p>Choose the correct letter, A, B, C or D.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "24",
                "sourceNumber": 24,
                "order": 1,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "What point does the writer make about primary schools in India in the sixth paragraph?",
                "questionHtml": "",
                "options": [
                  "Exposure to English outside of school is of limited benefit.",
                  "Children learn English more easily when they are well motivated.",
                  "Poor children may be disadvantaged further by being instructed in English.",
                  "There is little consistency across schools with regard to instruction in English."
                ],
                "acceptedAnswers": [],
                "answerKey": "C",
                "explanation": "According to Tsimpli, most of the evidence from this and other projects shows that English instruction for children from low socio-economic areas might not be the best way for them to learn, at least in the first three years of primary education"
              },
              {
                "sourceId": "25",
                "sourceNumber": 25,
                "order": 2,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "What is Tsimpli suggesting when she uses the phrase 'that ship has sailed'?",
                "questionHtml": "",
                "options": [
                  "The findings of the report may be of little help to some Indian schoolchildren.",
                  "Instruction in English could be better adapted to the needs of schoolchildren.",
                  "Schools have had limited success in teaching English as a separate subject.",
                  "It is too late to remove English completely as a language of instruction in schools."
                ],
                "acceptedAnswers": [],
                "answerKey": "D",
                "explanation": "We are not suggesting that English be withdrawn – that ship has sailed – but we perhaps have to think more about learner needs"
              },
              {
                "sourceId": "26",
                "sourceNumber": 26,
                "order": 3,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "In the eighth paragraph, what do we learn has surprised researchers?",
                "questionHtml": "",
                "options": [
                  "Boys and girls from low socio-economic groups have similar general intelligence levels.",
                  "The age at which children move into a slum does not affect their academic performance.",
                  "Slum children and children from other urban poor backgrounds have similar life experiences.",
                  "The literacy and numeracy skills of slum children are not lower than those of children from other urban poor backgrounds."
                ],
                "acceptedAnswers": [],
                "answerKey": "D",
                "explanation": "an unanticipated finding has been that children from slum backgrounds do not seem to lag behind children from other urban poor backgrounds – and in some cases outperform them (e.g. in numeracy and literacy tasks)"
              }
            ]
          }
        ]
      },
      {
        "sourceId": "cam-21-4-3",
        "title": "The Globemakers: The Curious Story of an Ancient Craft",
        "contentHtml": "<h2>The Globemakers: The Curious Story of an Ancient Craft</h2><p>A review of Peter Bellerby's book The Globemakers</p><p>In 2008, Peter Bellerby, who lived in London, wanted to give his father a model globe for his eightieth birthday. What seemed simple enough to start with triggered an almost obsessive, decade-long journey, marked by a series of obstacles that would have deterred anyone less determined. It ended with his establishing the world's only bespoke globemaking company.</p><p>The first surprise in The Globemakers, Bellerby's account of this impulsive enterprise, is that obtaining such a globe was not simply a matter of a quick online order and a repressed sigh at the shipping costs. After all, contrary to stubbornly held popular views of our ancestors' geographical ignorance, we have known that the world is spherical since at least the 6th century BCE.</p><p>The ancient Greek philosopher Plato in his work Phaedo likened it to a leather ball, while the accolade of producing the first recorded globe goes to the ancient Greek philosopher Crates of Mallus, who is said to have made one in around 150 BCE. Surely, Bellerby reasoned, a good-quality globe wouldn't be difficult to find.</p><p>Nearly two millennia later, however, it seemed that the art of globemaking had been largely forgotten. Bellerby came across shoddy commercial versions designed for school classrooms and genuine antiques in auction houses that would have bust his budget. Even his trips to Morocco and India, where surely the knowledge of artisan cartographers* had been preserved, drew a blank.</p><p>Not one to be easily thwarted, Bellerby decided to make his own good-quality globe. In the process, almost everything that could possibly go wrong did so. Even the shape of the Earth posed a problem, as it is not quite a perfect sphere, but oblate (slightly flattened at the poles).</p><p>Having decided to compromise and opt for two half-spherical pieces that could be fitted together, he was unable to discover anyone capable of casting moulds with sufficient accuracy to ensure that he would not be left with two half-spheres that were not quite the same circumference. Even after he eventually resolved this issue, extracting these from the moulds resulted in piles of cracked plaster of Paris** and clouds of choking dust in the workshop he had set up at the rear of his house.</p><p>This series of abortive experiments taught Bellerby a lot about the challenges of making globes, which he communicates here to the reader.</p><p>Finding just the right way to prise the globes from the mould - a high-end air compressor finally did the trick - and locating the right paper and inks with which to make the gores (the sections of flat sheet mapping that are pasted onto the spherical globe) without the ink seeping out to create a mushy, unreadable mess took months and an alarming chunk out of his bank balance.</p><p>Bellerby's frustration at the painstaking process of attaching the gores to the globe surface - after having found a glue with precisely the right adhesive qualities - is palpable. Right at the end of the process, he learnt that the paper had stretched slightly and so the final one overlapped the first by a centimetre (which may not seem a great deal, but when that represents 2 per cent of the Earth's diameter, it's equivalent to obliterating the Himalayas or wiping out Chile).</p><p>Bellerby's account of the technical challenges of globe production is interspersed with a series of interludes on great globemakers of the past and cartographic history in general. Purists might wish for more map-making details, but Bellerby clearly found a kindred spirit in Martin Behaim.</p><p>He was the Nuremberg entrepreneur who in 1492 created the Erdapfel, the world's oldest surviving globe, beautifully finished by a workshop of painters and other craftsmen, only to find that the explorer Christopher Columbus had stumbled upon the Americas the very same year, rendering his masterpiece instantly out of date.</p><p>Something of Bellerby's unflinching ambition is reflected in the even more heroic efforts of the Italian cartographer Vincenzo Coronelli, who, in the seventeenth century, created two globes for Louis XIV of France. It took him twenty years to complete the monstrous pair, whose vast bulk - each with a diameter of around four metres - can still be admired in the National Library of France in Paris.</p><p>Although a celebration of the revival of an ancient craft, Bellerby's book is also a lament for the fading away of centuries-old traditions. When he embarked on his globemaking odyssey, he struggled to find artisans with the skills to make the right moulds for the globes or foundries that could shape the meridians (the metal frames which girdle globes) in just the right way.</p><p>Although he finally located the right craftsmen, some simply dropping in, serendipitously, to his workshop (by now in more suitable premises than his back room), many of these have now retired or passed away.</p><p>Bellerby's father finally did receive his eightieth birthday present, albeit two years late. Bellerby went on to found a company which now turns out over six hundred globes a year for customers who can have their own tiny village marked or more unusual requests fulfilled. His book, beautifully illustrated with photographs of the various stages of his venture and a few illustrations of historic globes and maps, is hardly a blueprint for commercial success.</p><p>But it is more than enough to stir up admiration for the craftsmanship of the great mapmakers of the past and the obsessive determination of a modern successor who revived their almost moribund art.</p><p>* cartographer: someone involved in the science or practice of drawing maps</p><p>** plaster of Paris: a quick-setting plaster consisting of a fine white powder that hardens when moistened and allowed to dry</p>",
        "sectionNo": 3,
        "bandLevel": "",
        "groups": [
          {
            "key": "cam-21-4-3-27-32",
            "order": 1,
            "displayType": "summary-completion",
            "instructionHtml": "<h3>Questions 27–32</h3><p>Complete the summary using the list of words, A-J, below.</p>",
            "config": {
              "phraseOptions": [
                "educational use",
                "rare materials",
                "inferior makes",
                "product exchange markets",
                "necessary skills",
                "international",
                "challenging task",
                "memorable object",
                "internet purchase",
                "numerous problems"
              ]
            },
            "questions": [
              {
                "sourceId": "27",
                "sourceNumber": 27,
                "order": 1,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "Peter Bellerby's plan to give his father a globe for his birthday was an unexpectedly 27_______  for which he had to overcome 28_______ .",
                "questionHtml": "<p>Peter Bellerby's plan to give his father a globe for his birthday was an unexpectedly 27_______  for which he had to overcome 28_______ .</p><p>He soon learnt that a straightforward 29_______  would not be possible. Some 30_______  that had been intended for 31_______  were available, as were some expensive antique globes, but these were beyond his budget. He even travelled to places where people might still have the 32_______ , but Bellerby could not find what he wanted.</p>",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "G",
                "explanation": "What seemed simple enough to start with triggered an almost obsessive, decade-long journey, marked by a series of obstacles that would have deterred anyone less determined"
              },
              {
                "sourceId": "28",
                "sourceNumber": 28,
                "order": 2,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "Peter Bellerby's plan to give his father a globe for his birthday was an unexpectedly 27_______  for which he had to overcome 28_______ .",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "J",
                "explanation": "In the process, almost everything that could possibly go wrong did so"
              },
              {
                "sourceId": "29",
                "sourceNumber": 29,
                "order": 3,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "He soon learnt that a straightforward 29_______  would not be possible. Some 30_______  that had been intended for 31_______  were available, as were some expensive antique globes, but these were beyond his budget. He even travelled to places where people might still have the 32_______ , but Bellerby could not find what he wanted.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "I",
                "explanation": "The first surprise in The Globemakers, Bellerby’s account of this impulsive enterprise, is that obtaining such a globe was not simply a matter of a quick online order and a repressed sigh at the shipping costs"
              },
              {
                "sourceId": "30",
                "sourceNumber": 30,
                "order": 4,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "He soon learnt that a straightforward 29_______  would not be possible. Some 30_______  that had been intended for 31_______  were available, as were some expensive antique globes, but these were beyond his budget. He even travelled to places where people might still have the 32_______ , but Bellerby could not find what he wanted.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "C",
                "explanation": "Bellerby came across shoddy commercial versions designed for school classrooms"
              },
              {
                "sourceId": "31",
                "sourceNumber": 31,
                "order": 5,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "He soon learnt that a straightforward 29_______  would not be possible. Some 30_______  that had been intended for 31_______  were available, as were some expensive antique globes, but these were beyond his budget. He even travelled to places where people might still have the 32_______ , but Bellerby could not find what he wanted.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "Bellerby came across shoddy commercial versions designed for school classrooms"
              },
              {
                "sourceId": "32",
                "sourceNumber": 32,
                "order": 6,
                "type": "fill",
                "displayType": "summary-completion",
                "prompt": "He soon learnt that a straightforward 29_______  would not be possible. Some 30_______  that had been intended for 31_______  were available, as were some expensive antique globes, but these were beyond his budget. He even travelled to places where people might still have the 32_______ , but Bellerby could not find what he wanted.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "E",
                "explanation": "Even his trips to Morocco and India, where surely the knowledge of artisan cartographers* had been preserved, drew a blank"
              }
            ]
          },
          {
            "key": "cam-21-4-3-33-36",
            "order": 2,
            "displayType": "ynng",
            "instructionHtml": "<h3>Questions 33–36</h3><p>Do the following statements agree with the claims of the writer in Reading Passage 3?</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "33",
                "sourceNumber": 33,
                "order": 1,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "The assumption today that people in the past knew very little about geography is correct.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NO",
                "explanation": "After all, contrary to stubbornly held popular views of our ancestors’ geographical ignorance, we have known that the world is spherical since at least the 6th century BCE"
              },
              {
                "sourceId": "34",
                "sourceNumber": 34,
                "order": 2,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "Plato was criticised for saying the world was shaped like a leather ball.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "The ancient Greek philosopher Plato in his work Phaedo likened it to a leather ball"
              },
              {
                "sourceId": "35",
                "sourceNumber": 35,
                "order": 3,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "The globe made by Crates of Mallus was an accurate representation of the known world.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "NOT GIVEN",
                "explanation": "the accolade of producing the first recorded globe goes to the ancient Greek philosopher Crates of Mallus, who is said to have made one in around 150 BCE"
              },
              {
                "sourceId": "36",
                "sourceNumber": 36,
                "order": 4,
                "type": "ynng",
                "displayType": "ynng",
                "prompt": "Bellerby assumed he would have few problems locating a well-made globe.",
                "questionHtml": "",
                "options": [],
                "acceptedAnswers": [],
                "answerKey": "YES",
                "explanation": "Surely, Bellerby reasoned, a good-quality globe wouldn’t be difficult to find"
              }
            ]
          },
          {
            "key": "cam-21-4-3-37-40",
            "order": 3,
            "displayType": "multiple-choice",
            "instructionHtml": "<h3>Questions 37–40</h3><p>Choose the correct letter, A, B, C or D.</p>",
            "config": {},
            "questions": [
              {
                "sourceId": "37",
                "sourceNumber": 37,
                "order": 1,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "When Bellerby had to attach the gores to the globe surface,",
                "questionHtml": "",
                "options": [
                  "he decided it was best to work quickly.",
                  "he became aware of an unexpected issue.",
                  "he was worried about the quality of his materials.",
                  "he nearly gave up the whole project."
                ],
                "acceptedAnswers": [],
                "answerKey": "B",
                "explanation": "Bellerby’s frustration at the painstaking process of attaching the gores to the globe surface – after having found a glue with precisely the right adhesive qualities – is palpable. Right at the end of the process, he learnt that the paper had stretched slightly and so the final one overlapped the first by a centimetre"
              },
              {
                "sourceId": "38",
                "sourceNumber": 38,
                "order": 2,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "The reviewer mentions other globe makers of the past because",
                "questionHtml": "",
                "options": [
                  "Bellerby was particularly inspired by them.",
                  "their achievements are not widely known.",
                  "Bellerby had something in common with each of them.",
                  "their difficulties could have been avoided."
                ],
                "acceptedAnswers": [],
                "answerKey": "C",
                "explanation": "Bellerby clearly found a kindred spirit in Martin Behaim Something of Bellerby’s unflinching ambition is reflected in the even more heroic efforts of the Italian cartographer Vincenzo Coronelli"
              },
              {
                "sourceId": "39",
                "sourceNumber": 39,
                "order": 3,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "What point is made about Bellerby in the seventh paragraph?",
                "questionHtml": "",
                "options": [
                  "He had long working relationships with numerous craftsmen.",
                  "He understands the lack of interest in traditional crafts.",
                  "He appreciates the importance of careful planning.",
                  "He regrets the loss of many globe-making skills."
                ],
                "acceptedAnswers": [],
                "answerKey": "D",
                "explanation": "Although a celebration of the revival of an ancient craft, Bellerby’s book is also a lament for the fading away of centuries-old traditions"
              },
              {
                "sourceId": "40",
                "sourceNumber": 40,
                "order": 4,
                "type": "mcq",
                "displayType": "multiple-choice",
                "prompt": "What does the reviewer say about Bellerby's book in the final paragraph?",
                "questionHtml": "",
                "options": [
                  "It does not tell you how to create a profitable business.",
                  "It overlooks some important mapmakers.",
                  "It fails to discuss the future of globe-making.",
                  "It does not give enough details about individual customers."
                ],
                "acceptedAnswers": [],
                "answerKey": "A",
                "explanation": "His book, beautifully illustrated with photographs of the various stages of his venture and a few illustrations of historic globes and maps, is hardly a blueprint for commercial success"
              }
            ]
          }
        ]
      }
    ]
  }
]
$data$::jsonb)
 loop
  insert into public.skill_tests (skill,slug,series,series_no,title,description,level,duration_minutes,test_type,question_count,status,sort_order)
  values ('reading',exam->>'slug',exam->>'series',(exam->>'seriesNo')::integer,exam->>'title',exam->>'description',exam->>'level',60,'academic',40,'published',(exam->>'sortOrder')::integer)
  on conflict (slug) do update set series=excluded.series,series_no=excluded.series_no,title=excluded.title,description=excluded.description,level=excluded.level,duration_minutes=excluded.duration_minutes,test_type=excluded.test_type,question_count=40,status='published',sort_order=excluded.sort_order
  returning id into exam_id;
  for passage in select value from jsonb_array_elements(exam->'passages')
  loop
   insert into public.skill_sections (test_id,section_no,title,content_html,source_id)
   values (exam_id,(passage->>'sectionNo')::integer,passage->>'title',passage->>'contentHtml',passage->>'sourceId')
   on conflict (test_id,section_no) do update set title=excluded.title,content_html=excluded.content_html,source_id=excluded.source_id
   returning id into section_id_value;
   for question_group in select value from jsonb_array_elements(passage->'groups')
   loop
    insert into public.skill_question_groups (section_id,order_index,instruction_html,display_type,config)
    values (section_id_value,(question_group->>'order')::integer,question_group->>'instructionHtml',question_group->>'displayType',question_group->'config')
    on conflict (section_id,order_index) do update set instruction_html=excluded.instruction_html,display_type=excluded.display_type,config=excluded.config
    returning id into group_id_value;
    for question in select value from jsonb_array_elements(question_group->'questions')
    loop
     insert into public.skill_questions (group_id,order_index,source_number,question_type,display_type,prompt,question_html,options,answer_key,accepted_answers,explanation)
     values (group_id_value,(question->>'order')::integer,(question->>'sourceNumber')::integer,question->>'type',question->>'displayType',question->>'prompt',question->>'questionHtml',question->'options',question->>'answerKey',array(select jsonb_array_elements_text(question->'acceptedAnswers')),question->>'explanation')
     on conflict (group_id,order_index) do update set source_number=excluded.source_number,question_type=excluded.question_type,display_type=excluded.display_type,prompt=excluded.prompt,question_html=excluded.question_html,options=excluded.options,answer_key=excluded.answer_key,accepted_answers=excluded.accepted_answers,explanation=excluded.explanation;
    end loop;
   end loop;
  end loop;
  if (select count(*) from public.skill_questions q join public.skill_question_groups g on g.id=q.group_id join public.skill_sections s on s.id=g.section_id where s.test_id=exam_id) <> 40 then
   raise exception 'Expected 40 questions for %',exam->>'slug';
  end if;
 end loop;
end $import$;
insert into public.schema_migrations (name) values ('026_add_cambridge_21_reading.sql') on conflict do nothing;
commit;
