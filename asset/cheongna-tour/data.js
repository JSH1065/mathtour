(() => {
const base='asset/cheongna-tour/';
const photos={
 entrance:{"title": "청라호수공원 입구", "src": "asset/cheongna-tour/entry-real-photo.webp", "text": "파란 영문 글자와 소나무, 기와 담장이 있는 실제 입구예요.", "credit": "사진 · 한국관광공사 대한민국 구석구석", "source": "https://blog.naver.com/korea_diary/222850697168"},
 parkWalk:{"title": "도시 속에서 만나는 자연", "src": "asset/cheongna-tour/park-walk-photo.webp", "text": "청라호수공원은 호수를 중심으로 산책길과 쉼터가 이어지는 공원이에요. 나무 사이로 천천히 걸어 볼까요?", "credit": "사진·소개 · 인천투어", "source": "https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA22011211043221764"},
 parkReeds:{"title": "바람을 따라 걷는 길", "src": "asset/cheongna-tour/park-reeds-photo.webp", "text": "풀숲 사이로 나무 데크가 이어져요. 가을바람에 흔들리는 억새와 갈대를 가까이에서 살펴봐요.", "credit": "사진·소개 · 인천투어", "source": "https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA22011211043221764"},
 parkAutumn:{"title": "계절마다 달라지는 풍경", "src": "asset/cheongna-tour/park-autumn-photo.webp", "text": "가을에는 단풍과 풀꽃이 공원을 물들여요. 잔디마당과 쉼터에서 쉬며 계절의 색을 찾아보세요.", "credit": "사진·소개 · 인천투어", "source": "https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA22011211043221764"},
 park:{title:'도시 한가운데 펼쳐진 호수',src:base+'park-photo.webp',text:'호수와 섬 사이로 산책로가 이어져요. 물가를 따라 걸으며 오늘의 여행지를 찾아봐요.',credit:'사진 · 인천시설공단',source:'https://www.insiseol.or.kr/park/cheongna/facility/lake.jsp'},
 pavilion:{title:'청라루와 바둑판 광장',src:'asset/cheongna-baduk/reference-aerial.webp',text:'호수를 바라보는 누각 청라루 옆에는 커다란 바둑돌이 놓인 광장이 있어요. 밤에는 바닥의 격자를 따라 불빛이 켜져요. 돌의 모양과 광장의 가로·세로 줄을 살펴봐요.',credit:'사진 · 제공 자료 / 장소 소개 · 인천투어',source:'https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA23082514254900148'},
 fountain:{title:'음악과 물줄기가 만나는 밤',src:base+'fountain-photo.webp',text:'긴 물줄기가 보랏빛으로 물들었어요. 음악과 조명이 어우러지는 호수의 밤을 바라봐요.',credit:'사진 · 사용자 제공 / 장소 안내 · 인천시설공단',source:'https://www.insiseol.or.kr/park/cheongna/facility/lake.jsp'},
 lakeDay:{title:'호수 위에 놓인 음악분수',src:base+'lake-day-photo.webp',text:'음악에 맞춰 물줄기가 춤추는 곳이에요. 낮에는 물 위에 길게 놓인 분수 시설을 볼 수 있어요.',credit:'사진 · 사용자 제공 / 장소 안내 · 인천시설공단',source:'https://www.insiseol.or.kr/park/cheongna/facility/lake.jsp'},
 stones:{title:'우리 몸만 한 바둑돌',src:'asset/cheongna-baduk/reference-day.webp',text:'검은 돌과 흰 돌이 커다란 바둑판 위에 놓여 있어요. 가로줄과 세로줄을 눈으로 따라가 볼까요?',credit:'사진 · 사용자 제공 / 장소 안내 · 인천투어',source:'https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA23082514254900148'},
 plazaNight:{title:'청라루 옆에 켜진 불빛',src:'asset/cheongna-baduk/reference-plaza.webp',text:'청라루 바로 옆 바둑판 광장에 불이 켜졌어요. 누각과 광장이 나란히 있는 실제 모습을 살펴봐요.',credit:'사진 · 사용자 제공 / 장소 안내 · 인천투어',source:'https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA23082514254900148'},
 badukNight:{title:'금빛으로 빛나는 바둑판 광장',src:'asset/cheongna-baduk/reference-night.webp',text:'실제 광장도 바닥의 격자를 따라 금빛으로 빛나요! 우리가 밝힌 게임 속 광장과 비교해 보세요.',credit:'사진 · 사용자 제공 (사진 표기: Happy Tree) / 장소 안내 · 인천투어',source:'https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA23082514254900148'},
 fountainBlue:{title:'푸른빛 음악분수',src:base+'fountain-blue-photo.webp',text:'밤에는 색색의 조명이 물줄기를 밝혀요. 호숫가에 모여 함께 공연을 즐기는 모습을 살펴봐요.',credit:'사진 · 사용자 제공 / 장소 안내 · 인천시설공단',source:'https://www.insiseol.or.kr/park/cheongna/facility/lake.jsp'}
};
const galleries={
 intro:['parkWalk','parkReeds','parkAutumn'],
 park:['parkWalk','parkReeds','parkAutumn'],
 pavilion:['pavilion','stones','plazaNight','badukNight'],
 pavilionNight:['badukNight','plazaNight','pavilion'],
 fountain:['lakeDay','fountainBlue','fountain'],
 all:['entrance','parkWalk','parkReeds','parkAutumn','park','lakeDay','pavilion','stones','badukNight','plazaNight','fountainBlue','fountain']
};
const talk=(id,art,tag,photo,lines,button)=>({id,type:'story',art:base+art+'.webp',tag,photo,lines,button});
const steps=[
 {id:'arrival',type:'arrival'},
 talk('welcome','welcome-north-v2','청라호수공원 북쪽 입구 · 마지막 정류장','entrance',[
 ['민우','박물관과 세어도·정서진에서 찾은 빛도 반짝이고 있어. 파란 글자가 있는 이곳이 청라호수공원 입구구나!'],
 ['서연','소나무 뒤로 기와를 얹은 낮은 담장도 보여. 공원 안으로 들어가면 호숫가 길에서 청라루와 음악분수를 만날 수 있대.'],
 ['민우','저녁바람이 시원하다! 먼저 공원의 실제 모습을 살펴보고 청라루로 가 보자.']],'공원 둘러보기 →'),
 {id:'parkPhoto',type:'photo',photo:'park'},
 talk('pavilion','pavilion-evening','청라루 · 불빛을 기다리는 광장','plazaNight',[
 ['민우','높은 건물들 앞에 이런 누각이 있다니! 옆에는 우리 몸만 한 바둑돌도 있어.'],
 ['서연','이 누각이 청라루야. 바둑판 광장과 나란히 호수를 바라보고 있네. 그런데 아직 바닥의 불빛은 꺼져 있어.'],
 ['민우','수첩에 문장이 나타났어. “같은 줄의 돌을 뛰어넘어, 흩어진 빛을 하나로 모아 주세요.”'],
 ['서연','가로와 세로를 잘 살펴보자. 바둑 규칙을 몰라도 괜찮아. 움직이는 방법부터 함께 알아보자!']],'바둑돌의 빛을 모아라 →'),
 {id:'baduk',type:'activity',game:'baduk'},
 talk('pavilionLit','pavilion-lit','청라루에 돌아온 금빛','plazaNight',[
 ['민우','마지막 돌 하나에 빛이 모였어! 바닥의 선을 따라 청라루까지 환하게 켜지네.'],
 ['서연','바로 다음 수만 보지 않고, 그다음에 남을 돌도 생각하니까 길이 보였어.'],
 ['민우','호수에 비친 불빛도 예쁘다. 음악분수에서는 어떤 빛을 만날 수 있을까?'],
 ['서연','음악분수의 야경도 유명하대. 소나무와 잔디 계단을 지나, 호숫가 산책로를 따라 함께 걸어가 보자!']],'음악분수로 걸어가기 →'),
 {id:'walk',type:'walk'},
 talk('fountain','fountain-evening','음악분수 · 우리가 만드는 공연','fountain',[
 ['민우','음악분수에 도착했어! 잠깐, 빛의 수첩에 악보가 나타났어. 스물네 개의 박 구슬도 보여!'],
 ['서연','악보 위에 “24박을 6마디에 똑같이 나누세요.”라고 적혀 있어. 우리가 공연할 악보인가 봐!'],
 ['민우','일단 박 구슬을 악보의 여섯 마디에 똑같이 나눠 보자. 각 마디에는 몇 박이 필요할까?'],
 ['서연','그다음은 1박·2박·4박 블록을 조합하는 거야. 여섯 마디가 서로 중복되지 않게, 블록이나 순서를 다르게 만들어 보자!']],'음악분수 악보 만들기 →'),
 {id:'fountainGame',type:'activity',game:'fountain'},
 talk('night','fountain-midnight','여섯 마디가 밝힌 호수의 밤','fountain',[
 ['민우','같은 4박인데도 여섯 마디가 모두 다르게 들렸어! 물줄기도 악보에 맞춰 춤을 췄네.'],
 ['서연','24를 6으로 나누니 한 마디에 4박. 같은 길이 안에서도 순서를 바꾸면 새로운 리듬이 되었지.'],
 ['민우','바둑판에서 모은 빛과 음악분수의 빛이 하나가 되고 있어!'],
 ['서연','우리가 직접 생각하고 만들어 낸 청라호수공원의 빛이야. 이제 수첩에 담아 여행을 완성하자.']],'수학의 빛을 수첩에 담기 →'),
 {id:'capture',type:'capture'},
 {id:'recap',type:'recap'}
];
window.CheongnaTourData={photos,galleries,steps};
})();
