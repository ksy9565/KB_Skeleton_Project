# 💰 Online Household Ledger

> **부트캠프 프론트엔드 기초 역량 강화를 위한 가계부 서비스 프로젝트**

본 프로젝트는 프론트엔드의 전반적인 구조(Skeleton)를 이해하고, 팀원들과의 원활한 협업 프로세스를 익히기 위해 진행되었습니다.

## 1. 프로젝트 개요

- **진행 기간**: 2026.04.07 ~ 2026.04.13 (7일)
- **목표**:
  - Vue.js, JavaScript 등을 활용한 컴포넌트 기반 설계 이해 및 구현
  - Git을 활용한 팀 협업 및 코드 리뷰 경험
  - 입력, 조회, 삭제 등 기본적인 CRUD 로직 이해

## 2. 기술 스택

- **Language**: JavaScript (ES6+)
- **Framework/Library**: Vue.js
- **Styling**: BootStrap / FontAwesome
- **Tooling**: Vite
- **Design**: Figma
- **Collaboration**: [GitHub](https://github.com/ksy9565/KB_Skeleton_Project), Slack, [Notion](https://www.notion.so/4-191773dc4068824a8fca812274d990b9).

## 3. 핵심 기능 (Features)

온라인 가계부의 핵심 기능

- **가계부 내역 조회**: 월별 지출/수입 내역 리스트 렌더링
- **내역 추가 및 삭제**: Form을 통한 데이터 생성 및 상태 업데이트
- **필터링 기능**: 수입/지출 선택적 보기 기능
- **통계 요약**: 총 수입, 총 지출, 잔액 자동 계산

## 4. 프로젝트 구조 (Directory Structure)

```Plaintext
src/
 ┣ components/    # 재사용 가능한 UI 컴포넌트
 ┣ pages/         # 주요 페이지 구성 (Home, Stats 등)
 ┣ styles/        # 전역 스타일 및 공통 테마
 ┣ utils/         # 공통 함수 (금액 포맷팅 등)
 ┣ App.js         # 메인 라우터 및 상태 관리
 ┗ main.js        # 엔트리 포인트
```

## 5. 팀원 소개 및 역할

| 이름(GitHub ID)                   | 역할 | 주요 구현 내용 |
| --------------------------------- | ---- | -------------- |
| 김세영(ksy9565@gmail.com)         | 팀장 |
| 최이초(choeyicho1105@gmail.com)   | 팀원 |
| 정준(jjeong2.001102@gmail.com)    | 팀원 |
| 주진영(joojinyoung1027@gmail.com) | 팀원 |

## 6. 협업 컨벤션

**🛠 Git Branch Strategy**

- `main` : 배포 가능한 상태의 최우선 브랜치
- `dev` : 기능 개발을 합치는 베이스 브랜치
- `feature/기능명` : 각 기능을 개별적으로 구현하는 브랜치

**💬 Commit Message Convention**

- `Feat` : 새 기능 추가
- `Fix` : 버그 수정
- `Docs` : 문서 수정
- `Style` : 코드 formatting, 세미콜론 누락, 코드 자체의 변경이 없는 경우
- `Refactor` : 코드 리팩토링
- `Test` : 테스트 코드, 리팩토링 테스트 코드 추가
- `Chore` : 패키지 매니저 수정, 그 외 기타 수정 ex .gitignore
- `Design` : CSS 등 사용자 UI 디자인 변경
- `Comment` : 필요한 주석 추가 및 변경
- `Rename` : 파일 또는 폴더 명을 수정하거나 옮기는 작업만인 경우
- `Remove` : 파일을 삭제하는 작업만 수행한 경우
- `!BREAKING CHANGE` : 커다란 API 변경의 경우
- `!HOTFIX` : 급하게 치명적인 버그를 고쳐야 하는 경우
