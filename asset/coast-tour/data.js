(() => {
  const base='asset/coast-tour/';
  const islandSource='https://itour.incheon.go.kr/ssst/ssst/detail.do?cotId=ITD22010415582201275';
  const sunsetSource='https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA24121115092826324';
  const photos={
    island:{file:'island-12.webp',title:'배를 타고 만나는 섬, 세어도',text:'인천 앞바다에는 배를 타고 들어가는 작은 섬, 세어도가 있어요. 도심의 풍경에서 조금 벗어나면 갯벌과 숲, 바닷길을 만날 수 있지요.',look:'섬 이름이 적힌 표지 너머로 바다와 먼 육지의 모습을 찾아보세요.',source:islandSource},
    walk:{file:'island-1.webp',title:'갯벌 곁을 걷는 목재 산책로',text:'세어도에는 바닷가를 따라 이어지는 산책로가 있어요. 나무 난간 옆으로는 넓은 갯벌이, 반대편으로는 푸른 숲이 펼쳐져요.',look:'밀물과 썰물에 따라 달라지는 바닷가예요. 갯벌로 내려가지 않고 산책로에서 관찰해요.',source:islandSource},
    rest:{file:'island-5.webp',title:'잠시 쉬며 바라보는 바닷길',text:'조선 시대에는 세금으로 거둔 곡식을 실은 배들이 이 일대 바닷길을 지나 서울로 향했어요. 오늘은 정자와 숲길에서 섬의 풍경을 천천히 만날 수 있어요.',look:'옛 배들이 지나갔을 바다를 떠올려 보세요. 우리도 돌아갈 배를 타러 선착장으로 가 볼까요?',source:islandSource},
    plaza:{file:'sunset-5.webp',title:'서쪽 바다의 일몰 명소, 정서진',text:'정서진은 서울 광화문을 기준으로 서쪽에 있다는 의미를 담은 곳이에요. 아라뱃길과 서해가 만나는 이곳은 바다 너머로 지는 해를 바라보는 명소예요.',look:'작은 조약돌을 크게 키운 듯한 하얀 조형물을 찾아보세요.',source:'https://itour.incheon.go.kr/ssst/ssst/detail.do?cotId=ITD21122817455522438'},
    tower:{file:'sunset-4.webp',title:'아라타워와 바다를 함께',text:'정서진 광장 근처에는 아라타워와 아라 인천여객터미널이 있어요. 바다와 수로가 만나는 풍경, 독특한 건축물까지 함께 둘러볼 수 있지요.',look:'높이 솟은 아라타워와 기울어진 지붕의 모양을 눈으로 따라가 보세요.',source:sunsetSource},
    sunset:{file:'sunset-1.webp',title:'노을종에 담긴 저녁빛',text:'노을종은 갯벌의 조약돌을 모티브로 만든 조형물이에요. 가운데 종 모양의 빈 공간으로 보이는 하늘과 노을이 시간에 따라 다른 모습을 보여 줘요.',look:'같은 풍경도 언제 관찰하느냐에 따라 달라져요. 오늘 우리의 관측 기록에는 어떤 시각이 남을까요?',source:sunsetSource}
  };
  for(const p of Object.values(photos)){p.src=base+p.file;p.credit='사진 · 인천투어(인천관광공사)';}
  const scenes={pier:{art:base+'pier-art.webp',title:'육지 선착장',photo:null},island:{art:base+'island-art.webp',title:'세어도 바닷가 산책로',photo:'walk'},plaza:{art:base+'plaza-art.webp',title:'정서진 광장',photo:'plaza'},observation:{art:base+'observation-art.webp',title:'정서진 노을 관측',photo:'sunset'},dusk:{art:base+'observation-reward.webp',title:'노을이 남긴 빛',photo:'sunset'}};
  const story=(id,scene,tag,lines,button='다음 장소로 →')=>({id,type:'story',scene,tag,lines,button});
  const steps=[
    {id:'arrival',type:'arrival'},
    story('pierTalk','pier','바닷길로 이어지는 여행',[
      ['민우','박물관의 빛을 수첩에 담았어. 이번에는 바다에서 수학의 빛을 찾아보자!'],
      ['서연','먼저 배를 타고 세어도에 갈 거야. 섬을 둘러본 뒤에는 다시 배를 타고 정서진의 노을을 만나러 가자.'],
      ['민우','버스는 육지에 두고, 우리는 준비된 배편으로 출발!']],'세어도행 배에 오르기 →'),
    {id:'outbound',type:'boat',destination:'island',title:'세어도 선착장에 도착합니다.',text:'바닷바람을 가르며 세어도에 다가왔어요.',button:'세어도에서 배 내리기 →'},
    {id:'islandPhoto',type:'photos',photo:'island',stop:'세어도에 도착'},
    story('islandTalk','island','세어도 · 바다와 숲 사이',[
      ['민우','갯벌이 정말 넓다! 나무 산책로를 따라 걸으니까 바다 바로 옆을 여행하는 기분이야.'],
      ['서연','숲과 갈대, 바다를 함께 볼 수 있는 곳이래. 잠시 멈춰서 섬의 풍경부터 살펴보자.']],'섬 둘러보기 →'),
    {id:'walkPhoto',type:'photos',photo:'walk',stop:'갯벌 곁 산책'},
    {id:'restPhoto',type:'photos',photo:'rest',stop:'바닷길의 기억'},
    story('signTalk','island','선착장으로 돌아가는 길',[
      ['민우','돌아갈 시간이네. 그런데 선착장 안내 팻말의 글자 조각이 뒤섞여 있어!'],
      ['서연','바람에 흔들렸나 봐. 수첩에 남은 팻말 모습을 보고 다시 맞춰 보자.'],
      ['민우','조각을 빼거나 돌리지 않고, 빈칸 옆의 조각을 밀면 되는구나.'],
      ['서연','맞아. 조각의 모양과 방향은 그대로 두고 위치만 옮기는 거야. 빈칸을 어디로 옮길지 먼저 생각해 봐!']],'팻말 앞에 서기 →'),
    {id:'puzzle',type:'puzzle'},
    story('signDone','island','팻말에 돌아온 작은 빛',[
      ['민우','인천 세어도 선착장! 이제 글자가 제대로 이어졌어.'],
      ['서연','맞출 조각뿐 아니라 빈칸의 위치도 생각하니 길이 보였어. 팻말의 작은 빛도 수첩으로 들어왔네.'],
      ['민우','이 팻말을 따라 선착장으로 가자. 다음은 정서진의 노을이야!']],'육지로 돌아가는 배 타기 →'),
    {id:'returnBoat',type:'boat',destination:'mainland',title:'다시 배를 타고, 정서진으로.',text:'세어도를 뒤로하고 노을을 만나러 떠나요.',button:'정서진 방면 선착장에서 내리기 →'},
    story('toPlaza','plaza','배에서 내려, 정서진 광장으로',[['민우','배에서 내리니 하늘이 벌써 노랗게 물들고 있어. 바닷바람도 조금 달라진 것 같아.'],['서연','이제 정서진 광장을 둘러보자. 노을종 너머로 지는 해를 함께 기다려 보자!']],'정서진 둘러보기 →'),
    {id:'plazaPhoto',type:'photos',photo:'plaza',stop:'서쪽 바다에 도착'},
    {id:'towerPhoto',type:'photos',photo:'tower',stop:'광장 둘러보기'},
    story('plazaTalk','plaza','정서진 · 노을을 기다리며',[
      ['민우','커다란 돌 가운데가 종처럼 뚫려 있어! 실제로 보니 모양이 더 특별하다.'],
      ['서연','이름도 노을종이래. 조약돌에서 떠올린 모양이라니, 바닷가와 참 잘 어울리지?'],
      ['민우','해가 내려가고 있어. 같은 자리에서 잠깐만 기다려도 풍경이 달라지겠는데?']],'노을종의 실제 풍경 보기 →'),
    {id:'sunsetPhoto',type:'photos',photo:'sunset',stop:'저녁빛 관찰'},
    story('recordTalk','observation','노을 관측 · 시간을 남기는 방법',[
      ['서연','수첩에 오래된 관측 기록이 나타났어. 해가 수평선에 닿기 시작한 시각은 오후 6시 45분 20초래.'],
      ['민우','완전히 사라지기까지 2분 50초가 걸렸다고 적혀 있어. 그런데 마지막 시각이 비어 있네.'],
      ['서연','시작 시각에 걸린 시간을 더하면 돼. 초가 60이 되면 1분으로 바꾸고, 남은 초를 이어서 세어 보자.'],
      ['민우','먼저 계산한 다음, 마지막 시각의 분과 초를 직접 맞춰 보자. 시계를 움직이면 그때의 노을도 함께 볼 수 있어!']],'관측 시계 열기 →'),
    {id:'sunset',type:'sunset'},
    story('lightTalk','dusk','수첩에 담긴 노을빛',[
      ['민우','오후 6시 48분 10초! 20초에 50초를 더한 70초는 1분 10초였어.'],
      ['서연','그래서 45분에 2분을 더하고, 초에서 바꾼 1분을 더했지. 시간이 어떻게 흘렀는지 정확히 남겼어.'],
      ['민우','해는 졌는데 수첩에 담긴 노을빛은 남아 있어! 세어도의 길을 찾은 빛과 하나가 됐네.'],
      ['서연','우리가 보고, 움직이고, 기록하며 찾은 수학의 빛이야. 이 빛을 가지고 다음 여행도 이어 가자.']],'빛을 담고 버스에 오르기 →'),
    {id:'departure',type:'departure'},
    {id:'recap',type:'recap'}
  ];
  window.CoastTourData={photos,scenes,steps,index:id=>steps.findIndex(s=>s.id===id)};
})();
