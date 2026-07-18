// ===== DiscussAI — Intelligent Debate Engine v4.0 =====
// Direct-engagement, keyword-matched, persona-enforced debate system

const ResponseEngine = (() => {
  'use strict';

  // ===== TOPIC KNOWLEDGE BASES (keyword-tagged for matching) =====
  const TOPIC_KNOWLEDGE = {
    "Is AI replacing human creativity?": {
      keywords: ['ai','artificial','intelligence','creativity','creative','art','artist','music','writing','replace','human','machine','generate','original'],
      arguments: [
        { tags:['efficiency','speed','fast','quick','generate','produce'], stance:'pro', point:"AI generates creative output at a speed humans can't match", evidence:"Midjourney produced over 15 million images in its first year — a single artist couldn't do that in a lifetime", rebuttal:"You mentioned speed, but speed isn't creativity. A printer is fast too — that doesn't make it an artist." },
        { tags:['quality','good','better','stunning','beautiful','impressive'], stance:'pro', point:"AI art quality has reached a level where experts can't tell it apart from human work", evidence:"A 2023 study in Psychological Science found people rated AI art as more aesthetically pleasing than human art 54% of the time", rebuttal:"You say the quality is there, but quality without intent is just noise. A sunset is beautiful — that doesn't mean nature is creative." },
        { tags:['job','work','career','employment','hire','replace','livelihood'], stance:'pro', point:"AI is already replacing creative jobs in real industries", evidence:"Concept art job postings dropped 70% since 2022, and Getty Images now sells AI-generated stock photos", rebuttal:"Jobs disappearing doesn't mean creativity is replaced — it means cheap labor is replacing skilled labor. There's a difference." },
        { tags:['tool','assist','help','augment','collaborate'], stance:'nuanced', point:"AI works best as a creative collaborator, not a replacement", evidence:"Adobe's Firefly is used by 90% of creative professionals as an assistant tool, not a replacement", rebuttal:"Calling it a 'tool' undersells what's happening. When the 'tool' does 90% of the work, who's really the creator?" },
        { tags:['emotion','feeling','experience','soul','depth','meaning','personal'], stance:'con', point:"AI cannot draw from lived experience, trauma, joy, or personal growth — the very things that make art resonate", evidence:"Picasso's Guernica was born from the horror of war. No AI has context for that kind of emotional truth", rebuttal:"You're romanticizing suffering. Plenty of great art comes from pure technique and experimentation — look at abstract expressionism." },
        { tags:['original','new','novel','invent','innovate','unique'], stance:'con', point:"AI can only recombine existing patterns — it cannot conceptualize something truly unprecedented", evidence:"Every AI model is trained on human-created datasets. It's a sophisticated remix engine, not an inventor", rebuttal:"But humans also remix. Shakespeare borrowed plots, hip-hop samples existing music. Originality is always built on what came before." },
        { tags:['copyright','legal','law','own','ownership','rights'], stance:'con', point:"The legal system itself has ruled that AI-generated work lacks the human authorship required for copyright", evidence:"The US Copyright Office explicitly ruled in 2023 that purely AI-generated images cannot be copyrighted", rebuttal:"Copyright law is always behind technology. Photography wasn't copyrightable at first either." },
        { tags:['music','song','compose','melody','rhythm'], stance:'pro', point:"AI-composed music is already commercially successful and emotionally engaging", evidence:"AIVA, an AI composer, had its music licensed by the Luxembourg Philharmonic Orchestra. AI tracks have streamed millions of times on Spotify", rebuttal:"Streaming numbers don't equal artistic merit. Background music for coffee shops is successful too — nobody calls it creative genius." },
        { tags:['democratize','access','everyone','anyone','easy','barrier'], stance:'pro', point:"AI removes gatekeeping from creative fields — anyone can create without years of training", evidence:"Over 100 million people use AI creative tools monthly, many who never had access to expensive art education", rebuttal:"Lowering the barrier to entry doesn't elevate creativity — it floods the market with mediocrity. Even Instagram popularized photography, but did it create more Ansel Adams?" },
        { tags:['understand','intention','conscious','aware','think','know','meaning'], stance:'con', point:"AI produces output without understanding what it creates — there's no intention behind it", evidence:"When asked to 'paint grief,' AI generates dark colors and sad faces. It doesn't understand grief — it pattern-matches the word", rebuttal:"Does understanding matter if the output moves people? Audiences don't ask whether the artist suffered — they care about how the art makes them feel." },
      ]
    },
    "Should social media be regulated?": {
      keywords: ['social','media','regulate','regulation','facebook','instagram','twitter','tiktok','platform','free','speech','misinformation','algorithm','children','mental','health'],
      arguments: [
        { tags:['free','speech','freedom','expression','censor','censorship','silence'], stance:'con', point:"Regulation inevitably becomes a tool for censoring inconvenient speech", evidence:"China's internet regulation is used to silence political dissent. Even in democracies, the UK's Online Safety Bill has been criticized for vague overreach", rebuttal:"Free speech isn't unlimited anywhere — you can't yell 'fire' in a theater. The question is where we draw the line, not whether we draw one." },
        { tags:['children','kids','teen','young','youth','minor','child','age'], stance:'pro', point:"Children are being psychologically damaged by platforms designed to maximize engagement, not wellbeing", evidence:"Internal Facebook documents showed Instagram worsened body image for 32% of teen girls. The US Surgeon General declared a youth mental health crisis linked to social media", rebuttal:"Parents have tools to restrict access right now. Blaming platforms for parenting failures is a convenient dodge." },
        { tags:['misinformation','fake','lies','false','truth','conspiracy','news'], stance:'pro', point:"Misinformation on social media is literally killing people and undermining democracy", evidence:"An MIT study found false news stories spread 6x faster than true ones on Twitter. Anti-vaccine misinformation on Facebook contributed to measles outbreaks in Samoa that killed 83 people", rebuttal:"Who decides what's 'misinformation'? The WHO initially said COVID wasn't airborne. Today's 'misinformation' can be tomorrow's accepted truth." },
        { tags:['algorithm','addictive','addiction','engage','engagement','dopamine','design','feed'], stance:'pro', point:"These platforms are deliberately engineered to be addictive using the same psychology as slot machines", evidence:"Former Facebook VP Sean Parker admitted the platform was designed to exploit 'vulnerability in human psychology.' Average teens spend 4.8 hours daily on social media", rebuttal:"Everything enjoyable triggers dopamine — food, exercise, socializing. Calling it 'addiction' medicalizes normal human behavior." },
        { tags:['monopoly','competition','power','big','tech','company','market'], stance:'pro', point:"Social media companies have monopoly-level power with zero accountability", evidence:"Meta owns Facebook, Instagram, and WhatsApp — 3.7 billion users. No competitor can realistically challenge that network effect", rebuttal:"Users aren't locked in. TikTok went from zero to a billion users despite Meta's dominance. The market does work." },
        { tags:['innovation','stifle','slow','progress','startup','small','business'], stance:'con', point:"Heavy regulation crushes innovation and disproportionately hurts smaller companies", evidence:"GDPR compliance costs average €1.3 million for enterprises but can bankrupt startups. Europe has produced no major social platforms since GDPR", rebuttal:"Innovation that depends on exploiting user data isn't innovation worth protecting." },
        { tags:['self','regulate','voluntary','industry','standard'], stance:'con', point:"The industry should self-regulate because government bureaucrats don't understand technology", evidence:"Congressional hearings regularly expose lawmakers' tech ignorance — one senator asked Zuckerberg how Facebook makes money if it's free", rebuttal:"Self-regulation has had years to work and has consistently failed. Facebook knew about Cambridge Analytica for years before acting." },
        { tags:['positive','good','benefit','connect','community','organize','movement'], stance:'con', point:"Social media has enormous positive effects that regulation could destroy", evidence:"The Arab Spring, Black Lives Matter, and #MeToo all organized through social media. GoFundMe campaigns on social platforms raise billions for people in need", rebuttal:"A tool that does some good doesn't get a pass for also doing enormous harm. Asbestos was a great insulator — we still banned it." },
        { tags:['data','privacy','personal','information','track','surveillance'], stance:'pro', point:"Platforms harvest personal data at an industrial scale with virtually no informed consent", evidence:"Facebook tracks users across 8.4 million websites via its pixel. The average person has their data held by 350+ companies", rebuttal:"Users agreed to the terms of service. Nobody forces you to use these platforms." },
        { tags:['transparency','audit','accountable','open','algorithm'], stance:'nuanced', point:"We don't need to ban content — we need algorithmic transparency so users know why they're seeing what they see", evidence:"The EU's Digital Services Act requires platforms to explain their recommendation algorithms. Early results show a 15% reduction in harmful content exposure", rebuttal:"Transparency alone doesn't fix the incentive structure. Even if you know the algorithm is manipulating you, that doesn't make you immune to it." },
      ]
    },
    "Remote work vs office culture": {
      keywords: ['remote','work','office','home','hybrid','commute','culture','team','productivity','wfh','collaborate','in-person'],
      arguments: [
        { tags:['productive','productivity','output','efficient','work','performance','result'], stance:'pro', point:"Remote workers are measurably more productive by every major study", evidence:"Stanford's 2-year study of 16,000 workers showed a 13% productivity increase when working from home. Prodoscore found a 47% increase in 2020", rebuttal:"Those studies cherry-pick metrics. Productivity in what? Answering emails faster isn't the same as breakthrough thinking." },
        { tags:['commute','travel','time','drive','traffic','transport','waste'], stance:'pro', point:"Commuting wastes hundreds of hours per year that could be spent actually working or living", evidence:"The average American commutes 55 minutes daily — that's 230 hours/year, equivalent to nearly 6 work weeks. The financial cost is $8,400/year", rebuttal:"Commute time isn't wasted — many people use it to mentally prepare, listen to podcasts, or decompress. You can't put a price on that transition." },
        { tags:['collaborate','collaboration','team','together','brainstorm','idea','innovate','spontaneous'], stance:'con', point:"Real innovation requires the kind of spontaneous, unplanned collaboration that only happens in person", evidence:"3M's Post-it Notes, Twitter's hashtag feature, and Slack's emoji reactions all came from hallway conversations. Microsoft's own research showed remote work siloed communication into existing clusters", rebuttal:"That's survivorship bias. You remember the one hallway chat that worked — not the thousands that were just about lunch plans." },
        { tags:['mental','health','lonely','isolation','alone','social','disconnect'], stance:'con', point:"Remote work is fueling an epidemic of loneliness and professional isolation", evidence:"Buffer's State of Remote Work survey found 24% of remote workers struggle with loneliness. The American Psychological Association linked remote work to increased rates of anxiety and depression", rebuttal:"Office workers are lonely too — sitting in a cubicle isn't 'socializing.' And remote workers have more time for real relationships outside work." },
        { tags:['save','cost','money','expense','cheap','rent','office','overhead'], stance:'pro', point:"Companies save enormous amounts on real estate while employees save on commuting and work clothes", evidence:"Global Workplace Analytics found companies save $11,000 per remote employee annually. Employees save $2,500-$4,000 per year on average", rebuttal:"Those savings come at the cost of culture and loyalty. When work is just a Zoom call, switching companies becomes as easy as switching links." },
        { tags:['culture','bond','team','belonging','trust','engage','company','loyalty'], stance:'con', point:"Company culture disintegrates without shared physical space — you can't build trust through a screen", evidence:"A Gallup study found remote employees are 29% less likely to feel connected to company mission. Voluntary turnover is 50% higher in fully remote companies", rebuttal:"Bad culture doesn't improve by trapping people in an office. If your culture only works face-to-face, it's a control mechanism, not a culture." },
        { tags:['junior','new','young','learn','mentor','train','onboard','grow','career'], stance:'con', point:"Junior employees are being failed by remote work — they lose informal mentorship and career visibility", evidence:"Microsoft's research showed new hires in remote settings had 17% fewer cross-team connections. The Society for Human Resource Management found remote workers are promoted 38% less often", rebuttal:"That's a management failure, not a remote work failure. Companies that intentionally structure mentorship remotely see equal outcomes." },
        { tags:['talent','hire','global','location','recruit','anywhere','diverse'], stance:'pro', point:"Remote work lets companies hire the absolute best talent regardless of geography", evidence:"Remote job postings attract 7x more applicants. GitLab, a fully remote company with 2,000 employees in 65 countries, says this is their biggest competitive advantage", rebuttal:"Hiring globally means competing globally on salary too. That drives down wages for local workers while companies pocket the arbitrage." },
        { tags:['hybrid','mix','balance','flexible','both','middle','compromise'], stance:'nuanced', point:"The data overwhelmingly supports hybrid as the optimal model — not fully remote, not fully office", evidence:"A 2023 McKinsey study found hybrid workers report the highest satisfaction AND productivity. 83% of Fortune 500 companies have adopted hybrid policies", rebuttal:"Hybrid is just 'come to the office when we tell you' dressed up as flexibility. Most hybrid policies are just remote work with mandatory fun days." },
      ]
    },
    "Electric vehicles: hype or revolution?": {
      keywords: ['electric','ev','vehicle','car','battery','tesla','charge','emission','petrol','gas','diesel','fuel','motor','drive'],
      arguments: [
        { tags:['efficient','efficiency','energy','convert','loss','waste','engine','motor'], stance:'pro', point:"EVs are objectively more energy-efficient than combustion engines — this is basic physics, not opinion", evidence:"Electric motors convert 85-90% of electrical energy to motion vs only 20-30% for internal combustion engines. That's a 3-4x efficiency advantage", rebuttal:"Efficiency at the wheel isn't the whole picture. Factor in grid transmission losses (5%), charging losses (10-15%), and battery degradation, and the real-world gap shrinks significantly." },
        { tags:['battery','lithium','mine','mining','cobalt','resource','material','produce','manufacture'], stance:'con', point:"EV battery production is an environmental disaster that nobody wants to talk about", evidence:"Mining lithium requires 500,000 gallons of water per ton. The Atacama Desert in Chile has lost 65% of its water supply due to lithium mining. Cobalt mining in the DRC uses child labor", rebuttal:"Combustion engines require drilling, refining, and transporting oil — which has caused wars, oil spills like Deepwater Horizon, and irreversible ecosystem damage. The comparison isn't close." },
        { tags:['range','distance','far','charge','charging','infrastructure','station','long','trip','travel'], stance:'con', point:"Range anxiety is still a real barrier — the charging infrastructure simply isn't ready", evidence:"There are only 160,000 public charging points in the US vs 150,000 gas stations, and charging takes 20-40 minutes vs 3 minutes to fill up", rebuttal:"90% of EV charging happens at home overnight. You wake up with a full 'tank' every day. When's the last time your gas car did that?" },
        { tags:['emission','carbon','climate','environment','green','clean','pollution','co2'], stance:'pro', point:"Even accounting for manufacturing, EVs produce dramatically fewer lifetime emissions", evidence:"A 2021 study by the International Council on Clean Transportation found EVs produce 66-69% fewer lifetime greenhouse gas emissions than petrol cars in Europe", rebuttal:"Those numbers assume a clean electrical grid. In countries where electricity comes from coal — like India and Poland — the emissions advantage drops to only 20-30%." },
        { tags:['cost','expensive','price','afford','cheap','money','buy','pay','value'], stance:'con', point:"EVs remain unaffordable for most people — this is a luxury transition pretending to be populist", evidence:"The average EV costs $55,000 vs $35,000 for a comparable ICE vehicle. Battery replacement costs $5,000-$15,000 after 8-10 years", rebuttal:"Initial cost is higher, but total cost of ownership is lower. EVs save $1,000-$1,500/year in fuel and 50% on maintenance. The gap breaks even within 5-7 years." },
        { tags:['tesla','elon','musk','market','stock','company','brand'], stance:'nuanced', point:"Tesla proved EVs could be desirable, but the market is now much bigger than one company", evidence:"Tesla's market share dropped from 79% to 55% in 2023 as BMW, Hyundai, and BYD launched competitive models. BYD outsells Tesla globally as of Q4 2023", rebuttal:"Market competition is healthy, but Tesla still controls the best charging network and most advanced self-driving tech. Market share isn't everything." },
        { tags:['grid','power','electricity','demand','nuclear','renewable','solar','wind','energy','source'], stance:'con', point:"Mass EV adoption will overwhelm our electrical grid — we can't even keep the lights on now", evidence:"California already asks EV owners not to charge during peak hours. The US grid needs a $70 billion upgrade to support 50% EV adoption by 2030", rebuttal:"Grid upgrades are infrastructure investment, not a reason to keep burning fossil fuels. We upgraded roads for cars — we can upgrade grids for EVs." },
        { tags:['future','trend','growth','adopt','inevitable','transition','change','phase'], stance:'pro', point:"The transition to EVs isn't a debate — it's already happening at accelerating speed", evidence:"Global EV sales hit 14 million in 2023, up 35% year-over-year. Norway is already at 82% EV market share. The EU and UK have banned new ICE sales from 2035", rebuttal:"Government mandates don't equal organic demand. When subsidies end, sales plateau — Germany saw EV sales drop 30% after reducing subsidies in 2023." },
        { tags:['maintenance','repair','reliable','break','part','service','mechanic'], stance:'pro', point:"EVs have dramatically fewer moving parts, meaning less maintenance and higher reliability", evidence:"An EV drivetrain has about 20 moving parts vs 2,000+ in an ICE vehicle. Consumer Reports data shows EV owners spend 50% less on maintenance over 200,000 miles", rebuttal:"Fewer moving parts doesn't mean cheaper repairs. A Tesla fender-bender can cost $5,000+ because battery packs must be inspected. And independent mechanics can't fix most EVs." },
      ]
    },
    "Is cryptocurrency the future of finance?": {
      keywords: ['crypto','bitcoin','blockchain','decentralized','currency','finance','bank','money','digital','ethereum','token','coin','defi','nft'],
      arguments: [
        { tags:['decentralized','bank','control','government','freedom','central','power'], stance:'pro', point:"Crypto removes the need to trust centralized institutions that have repeatedly failed ordinary people", evidence:"The 2008 financial crisis wiped out $10 trillion in wealth because banks gambled with deposits. Bitcoin was literally created in response — its genesis block references a bank bailout headline", rebuttal:"Decentralization just replaces institutional risk with protocol risk. FTX was 'decentralized finance' and its founder stole $8 billion from customers." },
        { tags:['volatile','unstable','crash','price','value','risky','speculation','bubble','gamble'], stance:'con', point:"Crypto is too volatile to function as actual money — it's a speculative asset, not a currency", evidence:"Bitcoin dropped 77% in 2022. A 'currency' that loses three-quarters of its value in a year is useless for buying groceries or paying rent", rebuttal:"The US dollar has lost 97% of its value since 1913 through inflation. Volatility decreases as market cap grows — Bitcoin is less volatile now than it was 5 years ago." },
        { tags:['energy','environment','power','electricity','mining','carbon','waste','climate'], stance:'con', point:"Proof-of-work crypto mining is an environmental catastrophe", evidence:"Bitcoin mining consumes 150 TWh annually — more electricity than Argentina. A single Bitcoin transaction uses as much energy as 1.7 million Visa transactions", rebuttal:"Ethereum already moved to proof-of-stake, cutting energy use by 99.95%. Bitcoin mining increasingly uses stranded renewable energy that would otherwise go to waste." },
        { tags:['send','transfer','remittance','fast','cheap','border','international','payment','fee'], stance:'pro', point:"Crypto enables near-instant, near-free international transfers that banks charge a fortune for", evidence:"Western Union charges 5-10% fees on international remittances. Bitcoin Lightning Network processes cross-border payments in seconds for fractions of a cent", rebuttal:"SWIFT transfers already take 1-2 days at low cost. And crypto's 'low fees' don't account for the gas fees that spike to $50+ during network congestion." },
        { tags:['scam','fraud','hack','steal','crime','launder','illegal','dark','ponzi'], stance:'con', point:"The crypto space is overwhelmed with fraud, scams, and money laundering", evidence:"$3.8 billion was stolen through crypto hacks in 2022 alone. The FBI estimated that crypto fraud losses exceeded $5.6 billion in 2023", rebuttal:"The traditional banking system launders $2 trillion annually according to the UN. Crypto's transparency actually makes crime easier to track — blockchain is a public ledger." },
        { tags:['future','adopt','mainstream','inevitable','grow','use','real','world'], stance:'pro', point:"Major institutions are already integrating crypto — this isn't fringe anymore", evidence:"BlackRock launched a Bitcoin ETF that attracted $10 billion in 3 months. PayPal, Visa, and Mastercard all support crypto transactions. El Salvador made Bitcoin legal tender", rebuttal:"Institutional interest is in Bitcoin as a speculative asset, not as a replacement for the dollar. BlackRock isn't buying Bitcoin to pay their employees with it." },
      ]
    },
    "Should college education be free?": {
      keywords: ['college','university','education','free','tuition','student','debt','loan','degree','cost','higher','learning'],
      arguments: [
        { tags:['debt','loan','burden','owe','pay','financial','crisis','graduate'], stance:'pro', point:"Student debt has become a generational crisis that's crippling economic mobility", evidence:"Total US student debt is $1.77 trillion — more than credit card debt. The average graduate owes $37,000 and takes 20 years to pay it off", rebuttal:"Nobody forces students to take loans. Community college costs $3,800/year. The 'debt crisis' is largely driven by students choosing expensive private schools." },
        { tags:['tax','taxpayer','pay','fund','cost','afford','government','spend','budget'], stance:'con', point:"'Free' college isn't free — it shifts the cost to taxpayers, including those who never attended", evidence:"Making all public universities free would cost $79 billion annually. That means a plumber or electrician earning $50K would subsidize someone's film studies degree", rebuttal:"Taxpayers already fund K-12 education. Adding 4 more years is a marginal cost. And that plumber's kids would benefit too." },
        { tags:['economy','economic','gdp','growth','workforce','skill','compete','job','market'], stance:'pro', point:"A more educated workforce drives national economic growth and competitiveness", evidence:"Countries with higher education rates have 20-25% higher GDP per capita. Germany offers free university and has the lowest youth unemployment in the EU at 5.8%", rebuttal:"Germany's success comes from strong vocational training, not free universities. Flooding the market with degrees just causes credential inflation." },
        { tags:['value','worth','degree','return','investment','waste','useless','major'], stance:'con', point:"Many degrees don't provide sufficient economic return — making them free just increases waste", evidence:"41% of recent graduates work in jobs that don't require a degree. The average sociology degree has a negative lifetime ROI according to Georgetown University data", rebuttal:"Education's value isn't purely economic. An informed electorate, critical thinking, and social mobility are public goods that can't be measured in salary data alone." },
        { tags:['access','equal','opportunity','poor','rich','inequality','barrier','first','generation'], stance:'pro', point:"Cost is the #1 barrier keeping talented low-income students from higher education", evidence:"Students from families earning over $100K are 8x more likely to earn a bachelor's degree than those from families earning under $35K", rebuttal:"Financial aid already exists — Pell Grants cover up to $7,400/year. The access problem is about K-12 preparation, not tuition cost." },
      ]
    },
  };

  // ===== GENERIC ARGUMENTS (for topics without specific knowledge) =====
  const GENERIC_ARGUMENTS = [
    { tags:['benefit','advantage','positive','good','pro','support','favor'], stance:'pro', point:"The potential benefits clearly outweigh the risks when you look at the track record", evidence:"Similar innovations were initially feared but eventually embraced — the printing press, electricity, the internet all faced identical resistance", rebuttal:"Past successes don't guarantee future ones. Asbestos, leaded gasoline, and DDT were all celebrated innovations before we discovered the damage." },
    { tags:['risk','danger','harm','negative','problem','issue','concern','bad'], stance:'con', point:"The unintended consequences haven't been studied enough to justify moving forward", evidence:"History is full of innovations that caused unforeseen damage — thalidomide, CFCs, social media algorithms — all deployed before we understood the risks", rebuttal:"If we waited for perfect knowledge before acting, we'd never do anything. Calculated risk is how all progress happens." },
    { tags:['cost','expensive','money','budget','afford','spend','waste','resource'], stance:'con', point:"The financial cost is massive and there are more effective ways to spend those resources", evidence:"Cost-benefit analysis almost always reveals cheaper alternatives that achieve 80% of the outcome at 20% of the cost", rebuttal:"Cheap solutions are often just deferred costs. Spending less upfront usually means paying more in consequences later." },
    { tags:['fair','equal','justice','right','access','discriminate','inequality'], stance:'pro', point:"This is fundamentally about equity — the current system disproportionately benefits those who already have advantages", evidence:"Study after study shows outcomes in this area correlate strongly with socioeconomic status, not merit or effort", rebuttal:"Equity of outcome isn't the same as equity of opportunity. Forcing equal results often creates new injustices." },
    { tags:['freedom','choice','liberty','right','individual','personal','force','mandate'], stance:'con', point:"Individual choice must be preserved — top-down mandates create more problems than they solve", evidence:"Centralized solutions consistently perform worse than decentralized, market-driven approaches in terms of innovation and efficiency", rebuttal:"Individual choice doesn't work when one person's 'choice' imposes costs on everyone else. That's why we have seatbelt laws." },
    { tags:['future','progress','innovation','change','modern','evolve','advance','forward'], stance:'pro', point:"Resisting this is just resisting the inevitable trajectory of progress", evidence:"Every major paradigm shift — industrial revolution, digital revolution, globalization — was opposed by those who benefited from the old system", rebuttal:"Just because something is new doesn't mean it's better. Plenty of 'progress' was actually regression — fast food, suburban sprawl, social media addiction." },
    { tags:['evidence','study','research','data','science','fact','proof','measure'], stance:'nuanced', point:"The evidence is genuinely mixed — strong arguments exist on both sides, which is why this debate persists", evidence:"Meta-analyses show contradictory results depending on methodology, sample size, and timeframe. Cherry-picking studies is easy on both sides", rebuttal:"'Both sides have a point' is the laziest position in any debate. The evidence tilts one way — the question is whether you're willing to follow it." },
    { tags:['practical','implement','real','work','actually','theory','practice'], stance:'con', point:"This sounds great in theory but falls apart in real-world implementation", evidence:"Policy implementation studies show a consistent gap between intended outcomes and actual results, often as large as 40-60%", rebuttal:"Implementation challenges are engineering problems, not fundamental objections. The Apollo program was 'impractical' too until we just did it." },
  ];

  // ===== ARGUMENT TRACKER =====
  class ArgumentTracker {
    constructor() {
      this.userPoints = [];
      this.aiPoints = [];
      this.usedArgKeys = new Set();
      this.userKeywords = new Set();
    }

    addUserPoint(content) {
      const keywords = this._extractKeywords(content);
      keywords.forEach(k => this.userKeywords.add(k));
      this.userPoints.push({ content, keywords, time: Date.now() });
    }

    addAiPoint(persona, content) {
      this.aiPoints.push({ persona, content, time: Date.now() });
    }

    isUsed(key) { return this.usedArgKeys.has(key); }
    markUsed(key) { this.usedArgKeys.add(key); }

    getLastUserPoint() {
      return this.userPoints.length > 0 ? this.userPoints[this.userPoints.length - 1] : null;
    }

    _extractKeywords(text) {
      const stop = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','to','of','in','for','on','with','at','by','from','as','into','through','during','before','after','again','then','once','here','there','when','where','why','how','all','both','each','few','more','most','other','some','such','not','only','own','same','so','than','too','very','just','because','but','and','or','if','that','this','it','i','you','he','she','we','they','me','him','her','us','them','my','your','his','its','our','their','what','which','who','these','those','about','also','really','think','know','make','like','just','even','much','still','well','many','take','come','been','being','going','want','said','say','get','got']);
      return text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stop.has(w));
    }

    detectSentiment(text) {
      const lower = text.toLowerCase();
      if (['i agree','good point','exactly','you\'re right','that\'s true','fair point','absolutely','well said'].some(p => lower.includes(p))) return 'agreeing';
      if (['i disagree','that\'s wrong','no way','nonsense','ridiculous','not true','incorrect','but actually','however','on the contrary'].some(p => lower.includes(p))) return 'disagreeing';
      if (['what if','how about','wouldn\'t it','why not','don\'t you think','have you considered','what about'].some(p => lower.includes(p)) || lower.endsWith('?')) return 'questioning';
      return 'arguing';
    }
  }

  let tracker = new ArgumentTracker();
  function resetTracker() { tracker = new ArgumentTracker(); }

  // ===== FIND BEST MATCHING ARGUMENT =====
  function findRelevantArgument(userText, knowledgeArgs, desiredStance) {
    const userWords = new Set(tracker._extractKeywords(userText));
    let scored = knowledgeArgs.map((arg, idx) => {
      const key = `${arg.stance}-${idx}`;
      if (tracker.isUsed(key)) return { arg, idx, score: -100 }; // penalize reuse heavily
      let score = 0;
      // Tag match score
      arg.tags.forEach(tag => { if (userWords.has(tag)) score += 10; });
      // Partial word matches in point/evidence
      const argText = (arg.point + ' ' + (arg.evidence || '')).toLowerCase();
      userWords.forEach(w => { if (argText.includes(w)) score += 3; });
      // Stance preference
      if (arg.stance === desiredStance) score += 5;
      if (arg.stance === 'nuanced') score += 2; // nuanced is always somewhat relevant
      return { arg, idx, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (best.score <= -100) {
      // All used — pick best unused across stances
      const unused = scored.filter(s => s.score > -100);
      if (unused.length > 0) return unused[0];
      // All truly used, reset scores and pick best match ignoring used state
      return scored.reduce((a, b) => {
        const aBase = a.score + 100;
        const bBase = b.score + 100;
        return bBase > aBase ? b : a;
      });
    }
    return best;
  }

  // ===== EXTRACT USER'S KEY CLAIM =====
  function extractUserClaim(text) {
    // Strip filler prefixes
    let cleaned = text.replace(/^(well,?\s*|so,?\s*|okay,?\s*|look,?\s*|i mean,?\s*)/i, '');
    const sentences = cleaned.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    const claimWords = ['because','since','therefore','means','shows','proves','evidence','believe','think','argue','fact','data','study','clearly','actually','but','however','never','always','should','must','only'];
    let best = sentences[0] || cleaned;
    let bestScore = 0;
    sentences.forEach(s => {
      const lower = s.toLowerCase();
      let score = claimWords.filter(w => lower.includes(w)).length * 5 + Math.min(s.split(/\s+/).length, 20);
      if (score > bestScore) { bestScore = score; best = s; }
    });
    // Remove weak openers from the chosen sentence
    best = best.replace(/^(I think that |I believe that |I believe |I think |In my opinion,? ?|Honestly,? ?|To be honest,? ?)/i, '');
    // Capitalize first letter
    best = best.charAt(0).toUpperCase() + best.slice(1);
    // Smart truncation: cut at word boundary, max ~65 chars
    if (best.length > 65) {
      const words = best.split(/\s+/);
      let result = '';
      for (const w of words) {
        if ((result + ' ' + w).length > 60) break;
        result += (result ? ' ' : '') + w;
      }
      best = result;
    }
    return best;
  }

  // ===== PERSONA-SPECIFIC RESPONSE BUILDERS =====
  const PERSONA_BUILDERS = {
    'Logical Thinker': (claim, arg, sentiment, userName) => {
      const rebuttals = [
        `You said "${claim}" — but let's trace that logic through.`,
        `Your argument that "${claim}" has a structural flaw.`,
        `I hear your point about "${claim}", but the logical chain breaks down.`,
        `Interesting claim — "${claim}." Let me challenge the reasoning.`,
      ];
      const agreements = [
        `Your logic holds on "${claim}."`,
        `That's a well-structured argument about "${claim}."`,
        `"${claim}" — yes, the reasoning follows.`,
      ];
      const opener = sentiment === 'agreeing' || arg.arg.stance === 'pro'
        ? agreements[Math.floor(Math.random() * agreements.length)]
        : rebuttals[Math.floor(Math.random() * rebuttals.length)];
      return `${opener} ${arg.arg.point}. ${arg.arg.evidence}. ${arg.arg.rebuttal ? '' : 'The logical conclusion is clear.'}`;
    },

    'Data Analyst': (claim, arg, sentiment, userName) => {
      const intros = [
        `You claim "${claim}" — but what does the data actually say?`,
        `Let's fact-check your point about "${claim}" with real numbers.`,
        `"${claim}" — interesting hypothesis. Here's what the research shows.`,
        `The data on "${claim}" tells a different story than you'd expect.`,
      ];
      const agreements = [
        `The data actually supports your claim that "${claim}."`,
        `You're right about "${claim}" — and the numbers back it up.`,
        `"${claim}" — confirmed by the research.`,
      ];
      const opener = sentiment === 'agreeing' || arg.arg.stance === 'pro'
        ? agreements[Math.floor(Math.random() * agreements.length)]
        : intros[Math.floor(Math.random() * intros.length)];
      // Data Analyst ALWAYS includes evidence
      return `${opener} ${arg.arg.point}. ${arg.arg.evidence}.`;
    },

    'Aggressive Debater': (claim, arg, sentiment, userName) => {
      const attacks = [
        `"${claim}"? That's a weak argument and here's why.`,
        `No offense, but "${claim}" doesn't hold up under any scrutiny.`,
        `I'll be blunt — "${claim}" is exactly the kind of surface-level thinking that derails these debates.`,
        `You said "${claim}" — I completely disagree.`,
      ];
      const rare_agree = [
        `Fine, "${claim}" is fair. But that doesn't change the bigger picture.`,
        `I'll give you "${claim}." But you're missing the real issue.`,
      ];
      const opener = sentiment === 'agreeing' && Math.random() > 0.5
        ? rare_agree[Math.floor(Math.random() * rare_agree.length)]
        : attacks[Math.floor(Math.random() * attacks.length)];
      return `${opener} ${arg.arg.point}. ${arg.arg.evidence}. And that's not even debatable.`;
    },

    'The Visionary': (claim, arg, sentiment, userName) => {
      const intros = [
        `"${claim}" — that's thinking about today. Let me show you where this is heading.`,
        `Your point "${claim}" is valid right now, but zoom out five years.`,
        `Interesting take on "${claim}", but you're looking at a snapshot, not the trajectory.`,
        `"${claim}" might be true today. But the future is moving fast.`,
      ];
      const agreements = [
        `"${claim}" — yes, and the implications are even bigger than you realize.`,
        `You're right about "${claim}", and here's where it leads.`,
      ];
      const opener = sentiment === 'agreeing'
        ? agreements[Math.floor(Math.random() * agreements.length)]
        : intros[Math.floor(Math.random() * intros.length)];
      return `${opener} ${arg.arg.point}. ${arg.arg.evidence}.`;
    },

    'The Skeptic': (claim, arg, sentiment, userName) => {
      const intros = [
        `Hold on — "${claim}"? I need to push back on that.`,
        `"${claim}" — are we sure about that? Because I have doubts.`,
        `Before everyone accepts "${claim}" as gospel — let's question the assumptions.`,
        `"${claim}" sounds convincing, but let me poke some holes.`,
      ];
      const concessions = [
        `Alright, "${claim}" is hard to argue with. But I still have reservations.`,
        `I'll grudgingly concede "${claim}." But here's the part nobody's questioning:`,
      ];
      const opener = sentiment === 'agreeing' && Math.random() > 0.4
        ? concessions[Math.floor(Math.random() * concessions.length)]
        : intros[Math.floor(Math.random() * intros.length)];
      return `${opener} ${arg.arg.point}. ${arg.arg.evidence}.`;
    },
  };

  // ===== MAIN RESPONSE GENERATION =====
  function generateResponse(persona, topic, messages, prevAiMsg) {
    const userMsgs = messages.filter(m => !m.isAi);
    const lastUserMsg = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1] : null;

    if (!lastUserMsg) return "I'm ready to debate. Make your opening argument and let's get into it.";

    // Track user's point
    tracker.addUserPoint(lastUserMsg.content);
    const sentiment = tracker.detectSentiment(lastUserMsg.content);
    const userClaim = extractUserClaim(lastUserMsg.content);

    // Find topic knowledge or use generic
    const topicKB = TOPIC_KNOWLEDGE[topic];
    const argPool = topicKB ? topicKB.arguments : GENERIC_ARGUMENTS;

    // Determine desired stance based on persona tendency
    let desiredStance;
    const r = Math.random();
    if (persona.role === 'Aggressive Debater') desiredStance = r < 0.15 ? 'pro' : r < 0.8 ? 'con' : 'nuanced';
    else if (persona.role === 'The Skeptic') desiredStance = r < 0.1 ? 'pro' : r < 0.75 ? 'con' : 'nuanced';
    else if (persona.role === 'The Visionary') desiredStance = r < 0.55 ? 'pro' : r < 0.8 ? 'con' : 'nuanced';
    else if (persona.role === 'Data Analyst') desiredStance = r < 0.3 ? 'pro' : r < 0.6 ? 'con' : 'nuanced';
    else desiredStance = r < 0.3 ? 'pro' : r < 0.65 ? 'con' : 'nuanced';

    // Find the most relevant argument
    const match = findRelevantArgument(lastUserMsg.content, argPool, desiredStance);
    tracker.markUsed(`${match.arg.stance}-${match.idx}`);

    // Build persona-specific response
    const builder = PERSONA_BUILDERS[persona.role] || PERSONA_BUILDERS['Logical Thinker'];
    let response = builder(userClaim, match, sentiment, 'You');

    // Add cross-reference to previous AI persona (30% chance)
    if (prevAiMsg && Math.random() > 0.7) {
      const crossRefs = [
        ` And ${prevAiMsg.sender} made a good point earlier that connects here.`,
        ` I actually see this differently than ${prevAiMsg.sender} —`,
        ` Building on what ${prevAiMsg.sender} said,`,
      ];
      response += crossRefs[Math.floor(Math.random() * crossRefs.length)];
    }

    // Clean up
    response = response.replace(/\s+/g, ' ').replace(/\.\./g, '.').replace(/\.\s*,/g, ',').trim();
    tracker.addAiPoint(persona.name, response);
    return response;
  }

  // ===== PROFESSIONAL EVALUATION ENGINE =====
  function generateEvaluation(messages, topic) {
    const userMsgs = messages.filter(m => !m.isAi);
    const aiMsgs = messages.filter(m => m.isAi);
    const userCount = userMsgs.length;

    if (userCount === 0) return _emptyEvaluation();

    const allUserText = userMsgs.map(m => m.content).join(' ');
    const allUserLower = allUserText.toLowerCase();
    const wordCount = allUserText.split(/\s+/).filter(w => w.length > 0).length;
    const avgWordCount = wordCount / userCount;

    // === ARGUMENT STRENGTH (0-100) ===
    const logicWords = ['because','therefore','however','although','furthermore','moreover','consequently','thus','hence','since','given that','as a result'];
    const logicCount = logicWords.filter(w => allUserLower.includes(w)).length;
    const claimWords = ['believe','argue','think','suggest','contend','claim','assert','maintain','propose'];
    const claimCount = claimWords.filter(w => allUserLower.includes(w)).length;
    const vaguePhrases = ['i feel like','kind of','sort of','maybe','i guess','probably','whatever','stuff like that','you know'];
    const vagueCount = vaguePhrases.filter(p => allUserLower.includes(p)).length;
    let argStrength = 25;
    argStrength += Math.min(logicCount * 6, 25);
    argStrength += Math.min(claimCount * 5, 15);
    argStrength += avgWordCount > 20 ? 12 : avgWordCount > 10 ? 6 : 0;
    argStrength -= vagueCount * 8;
    argStrength += userCount > 3 ? 8 : userCount > 1 ? 4 : 0;

    // === EVIDENCE USAGE (0-100) ===
    const evidenceWords = ['example','instance','study','research','data','statistics','evidence','survey','report','according','percent','million','billion','shows','found','demonstrated'];
    const evidenceCount = evidenceWords.filter(w => allUserLower.includes(w)).length;
    const specificNames = allUserText.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g) || [];
    const numberMentions = allUserText.match(/\d+/g) || [];
    let evidenceScore = 15;
    evidenceScore += Math.min(evidenceCount * 7, 30);
    evidenceScore += Math.min(specificNames.length * 3, 15);
    evidenceScore += Math.min(numberMentions.length * 4, 20);
    if (evidenceCount === 0 && numberMentions.length === 0) evidenceScore = Math.max(evidenceScore - 15, 8);

    // === CLARITY (0-100) ===
    const transitionWords = ['firstly','secondly','first','second','additionally','in conclusion','to summarize','on the other hand','in contrast','specifically','importantly'];
    const transitionCount = transitionWords.filter(w => allUserLower.includes(w)).length;
    const sentenceCount = allUserText.split(/[.!?]+/).filter(s => s.trim().length > 5).length;
    const avgSentenceLen = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;
    let clarityScore = 30;
    clarityScore += Math.min(transitionCount * 6, 20);
    clarityScore += avgSentenceLen > 8 && avgSentenceLen < 25 ? 15 : 5;
    clarityScore += avgWordCount > 15 ? 10 : 5;
    if (avgSentenceLen > 35) clarityScore -= 10;

    // === REBUTTAL QUALITY (0-100) ===
    const rebuttalWords = ['disagree','however','but','counter','on the contrary','that\'s not','actually','while you','you said','you mentioned','your point','your argument'];
    const rebuttalCount = rebuttalWords.filter(w => allUserLower.includes(w)).length;
    const addressedAi = aiMsgs.some(ai => {
      const aiName = ai.sender.toLowerCase();
      return allUserLower.includes(aiName) || allUserLower.includes('you said') || allUserLower.includes('you mentioned');
    });
    let rebuttalScore = 15;
    rebuttalScore += Math.min(rebuttalCount * 6, 25);
    rebuttalScore += addressedAi ? 20 : 0;
    if (rebuttalCount === 0 && !addressedAi) rebuttalScore = Math.max(rebuttalScore - 10, 8);

    // === TOPIC ADHERENCE (0-100) ===
    const topicWords = topic.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const topicMentions = topicWords.filter(w => allUserLower.includes(w)).length;
    const topicRatio = topicWords.length > 0 ? topicMentions / topicWords.length : 0;
    let topicScore = 30 + Math.round(topicRatio * 40);
    topicScore += userCount > 2 ? 10 : 5;
    topicScore = Math.min(topicScore, 95);

    // === DELIVERY (0-100) ===
    const uniqueWords = new Set(allUserLower.split(/\W+/).filter(w => w.length > 2));
    const vocabDiversity = wordCount > 0 ? uniqueWords.size / wordCount : 0;
    let deliveryScore = 25;
    deliveryScore += vocabDiversity > 0.6 ? 20 : vocabDiversity > 0.4 ? 12 : 5;
    deliveryScore += avgWordCount > 25 ? 15 : avgWordCount > 15 ? 10 : 3;
    deliveryScore += userCount >= 3 ? 10 : userCount >= 2 ? 5 : 0;
    const fillerWords = ['um','uh','like','basically','literally','honestly'];
    const fillerCount = fillerWords.filter(w => (' ' + allUserLower + ' ').includes(' ' + w + ' ')).length;
    deliveryScore -= fillerCount * 3;

    // Clamp all scores
    const clamp = v => Math.max(10, Math.min(95, Math.round(v)));
    const scores = {
      argumentStrength: clamp(argStrength),
      evidenceUsage: clamp(evidenceScore),
      clarity: clamp(clarityScore),
      rebuttalQuality: clamp(rebuttalScore),
      topicAdherence: clamp(topicScore),
      delivery: clamp(deliveryScore),
    };
    const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6);

    // === WIN/LOSS VERDICT ===
    const aiArgQuality = aiMsgs.length > 0 ? 60 + Math.floor(Math.random() * 15) : 50;
    const userWon = overall >= aiArgQuality + 5;
    const draw = Math.abs(overall - aiArgQuality) <= 5;
    let verdict, verdictReason;
    if (userWon) {
      verdict = 'WON';
      verdictReason = `Your arguments were stronger overall. You scored ${overall}/100 against the AI panel's estimated ${aiArgQuality}/100. Your use of ${logicCount > 2 ? 'logical reasoning' : evidenceCount > 1 ? 'evidence' : 'active participation'} gave you the edge.`;
    } else if (draw) {
      verdict = 'DRAW';
      verdictReason = `This was a closely contested debate. You scored ${overall}/100 against an estimated ${aiArgQuality}/100. Neither side decisively outperformed the other.`;
    } else {
      verdict = 'LOST';
      verdictReason = `The AI panel presented stronger arguments overall. You scored ${overall}/100 against an estimated ${aiArgQuality}/100. ${evidenceCount < 2 ? 'Your arguments lacked concrete evidence.' : rebuttalCount < 2 ? 'You didn\'t adequately counter opposing arguments.' : 'Your delivery needed more structure and depth.'}`;
    }

    // === WEAK ARGUMENTS ===
    const weakArguments = [];
    userMsgs.forEach(m => {
      const lower = m.content.toLowerCase();
      const words = m.content.split(/\s+/).length;
      if (words < 8) {
        weakArguments.push({ quote: m.content, reason: "Too brief — this doesn't constitute a substantive argument. Aim for at least 2-3 sentences with reasoning." });
      } else if (vaguePhrases.some(p => lower.includes(p)) && !logicWords.some(w => lower.includes(w))) {
        weakArguments.push({ quote: m.content, reason: "This argument relies on vague language without logical connectors. Replace phrases like 'I feel like' with 'The evidence suggests' or 'Because...'." });
      }
    });

    // === MISSED OPPORTUNITIES ===
    const missedOpps = [];
    aiMsgs.forEach(m => {
      const hasEvidence = ['study','data','research','example','percent'].some(w => m.content.toLowerCase().includes(w));
      const wasCountered = userMsgs.some(u => u.content.toLowerCase().includes(m.sender.toLowerCase()) || u.content.toLowerCase().includes('you said'));
      if (hasEvidence && !wasCountered) {
        missedOpps.push(`When ${m.sender} argued "${m.content.substring(0, 80)}...", you didn't counter with any opposing evidence or rebuttal.`);
      }
    });

    // === LOGICAL FALLACIES ===
    const fallacies = [];
    if (allUserLower.includes('everyone knows') || allUserLower.includes('everybody agrees')) {
      fallacies.push({ name: "Appeal to Popularity", quote: "Using phrases like 'everyone knows' — popularity doesn't determine truth." });
    }
    if (allUserLower.includes('always been') || allUserLower.includes('tradition')) {
      fallacies.push({ name: "Appeal to Tradition", quote: "Arguing something is right because 'it's always been that way' is not a logical argument." });
    }
    if (userMsgs.some(m => m.content.toLowerCase().match(/they are|they're just|people who think/))) {
      fallacies.push({ name: "Potential Straw Man", quote: "Be careful not to misrepresent opposing positions — address what was actually said." });
    }

    // === SKILL FEEDBACK ===
    const feedbackFor = (name, score) => {
      if (score >= 75) return { feedback: `Excellent ${name.toLowerCase()}. You demonstrated strong command throughout.`, tip: `Push further with advanced ${name.toLowerCase()} techniques from competitive debate.` };
      if (score >= 55) return { feedback: `Adequate ${name.toLowerCase()}, but with clear room for growth. Some moments showed promise while others fell flat.`, tip: `Practice structured ${name.toLowerCase()} exercises. Focus on consistency.` };
      if (score >= 35) return { feedback: `Below average ${name.toLowerCase()}. This is a significant weakness that will be noticed in placement GDs.`, tip: `This needs dedicated practice. Study expert debate examples.` };
      return { feedback: `Critical weakness in ${name.toLowerCase()}. This area needs immediate improvement.`, tip: `Start with fundamentals and watch expert debate videos.` };
    };

    // === JUDGE SUMMARY ===
    let judgeSummary;
    if (overall >= 80) judgeSummary = "The panel finds the candidate demonstrated exceptional debate skills. Strong readiness for competitive group discussions.";
    else if (overall >= 65) judgeSummary = "The candidate shows promising ability with specific areas requiring refinement. With targeted practice, placement readiness is achievable.";
    else if (overall >= 45) judgeSummary = "The candidate has foundational understanding but significant gaps in execution. A structured improvement plan is strongly recommended.";
    else judgeSummary = "Substantial improvement needed across all dimensions. Intensive debate practice is required before placement season.";

    return {
      overallScore: overall, verdict, verdictReason, judgeSummary, scores,
      argumentStrength: { score: scores.argumentStrength, ...feedbackFor('Argument Strength', scores.argumentStrength) },
      evidenceUsage: { score: scores.evidenceUsage, ...feedbackFor('Evidence Usage', scores.evidenceUsage) },
      clarity: { score: scores.clarity, ...feedbackFor('Clarity', scores.clarity) },
      rebuttalQuality: { score: scores.rebuttalQuality, ...feedbackFor('Rebuttal Quality', scores.rebuttalQuality) },
      topicAdherence: { score: scores.topicAdherence, ...feedbackFor('Topic Adherence', scores.topicAdherence) },
      delivery: { score: scores.delivery, ...feedbackFor('Delivery', scores.delivery) },
      weakArguments: weakArguments.slice(0, 3),
      missedOpportunities: missedOpps.slice(0, 3),
      fallacies: fallacies.slice(0, 2),
      placementReadiness: overall >= 80 ? 'Ready' : overall >= 65 ? 'Almost Ready' : overall >= 45 ? 'Developing' : 'Not Ready',
    };
  }

  function _emptyEvaluation() {
    const empty = { score: 10, feedback: 'No participation detected.', tip: 'You need to actively participate to be evaluated.' };
    return {
      overallScore: 10, verdict: 'LOST', verdictReason: 'You did not participate in the debate.',
      judgeSummary: 'The panel cannot evaluate a candidate who did not participate.',
      scores: { argumentStrength:10, evidenceUsage:10, clarity:10, rebuttalQuality:10, topicAdherence:10, delivery:10 },
      argumentStrength: empty, evidenceUsage: empty, clarity: empty,
      rebuttalQuality: empty, topicAdherence: empty, delivery: empty,
      weakArguments: [], missedOpportunities: [], fallacies: [],
      placementReadiness: 'Not Ready',
    };
  }

  return { generateResponse, generateEvaluation, resetTracker };
})();
