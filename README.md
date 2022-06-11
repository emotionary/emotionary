# Emotionary :raising_hand:
### Emotionary = Emoji (이모티콘) + Pictionary (그림을 보고 무슨 단어인지 맞히는 게임)
### 그림을 이모티콘으로 변환해주는 인공지능 게임입니다.

![2022-06-12 01-55-23](https://user-images.githubusercontent.com/90196490/173197412-4e8bfe22-337e-4774-863b-329701078c3b.gif)

## :frog: Project Info
**Phaser 2 framework**와 **TensorFlow library**를 사용해 기계학습 인공지능을 구현했습니다.  
**CNN 모델**을 만들어 이미지에 최적화된 모델을 설계했습니다.  
데이터셋은 구글의 **Quick Draw Dataset**에서 추출해 제작했습니다.  
자세한 개발과정은 이슈에서 확인하실 수 있습니다.

## :bulb: Running the Game
게임을 로컬에서 실행하는 방법입니다.  
1. XAMPP 웹 서버를 설치합니다.
2. 서버 문서 루트로 이동합니다. `C:\Xampp\htdocs`
3. 'Emotionary'라는 새 폴더를 만듭니다. `C:\Xampp\htdocs\Emotionary`
4. 프로젝트를 다운로드합니다.
5. 모든 프로젝트 파일을 `C:\Xampp\htdocs\Emotionary` 에 직접 복사합니다.
6. 웹 브라우저에서 다음 url로 이동합니다. `http://localhost:<port>/Emotionary/src`
7. 게임이 실행됩니다.

## :video_game: How to Play
**화면 좌측** : 학습 결과를 보여주는 그래프입니다. 위에서부터 각각 정확도 그래프, 손실도 그래프입니다.  
**화면 중앙** : 테스트 결과를 보여줍니다. 초록색이면 예측이 잘 된 것이고, 빨간색이면 예측이 틀린 것임을 나타냅니다.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Train More 버튼을 누르면 학습을 더 진행합니다. Next Test 버튼을 누르면 테스트를 더 진행합니다.  
**화면 우측** : 그림을 그리고 Submit 버튼을 누르면 그림을 예측해 이모티콘으로 변환해줍니다.  

## :eyes: Links
Github https://www.github.com/emotionary  
Youtube https://youtube/

## :earth_africa: Authors
남채희 https://github.com/chehhy  
왕서희 https://github.com/WangSeohee  
이다미 https://github.com/Dami-LEE00  
정권영 https://github.com/hoopmad  
