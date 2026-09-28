(function(root){
 const tourism='https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA25092914433223134',millSource='https://www.ganghwa.go.kr/open_content/tour/tour/tourInfoDetail.do?tour_seq=156&tourdiv=all',springSource='https://www.ganghwa.go.kr/hwagae/forest/tourism/tour4.jsp';
 const photos={
  temple:{file:'temple-photo.webp',title:'숲속에 자리한 보문사',text:'석모도 낙가산에 자리한 보문사예요. 기와지붕과 단청, 나무 사이로 이어진 돌계단을 살펴보세요.',source:tourism,credit:'인천관광공사 · 인천투어'},
  mill:{file:'mill-photo.webp',title:'사람들의 식사를 준비하던 맷돌',text:'보문사의 승려와 신도들이 취사에 사용하던 맷돌이에요. 지름 약 69cm로 일반 맷돌보다 큽니다. 석실 앞 삼성각 계단 옆에 있어요.',source:millSource,credit:'강화군 문화관광 · 공공누리 출처표시·상업용금지'},
  steps:{file:'steps-photo.webp',title:'마애불로 이어지는 418계단',text:'극락보전 옆 계단을 따라 오르면 눈썹바위 아래의 마애불을 만나요. 숲과 연등 사이로 올라가는 길이에요.',source:tourism,credit:'인천관광공사 · 인천투어'},
  maae:{file:'view-photo.webp',title:'눈썹바위 아래의 마애관세음보살좌상',text:'커다란 바위 면에 불상을 새겼어요. 머리 위로 돌출된 바위와 불상 뒤의 둥근 윤곽을 천천히 관찰해 보세요.',source:tourism,credit:'인천관광공사 · 인천투어'},
  spring:{file:'spring-photo.webp',title:'바다 곁의 석모도 미네랄 온천',text:'노천탕에서 서해와 석양을 바라볼 수 있는 온천이에요. 돌로 둘러싼 탕, 나무 데크, 바다의 수평선을 찾아보세요.',source:springSource,credit:'강화군 · 석모도 미네랄 온천 안내'},
  sea:{file:'sea-photo.webp',title:'지하의 물과 바다 풍경이 만나는 곳',text:'지하 460m의 화강암 등에서 용출하는 약 51℃의 온천수가 이곳의 특징이에요. 게임에서는 지하의 깊이를 음수 좌표로 표현해 볼 거예요.',source:springSource,credit:'강화군 · 석모도 미네랄 온천 안내'}
 };
 const story=(title,art,photo,lines,dim=false)=>({type:'story',title,art,photo,lines,dim});
 const photo=(ids)=>({type:'photos',ids});const lesson=id=>({type:'lesson',id});const game=id=>({type:'game',id});
 const lessons={
  mill:{title:'한 바퀴의 비밀, 360°',lead:'맷돌에서 떠오른 빛의 모형을 돌려요.',math:'3<i>x</i> = 180° → <i>x</i> = 60°',text:'같은 각 3개가 180°라면 하나는 60°예요. 네 번 돌린 각의 합이 360°가 되면 한 바퀴를 완성해요.',how:'큰 각도 버튼을 누르거나 원 둘레를 만져 회전각을 정해요. 「빛 맞추기」로 확인해요.',art:'courtyard'},
  stairs:{title:'옆으로 간 만큼, 얼마나 올라갈까?',lead:'계단을 따라가는 빛의 길을 연결해요.',math:'기울기 = 올라간 칸 ÷ 오른쪽으로 간 칸',text:'예를 들어 오른쪽으로 4칸, 위로 4칸이면 기울기는 1이에요. y절편은 빛이 출발하는 y축 위 높이예요.',how:'기울기 카드를 눌러 빛의 길을 바꾸고 별에 닿게 해요. 세 구간을 차례로 이어요.',art:'courtyard'},
  halo:{title:'모양은 그대로, 크기는 같은 비율로',lead:'광배에서 찾은 닮음으로 빛을 모아요.',math:'원래 : 확대 = 2 : 3',text:'대응하는 길이를 모두 3/2배 하면 모양이 같아요. 수첩 속 가로 6칸, 세로 8칸의 빛을 같은 비율로 키워요.',how:'확대 비율을 눌러 점선 윤곽에 겹쳐요. 가로와 세로가 함께 바뀌는지 살펴보세요.',art:'maae'},
  coords:{title:'좌표는 가로 먼저, 세로 다음',lead:'노을 속 세 가지 풍경을 찾아요.',math:'(<i>x</i>, <i>y</i>) = (가로 위치, 세로 위치)',text:'왼쪽 아래 (0, 0)에서 출발해요. (2, 6)은 오른쪽으로 2칸, 위로 6칸이에요.',how:'안내된 좌표의 격자점을 톡 누르고 「풍경 찾기」로 확인해요. 방향 버튼으로 한 칸씩 옮겨도 돼요.',art:'onsen'},
  pipes:{title:'온천수를 잇는 일차함수',lead:'배관을 놓아 두 밸브를 지나 온천까지 연결해요.',math:'<i>y</i> = <i>ax</i> + <i>b</i>',text:'기울기 a는 y의 변화 ÷ x의 변화예요. 왼쪽으로 가면 x의 변화는 음수예요. 지표면은 y = 0, 아래 −10칸은 지하 460m로 정했어요.',how:'① 다음 지점 누르기 ② 기울기 고르기 ③ 배관 연결. 바위를 피하고 1번·2번 밸브를 지나 온천으로 가요.',art:'onsen'}
 };
 const courses={
 bomunsa:{number:1,title:'보문사',student:'장은성',subtitle:'돌에 새겨진 빛',art:'courtyard',missions:['mill','stairs','halo'],steps:[
  {type:'arrival'},
  story('보문사 도착 · 돌에 새겨진 빛','courtyard','temple',[
   ['민우','이번 정류장은 보문사! 버스 창밖으로 보던 바다가 나무 사이에도 보여.'],
   ['서연','여기는 강화군 석모도의 낙가산에 자리한 절이야. 경내를 둘러보고 418계단을 올라 마애불도 만나 보자.'],
   ['민우','그런데 수첩 속 보문사가 어두워. 둥근 빛이 흩어져 버렸나 봐.'],
   ['서연','돌에 숨은 수학의 단서를 찾아보자. 맷돌부터 천천히 살펴보는 거야.']
  ],true),photo(['temple','mill']),
  story('맷돌 앞 · 첫 번째 단서','courtyard','mill',[
   ['민우','둥근 돌 두 개가 포개져 있네. 옛날에는 이걸 돌려 곡식을 갈았겠지?'],
   ['서연','수첩에 맷돌 모양의 빛이 나타났어! 네 번의 회전이 한 바퀴가 되면 첫 빛이 모인대.'],
   ['민우','실제 맷돌은 그대로 두고 수첩 속 손잡이를 돌려 보자. 각도를 알아내면 되겠네!']
  ],true),lesson('mill'),game('mill'),
  story('숲길 · 계단으로 이어진 빛','courtyard','steps',[
   ['민우','네 번 돌린 각을 더하니 360°! 첫 빛이 숲길을 가리키고 있어.'],
   ['서연','이제 마애불로 가는 418계단이야. 먼저 실제 계단 사진을 보고 출발하자.'],
   ['민우','수첩의 빛도 계단처럼 올라가네. 높이와 기울기를 맞춰 길을 이어 보자.']
  ]),photo(['steps']),lesson('stairs'),game('stairs'),
  story('눈썹바위 · 같은 모양의 빛','maae','maae',[
   ['민우','빛의 길을 따라 올라왔어. 바위에 이렇게 큰 불상이 새겨져 있다니!'],
   ['서연','눈썹처럼 나온 바위 아래에 있는 마애관세음보살좌상이야. 뒤쪽 둥근 빛의 윤곽도 보여?'],
   ['민우','수첩에 작은 빛과 큰 윤곽이 나타났어. 모양은 같고 크기만 다르네.'],
   ['서연','닮음을 이용해 가로와 세로를 같은 비율로 키우면 흩어진 빛이 모일 것 같아.']
  ],true),photo(['maae']),lesson('halo'),game('halo'),
  story('보문사 · 다시 모인 수학의 빛','maae','maae',[
   ['민우','빛이 딱 맞았어! 가로 6칸은 9칸, 세로 8칸은 12칸이 되었네.'],
   ['서연','두 길이를 모두 3/2배 해서 같은 모양이 된 거야. 보문사의 빛을 찾았어!'],
   ['민우','수첩에 다음 신호가 떴어. 같은 석모도에 있는 온천인데, 물길이 끊겨 있대.'],
   ['서연','산을 내려가 버스를 타자. 이번에는 바다 곁의 온천에 빛을 전해 주는 거야.']
  ]),{type:'departure'}, {type:'recap'}
 ]},
 seokmodo:{number:2,title:'석모도 미네랄 온천',student:'김주원',subtitle:'땅속에서 바다까지',art:'onsen',missions:['coords','pipes'],steps:[
  {type:'arrival'},story('석모도 온천 도착 · 바다 곁의 쉼터','onsen','spring',[
   ['민우','이번 정류장은 석모도 미네랄 온천! 보문사에서 찾은 빛을 가지고 왔어.'],
   ['서연','노천탕에 앉아 서해와 석양을 바라볼 수 있는 곳이야. 따뜻한 물은 땅속에서 올라온대.'],
   ['민우','그런데 수첩 속 온천은 물이 멈춰 있어. 바다에 비친 빛도 흐릿하고.'],
   ['서연','먼저 풍경을 살펴보고 빛의 좌표를 찾자. 그 빛으로 땅속 물길을 들여다볼 수 있을 거야.']
  ],true),photo(['spring','sea']),
  story('노을 전망 · 빛이 머무는 자리','onsen','spring',[
   ['민우','수첩의 풍경 위에 가로선과 세로선이 생겼어. 구름과 갈매기를 찾아 달래.'],
   ['서연','좌표를 쓰면 위치를 정확하게 알려줄 수 있어. 가로 위치를 먼저 읽고, 세로 위치를 읽어 보자.']
  ]),lesson('coords'),game('coords'),
  story('온천 데크 · 땅속으로 이어지는 지도','onsen','sea',[
   ['민우','세 자리의 빛을 찾았더니 수첩에 땅속 지도가 나타났어! 물이 시작되는 곳도 보여.'],
   ['서연','이 온천은 지하 460m의 화강암 등에서 나오는 물이 특징이야. 수첩에서는 −10칸을 그 깊이로 정했어.'],
   ['민우','바위 사이로 배관을 이어야 하네. 1번과 2번 밸브를 지나 온천으로 연결하자.'],
   ['서연','직선 배관은 일차함수로 나타낼 수 있어. 지점을 누르고 기울기를 골라 물길을 만들어 보자.']
  ],true),lesson('pipes'),game('pipes'),
  story('석모도 · 땅속에서 올라온 빛','onsen','spring',[
   ['민우','온천까지 물이 올라왔어! 땅속의 빛이 따뜻한 물을 따라 반짝이고 있어.'],
   ['서연','높이가 어떻게 변하는지 살펴 기울기를 정했지. 식이 실제로 이어지는 길이 되었어.'],
   ['민우','보문사의 돌에 숨은 빛과 온천의 물길에서 찾은 빛, 두 개가 수첩에 모였어.'],
   ['서연','이제 버스로 돌아가자. 바다 너머 영종도로 이어질 다음 여행을 준비하는 거야!']
  ]),{type:'departure'},{type:'recap'}
 ]}
 };
 root.IslandTourData={photos,lessons,courses};
})(window);
