# 🗣️ 말문 (Malmoon) - WebRTC 기반 언어치료 플랫폼

#### SSAFY 13기 2학기 광주 1반 communE.T (25.07.07 ~ 25.08.18)

![](/README_img/메인페이지.png)

---

## 📑 목차

* [프로젝트 개요](#-프로젝트-개요)
  * [팀원 소개](#1️⃣-팀원-소개)
  * [기획 배경](#2️⃣-기획-배경)
* [서비스 소개](#-서비스-소개)
  * [시연 영상](#1️⃣-시연-영상)
  * [서비스 화면 및 기능](#2️⃣-서비스-화면-및-기능)
* [개발 환경](#-개발-환경)
* [프로젝트 구조](#-프로젝트-구조)
* [협업 환경](#-협업-환경)
* [프로젝트 일정](#-프로젝트-일정)
* [프로젝트 산출물](#-프로젝트-산출물)
  * [API 명세서](#1️⃣-api-명세서)
  * [ERD](#2️⃣-erd)

---

## 📌 프로젝트 개요

### 1️⃣ 팀원 소개

| 정수형 | 임덕규 | 황성헌 |
|:-:|:-:|:-:|
| ![](/README_img/profile6.png) | ![](/README_img/profile5.png) | ![](/README_img/profile4.png) |
| Leader, BackEnd, Deployment | AI, BackEnd | Security, BackEnd |
| 윤지훈 | 유영훈 | 정형진 |
|:-:|:-:|:-:|
| ![](/README_img/profile2.png) | ![](/README_img/profile1.png) | ![](/README_img/profile3.png) |
| FrontEnd | FrontEnd | FrontEnd |

### 2️⃣ 기획 배경

***언어지연 및 학습 부진 아동의 치료 기회를 넓히기 위해서는 많은 장벽을 넘어야 합니다.***

>
* 가까운 곳에 언어재활센터가 없어요.
* 치료비가 너무 비싸요.
* 대기 시간 동안 치료의 골든타임을 놓치고 있어요.
...

현재, 많은 아이들이 언어치료가 필요하지만
지역 간 인프라 격차와 높은 치료비용,
그리고 이를 보조할 공적 제도의 부재로 인해 치료를 받기 어려운 상황입니다.

malmoon은 이러한 구조적인 문제를 해결하고자 만들어졌습니다.
언어치료를 <span style="color:red;">언제, 어디서나</span> 받을 수 있도록
WebRTC 기반 <span style="color:red;">실시간 비대면 언어치료</span> 서비스를 제공하며,
AI와 디지털 교구를 통해 치료의 효율성을 높입니다.

저희는 이 서비스를 통해
누구든, 어디서든, 말의 꽃을 피울 수 있도록
아이들의 치료 기회를 확장하고자 합니다.

---

## 🖥️ 서비스 소개

### 1️⃣ 시연 영상

[🔗 시연 영상 바로가기]()

### 2️⃣ 서비스 화면 및 기능

#### 1) 사이트 소개

---

## 🛠️ 개발 환경

---


## 🗂️ 프로젝트 구조

#### 🗂️  Back

```plaintext
├── 📁aac
│   ├──📁controller    # AAC(보완대체의사소통) API 엔드포인트
│   ├──📁domain        # AAC 도메인 엔티티
│   ├──📁dto           # 요청/응답 DTO
│	│	├── 📁request
│	│	└── 📁response
│   ├──📁exception     # AAC 전용 예외 정의
│   ├──📁repository    # AAC 데이터 접근 계층
│   └──📁service       # AAC 비즈니스 로직
│
├── 📁bundle
│   ├──📁controller    # AAC 묶음(bundle) 관리 API
│   ├──📁domain        # 묶음 관련 엔티티
│   ├──📁dto           # 요청/응답 DTO
│	│	├── 📁request
│	│	└── 📁response
│   ├──📁repository    # 데이터 접근 계층
│   └──📁service       # 묶음 관리 비즈니스 로직
│
├── 📁chat
│   ├──📁controller    # 채팅방/메시지 API
│   ├──📁domain        # 채팅 관련 엔티티
│   ├──📁dto           # 요청/응답 DTO
│	│	├── 📁request
│	│	└── 📁response
│   ├──📁exception     # 채팅 기능 예외 처리
│   ├──📁repository    # 채팅 데이터 접근 계층
│   └──📁service       # 채팅 비즈니스 로직
│
├── 📁common
│   ├──📁auth          # 인증/인가 관련 유틸리티
│   ├──📁config        # 글로벌 설정 클래스
│   ├──📁entity        # 공통 엔티티
│   ├──📁exception     # 공통 예외 처리
│   └──📁redis         # Redis 설정 및 유틸
│
├── 📁diagnostic
│   ├──📁client        # 외부 진단 서비스 연동 클라이언트
│   ├──📁controller    # 간편 진단 API
│   ├──📁domain        # 진단 관련 엔티티
│   ├──📁dto           # 요청/응답 DTO
│	│	├── 📁request
│	│	└── 📁response
│   ├──📁exception     # 진단 기능 예외 처리
│   ├──📁infra         # 진단 인프라 모듈
│   ├──📁repository    # 데이터 접근 계층
│   └──📁service       # 진단 비즈니스 로직
│
├── 📁external
│   └──📁fastapi       # FastAPI 서버 연동 모듈
│
├── 📁file
│   ├──📁controller    # 파일 업로드/다운로드 API
│   ├──📁domain        # 파일 관련 엔티티
│   ├──📁dto           # 응답 DTO
│	│	├── 📁request
│	│	└── 📁response
│   ├──📁infra         # AWS S3 등 외부 스토리지 연동
│   ├──📁repository    # 파일 데이터 접근 계층
│   └──📁service       # 파일 관리 비즈니스 로직
│
├── 📁filter
│   ├──📁controller    # 실시간 필터 관리 API
│   ├──📁domain        # 필터 관련 엔티티
│   ├──📁dto           # 요청/응답 DTO
│	│	├── 📁request
│	│	└── 📁response
│   ├──📁exception     # 필터 기능 예외 처리
│   ├──📁repository    # 데이터 접근 계층
│   └──📁service       # 필터 비즈니스 로직
│
├── 📁matching
│   ├──📁controller    # 치료사-아동 매칭 API
│   ├──📁domain        # 매칭 관련 엔티티
│   ├──📁dto           # 요청/응답 DTO
│	│	├── 📁request
│	│	└── 📁response
│   ├──📁repository    # 데이터 접근 계층
│   └──📁service       # 매칭 비즈니스 로직
│
├── 📁member
│   ├──📁controller    # 회원 가입/조회/수정 API
│   ├──📁domain        # 회원 엔티티
│   ├──📁dto           # 요청/응답 DTO
│	│	├── 📁request
│	│	└── 📁response
│   ├──📁exception     # 회원 기능 예외 처리
│   ├──📁jwt           # JWT 인증 모듈
│   ├──📁repository    # 회원 데이터 접근 계층
│   └──📁service       # 회원 비즈니스 로직
│
├── 📁session
│   ├──📁config        # WebRTC 세션 설정
│   ├──📁controller    # 세션 생성/종료 API
│   ├──📁dto           # 요청/응답 DTO
│	│	├── 📁request
│	│	└── 📁response
│   ├──📁exception     # 세션 예외 처리
│   └──📁service       # 세션 관리 로직
│       └──📁retry     # 세션 재시도 로직
│
└── 📁storybook
    ├──📁controller    # 동화 기반 학습 API
    ├──📁domain        # 동화 관련 엔티티
    ├──📁dto           # 요청/응답 DTO
	│	├── 📁request
	│	└── 📁response
    ├──📁repository    # 데이터 접근 계층
    └──📁service       # 동화 학습 비즈니스 로직

```

* BackEnd는 **도메인 중심 설계(Domain-Driven Design, DDD)**를 기반으로 기능별 패키지로 구분되어 있습니다.
각 기능은 controller → service → repository → domain의 계층 구조를 따르며, 요청·응답 DTO, 예외 처리, 외부 연동 모듈 등을 포함합니다.
이를 통해 유지보수성 향상, 확장성 보장, 가독성 및 역할 명확화, 테스트 용이성, 비즈니스 로직 집중 등 다양한 장점을 확보하였습니다.

#### 🗂️ Front

```plaintext
├── 📁api               # 백엔드와 통신하는 API 모듈
├── 📁assets            # 정적 자원(이미지, 아이콘 등)
│   └── 📁icons         # UI에 사용하는 아이콘 모음
├── 📁components        # 재사용 가능한 UI 컴포넌트
│   ├── 📁common        # 버튼, 입력창 등 공용 컴포넌트
│   ├── 📁modals        # 모달 창 컴포넌트
│   ├── 📁navigation    # 네비게이션 바, 메뉴 등
│   ├── 📁signup        # 회원가입 전용 UI
│   ├── 📁TherapistSession  # 치료사 세션 관련 UI
│   └── 📁TherapistToolTap  # 치료사 툴 관련 UI
├── 📁contexts          # React Context API 상태 관리
├── 📁hooks             # 커스텀 훅 모음
├── 📁logoimage         # 서비스 로고 이미지
└── 📁pages             # 페이지 단위 컴포넌트
    ├── 📁Auth          # 로그인/회원가입 등 인증 페이지
    ├── 📁signup        # 회원가입 관련 페이지
    ├── 📁Therapist     # 치료사 전용 페이지
    │    └── 📁MyPage   # 치료사 마이페이지
    └── 📁User          # 일반 사용자 페이지
        ├── 📁Booking   # 예약 관련 페이지
        └── 📁MyPage    # 사용자 마이페이지

```

* Front는 기능별 디렉토리 분리를 통해 컴포넌트 관리를 용이하게 하였으며,공용 UI와 페이지 전용 UI를 분리하여 재사용성을 확보했습니다.
또한 React Context API와 커스텀 훅을 활용해 상태 관리와 로직 재사용성을 높였고,
API 호출 모듈화로 백엔드·AI 서버와의 통신 로직 일관성을 유지하였습니다.

#### 🗂️  AI

```plaintext
├── 📁api/v1
│   ├── 📁aac         # AAC(보완대체의사소통) 이미지·데이터 생성 및 관리 API
│   ├── 📁feedback    # 치료사 피드백 생성/분석 API
│   └── 📁stt         # 음성 → 텍스트 변환(STT) API  
│ 
└── 📁static
    └── 📁temp        # 임시 파일 저장 디렉토리 (생성된 이미지·오디오·중간 결과물 보관)

```

* AI는 버전별 API 디렉토리 구조를 사용하여 기능별 모듈을 분리함으로써 유지보수성과 확장성을 확보했습니다.
또한, AI 처리 과정에서 생성되는 임시 파일을 별도의 디렉토리에 저장하고 주기적으로 정리하여 저장소 용량을 효율적으로 관리합니다.
FastAPI의 라우팅 구조를 그대로 반영해 프론트엔드와 백엔드 간 API 명세의 일관성을 유지하였습니다.

---
## 🗃️ 협업 환경

#### 1) GitLab

| ![](/README_img/협업도구_GitLab.png) |
|:-:|

GitLab 단일 레포지토리 구조를 사용하며, apps 폴더 내에서 백엔드(backend), 프론트엔드(frontend), AI 서비스(ai)를 함께 관리합니다.
이 방식으로 서비스별 코드를 한 저장소에서 통합 관리하여 버전 동기화, 브랜치 전략 일원화가 용이합니다.


| ![](/README_img/협업도구_GitLab_브랜치전략.png) |
|:-:|

GitLab 브랜치 전략을 통해 각 기능·수정 사항별로 브랜치를 생성하여 개발을 진행합니다.
develop 브랜치를 중심으로, UI 수정(style/*), 기능 개발(feature/*), 버그 수정(fix/*) 등 목적에 맞는 브랜치를 생성하고 작업 완료 후 Merge Request를 통해 코드 리뷰와 병합을 진행했습니다.


|![](/README_img/협업도구_GitLab_MR양식.png)|
|:-:|

또한, 커밋 메시지 규칙과 Merge Request(MR) 작성 양식을 사전에 정의하여 관리하였습니다.
이를 통해 코드 변경 사항의 의도와 범위를 명확히 기록하고, 리뷰어가 변경 내용을 빠르게 이해할 수 있도록 하였습니다.

#### 2) Jira

|![](/README_img/협업도구_Jira.png)|
|:-:|

프로젝트 전반의 작업 계획, 진행 상황, 완료 현황을 Jira를 통해 관리하였습니다.
스프린트 단위로 업무를 계획하고, 할 일(To Do) → 진행 중(In Progress) → 완료(Done) 단계로 작업 상태를 관리했습니다.
에픽(Epic)과 스토리(Story) 단위로 이슈를 세분화하여, 백엔드(BE), 프론트엔드(FE), AI 각 파트의 진행 상황을 한눈에 파악할 수 있도록 구성하였습니다.

#### 3) Notion

|![](/README_img/협업도구_Notion.png|
|:-:|

프로젝트 전반의 문서화와 정보 공유를 위해 Notion을 사용하였습니다.
프로젝트 개요, 요구사항, 시스템 설계, API 명세 등 개발에 필요한 모든 문서를 구조적으로 정리하였고,
운영 산출물(브랜치 전략, 테스트 계획, 발표 자료, 회고)도 함께 관리하여 팀원 간 정보 접근성과 협업 효율성을 높였습니다.

---

## 🗓️ 프로젝트 일정

| ![]() |
|:-:|

---

## 🧾 프로젝트 산출물

### 1️⃣ API 명세서

|![]()|
|:-:|

***

### 2️⃣ ERD

|![]()|
|:-:|