import '../styles/policy-document.css'
import { useNavigate } from 'react-router-dom'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useUiLanguage } from '../utils/uiLanguage.js'

const privacy = [
  ['제1조 총칙', ['AI/2반/3조(이하 “운영팀”)는 시설안전 관리 플랫폼 BOSS를 운영하며, 「개인정보 보호법」 등 관계 법령을 준수합니다.', '운영팀은 서비스 제공에 필요한 최소한의 개인정보를 수집하고, 고지한 목적 범위 안에서만 처리합니다. BOSS는 시설 점검·조치 관리, CCTV 기반 위험 탐지, 시설안전 교육 이수 관리, 보고서 관리 및 법령·매뉴얼 질의응답 기능을 제공합니다.', '이 방침은 BOSS 웹 서비스, 서비스에서 처리하는 사진·영상 및 이용자가 입력하거나 생성한 업무 기록에 적용됩니다. 관계 법령 또는 서비스 기능의 변경에 따라 방침을 보완하는 경우에는 변경 내용을 사전에 안내합니다.']],
  ['제2조 개인정보의 처리 목적, 수집 항목 및 보유기간', ['운영팀은 회원가입·계정·권한 관리, 시설 점검 및 체크리스트 관리, 조치 요청·승인 이력 관리, 시설안전 교육 이수 관리, CCTV AI 위험 탐지, 서비스 보안 및 장애 대응을 위해 개인정보를 처리합니다. 주민등록번호, 계좌번호, 건강정보, 생체인식정보는 기본 수집 항목으로 처리하지 않습니다.'], [['처리 목적', '수집·처리 항목', '보유기간'], ['회원가입 및 계정·권한 관리', '성명, ID, 암호화된 비밀번호, 소속 회사·부서, 사용자 권한', '회원 탈퇴 또는 이용 종료 후 30일'], ['시설 점검·조치·승인 이력 관리', '작성자·점검자·담당자·승인자 ID 또는 이름, 시설·구역, 결과·의견, 사진, 등록·처리 일시', '이용 종료 후 30일'], ['시설안전 교육 이수 관리', '성명 또는 ID, 교육명, 진도율, 이수 여부, 이수일', '이용 종료 후 30일'], ['CCTV AI 위험 탐지', '카메라·구역 정보, 탐지 일시, 이벤트 이미지 또는 영상, 탐지 유형·결과', '생성일로부터 30일. 이력 등록 자료는 해당 기록 보유기간'], ['보안 및 장애 대응', 'IP 주소, 접속일시, 브라우저·기기 정보, 서비스 이용기록', '수집일로부터 3개월']]],
  ['제3조 개인정보의 파기절차 및 방법', ['보유기간이 지나거나 처리 목적이 달성되면 지체 없이 개인정보를 파기합니다. 전자파일은 복구·재생할 수 없는 방법으로 삭제하고, 종이 문서는 분쇄 또는 소각합니다.', '관계 법령에 따라 보존해야 하는 정보는 다른 개인정보와 분리 보관한 뒤 기간 종료 시 파기합니다. 삭제·파기 과정에서 운영팀이 업무상 접근해야 하는 경우에도 최소한의 담당자만 처리하도록 관리합니다.']],
  ['제4조 개인정보의 제3자 제공', ['운영팀은 개인정보를 원칙적으로 제3자에게 제공하거나 판매하지 않습니다. 다만 정보주체의 사전 동의, 법률상 특별한 규정, 생명·신체·재산의 급박한 위험 방지 또는 관계기관의 적법한 요청이 있는 경우 필요한 범위에서 제공할 수 있습니다.', '제공이 필요한 경우 제공받는 자, 제공 목적, 제공 항목, 보유·이용 기간과 동의 거부에 따른 불이익을 별도로 안내하고 필요한 동의를 받습니다.']],
  ['제5조 개인정보 처리의 위탁', ['운영팀은 서비스 운영을 위해 클라우드 서버 및 AI 기능 제공업체 등에 개인정보 처리 업무를 위탁할 수 있습니다. 위탁 시 목적 외 이용 금지, 안전성 확보 조치, 재위탁 제한 및 관리·감독 의무를 계약으로 정하고 수탁자와 위탁업무를 공개합니다.', '아래 수탁자 정보 및 위탁 범위가 변경되는 경우에는 변경된 내용을 이 방침에 반영합니다.'], [['수탁자', '위탁업무'], ['Amazon Web Services, Inc. (AWS)', 'BOSS 서비스 배포·운영을 위한 클라우드 인프라, 서버 및 저장소 운영'], ['OpenAI, L.L.C. (OpenAI API)', '법령·매뉴얼 기반 AI 질의응답 기능 제공'], ['Google LLC (Gemini API / Google AI Studio)', '시설안전 교육자료 생성 AI 기능 제공']]],
  ['제6조 정보주체의 권리와 행사방법', ['정보주체는 열람, 정정·삭제, 처리정지, 동의 철회 및 회원 탈퇴를 요청할 수 있습니다. 권리 행사는 서비스 내 개인정보 설정 또는 운영팀 문의 창구를 통해 요청할 수 있으며, 운영팀은 본인 또는 정당한 대리인임을 확인한 후 지체 없이 처리합니다.', '다만 다른 법령에서 보존을 요구하거나, 다른 이용자의 권리·안전 또는 시설안전 업무 수행에 중대한 영향을 줄 우려가 있는 경우에는 관계 법령이 허용하는 범위에서 요청을 제한하거나 처리 결과와 사유를 안내할 수 있습니다. BOSS는 시설관리 업무 관계자를 대상으로 하며 만 14세 미만 아동의 회원가입을 허용하지 않습니다.']],
  ['제7조 개인정보의 안전성 확보조치', ['운영팀은 역할에 따른 접근권한 관리, 중요정보 암호화, 전송구간 보호, 접근·이용기록 관리, 보안프로그램과 취약점 점검, 처리 인원의 최소화, 유출·장애 대응절차를 적용합니다.', '특히 CCTV 영상·현장 사진·점검 및 조치 이력은 안전관리 업무상 민감하게 취급합니다. 이용자는 업무상 필요 없이 해당 정보를 열람·복제·공유해서는 안 되며, 운영팀은 권한 변경·철회가 필요한 경우 고객사 관리자와 협력해 조치합니다.']],
  ['제8조 자동 수집장치의 운영 및 거부방법', ['운영팀은 로그인 상태 유지, 사용자 환경 설정 및 서비스 보안을 위해 쿠키를 사용할 수 있습니다. 현재 BOSS는 맞춤형 광고 제공을 목적으로 한 추적 쿠키를 기본 기능으로 사용하지 않습니다.', '이용자는 브라우저 설정을 통해 쿠키 저장을 허용하거나 차단할 수 있으나, 필수 쿠키를 차단하면 로그인 등 일부 기능이 정상 작동하지 않을 수 있습니다.']],
  ['제9조 개인정보 보호책임자 및 열람청구', ['개인정보 처리와 관련한 문의, 열람청구, 불만처리 및 피해구제 요청은 아래 담당자에게 할 수 있습니다. 운영팀은 접수된 요청을 확인하고 지체 없이 답변·처리하겠습니다.'], [['구분', '내용'], ['개인정보 보호 담당', '박지함'], ['이메일', 'jiham@boss.com'], ['접수 방법', '이메일 문의']]],
  ['제10조 권익침해 구제방법', ['개인정보 침해 관련 상담·신고는 개인정보침해신고센터(국번 없이 118) 및 개인정보분쟁조정위원회(1833-6972)를 이용할 수 있습니다.', '운영팀의 처리 결과에 이견이 있거나 개인정보 침해로 피해를 입었다고 판단하는 경우에도 위 기관 또는 관계 법령이 정한 절차에 따라 상담·분쟁조정·구제를 신청할 수 있습니다.']],
  ['제11조 처리방침 변경 및 고지', ['내용이 변경되는 경우 서비스 공지사항을 통해 안내합니다. 이용자의 권리 또는 의무에 중요한 변경이 있는 경우에는 시행 전에 주요 변경 사항을 분명하게 고지합니다.', '공고일·시행일: 2026년 7월 29일 / 버전: v1.0']]
]
const terms = [
  ['제1조 목적', ['본 약관은 AI/2반/3조가 제공하는 시설안전 관리 플랫폼 BOSS의 이용과 관련해 운영팀과 이용자의 권리, 의무 및 책임사항을 규정합니다.', '이 약관은 회원가입, 로그인, 시설안전 업무 기록의 등록·조회, AI 기능 이용 등 BOSS 서비스 전반에 적용됩니다.']],
  ['제2조 용어의 정의', ['“서비스”는 BOSS가 제공하는 시설 모니터링, 시설 점검, 조치 관리, 교육 이수 관리, 보고서 및 AI 기능을 의미합니다. “이용자”는 가입 또는 고객사 초대로 서비스를 이용하는 사람이며, “관리자”는 이용자 등록·권한 부여·점검 배정·조치 승인 권한을 가진 이용자입니다.', '이 약관에서 정하지 않은 용어는 관계 법령과 서비스 화면에서 정한 안내에 따릅니다.']],
  ['제3조 약관의 효력 및 변경', ['본 약관은 서비스 화면에 게시하거나 이용자에게 안내함으로써 효력이 발생합니다. 이용자가 회원가입 또는 서비스를 계속 이용하면 약관의 내용에 동의한 것으로 봅니다.', '운영팀은 관계 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 시행일과 변경 내용을 공지합니다. 이용자에게 불리한 중요한 변경은 시행일 30일 전에 안내합니다.']],
  ['제4조 서비스 이용 및 계정관리', ['이용자는 정확한 정보로 계정을 등록하고, 계정을 타인에게 양도·공유할 수 없습니다. 비밀번호 등 인증정보를 안전하게 관리해야 하며, 관리자는 업무상 필요한 범위에서만 권한을 부여해야 합니다.', '퇴사·업무 변경·이용 종료 시 고객사는 해당 이용자의 권한을 변경하거나 회수해야 합니다. 계정 도용 또는 비정상 접근이 의심되면 이용자는 즉시 운영팀 또는 고객사 관리자에게 알려야 합니다.']],
  ['제5조 서비스의 내용', ['서비스는 CCTV·이미지 기반 위험요소 탐지, 시설 점검 체크리스트와 담당자 배정, 위험 신고와 조치 요청, 조치 사진 및 승인 이력, 시설안전 교육자료 생성과 교육 이수 관리, 시설안전 보고서, 법령·매뉴얼 검색과 AI 질의응답, 안전 현황 대시보드와 알림을 제공합니다.', '구체적인 기능과 화면 구성은 운영상 필요, 보안상 필요 또는 외부 연동 환경에 따라 변경될 수 있습니다. 운영팀은 중요한 기능 변경이나 장기 중단이 예상되는 경우 가능한 범위에서 사전 안내합니다.']],
  ['제6조 이용자의 의무', ['이용자는 다른 계정의 무단 사용, 업무상 필요 없는 CCTV 영상·개인정보 열람, 점검·조치·교육 기록의 허위 등록, 타인의 개인정보·초상권·저작권 침해 자료 등록, 보안기능 우회, 비정상 접근, 악성코드·과도한 트래픽 발생, 조작된 증빙자료 등록 및 관계 법령·고객사 시설안전 기준 위반을 해서는 안 됩니다.', '점검 결과, 조치 사진, 승인 정보 등은 실제 업무 내용에 맞게 등록해야 하며, 긴급 위험이 발견된 경우 서비스 입력보다 현장 안전조치와 고객사의 비상대응 절차를 우선해야 합니다.']],
  ['제7조 AI 기능 및 시설안전 정보', ['AI 위험 탐지 결과는 시설관리자의 확인을 지원하는 참고정보이며 오탐지·미탐지 또는 부정확한 결과가 발생할 수 있습니다. 위험 여부와 조치 완료 여부는 권한 있는 담당자가 직접 확인·승인해야 합니다.', 'AI가 생성한 교육자료·보고서와 법령·매뉴얼 답변은 현장 상황과 최신 기준을 검토한 뒤 사용해야 하며, AI 응답은 법률·안전관리 전문가의 공식 자문이나 법정 안전조치를 대체하지 않습니다. 긴급상황에서는 시설의 비상대응 절차를 우선 따라야 합니다.']],
  ['제8조 서비스 변경, 중단 및 이용제한', ['운영팀은 서비스 점검, 서버·외부 서비스 장애, 보안사고 대응, 천재지변 또는 관계기관 요청이 있는 경우 서비스 전부 또는 일부를 변경하거나 일시 중단할 수 있습니다.', '약관 위반, 개인정보 무단 열람, 타인 계정 사용 또는 서비스 보안을 위협하는 행위가 확인된 경우 운영팀은 사전 또는 사후 통지 후 계정 이용을 제한할 수 있습니다. 운영팀은 이용제한 사유와 이의 제기 방법을 가능한 범위에서 안내합니다.']],
  ['제9조 이용자 데이터 및 권리', ['이용자가 등록한 시설정보, 문서, 사진 및 영상의 권리는 이용자·고객사 등 정당한 권리자에게 있습니다. 이용자는 자료를 등록할 정당한 권한을 보유해야 하며, 운영팀은 서비스 제공·보안을 위해 필요한 범위에서만 데이터를 처리합니다.', '이용 종료 또는 삭제 요청 시 데이터 처리와 보유기간은 개인정보 처리방침 및 관계 법령을 따릅니다. 이용자 데이터는 별도 동의 없이 범용 AI 모델의 학습자료로 사용하지 않습니다.']],
  ['제10조 책임, 분쟁 해결 및 시행일', ['운영팀은 서비스를 안정적으로 제공하고 정보를 안전하게 보호하기 위해 노력합니다. 운영팀의 고의 또는 중대한 과실로 손해가 발생한 경우 관계 법령에 따라 책임을 부담하며, 계정관리 소홀·허위정보 등록·약관 위반으로 인한 손해는 해당 이용자가 부담할 수 있습니다.', '분쟁은 상호 협의를 우선하며, 해결되지 않을 경우 대한민국 법률에 따라 처리합니다. 공고일·시행일: 2026년 7월 29일 / 버전: v1.0']]
]

const englishDocuments = {
  privacy: [
    ['Article 1. General Provisions', ['BOSS is a facility-safety management platform operated by the service operator. This Privacy Policy explains how the operator handles personal information in accordance with applicable privacy and data-protection laws.', 'The operator collects only the minimum information necessary to provide the service and processes it only within the stated purposes. BOSS provides facility inspection and action management, CCTV-based risk detection, safety-education completion management, reporting, and legal and manual-based AI question-and-answer features.', 'This Policy applies to information processed while using BOSS, including photographs, videos, user-entered information, and work records created through the service. If applicable laws or service features change, this Policy may be supplemented after prior notice.']],
    ['Article 2. Purpose, Items Collected, and Retention Period', ['The operator processes personal information for membership, account and permission management, facility inspections and checklists, action requests and approvals, safety-education completion, CCTV AI risk detection, service security, and incident response. National identification numbers, bank-account details, health information, and biometric data are not processed as standard collection items.'], [['Purpose of Processing', 'Items Collected and Processed', 'Retention Period'], ['Membership, account, and permission management', 'Name, ID, encrypted password, company or department, user role', 'Until account deletion or 30 days after service termination'], ['Inspection, action, and approval history', 'Author, inspector, assignee, approver ID or name; facility, area, result, opinion, photo, and processing time', '30 days after service termination'], ['Safety-education completion management', 'Name or ID, course name, progress, completion status, and completion date', '30 days after service termination'], ['CCTV AI risk detection', 'Camera and area information, detection time, event image or video, detection type and result', '30 days from creation; registered history follows the applicable record-retention period'], ['Security and incident response', 'IP address, access time, browser or device information, and service-use log', '3 months from collection']]],
    ['Article 3. Destruction Procedures and Methods', ['When the retention period expires or the processing purpose has been achieved, personal information is destroyed without delay. Electronic files are deleted using methods that prevent recovery or reproduction, and paper documents are shredded or incinerated.', 'Where another law requires retention, the information is stored separately for the required period and is accessible only to the minimum number of authorized personnel.']],
    ['Article 4. Provision of Personal Information to Third Parties', ['The operator does not provide or sell personal information to third parties without the data subject’s consent. Information may be provided only where consent is obtained, a law expressly permits it, or disclosure is necessary to protect life, bodily safety, or property in an emergency.', 'If provision is necessary, the recipient, purpose, items provided, retention period, and right to refuse consent will be separately communicated where required.']],
    ['Article 5. Outsourcing of Personal-Information Processing', ['The operator may outsource limited processing activities to cloud-server and AI-service providers in order to operate BOSS. Contracts require the outsourced party to follow processing instructions, implement safety measures, limit re-outsourcing, and maintain confidentiality.', 'When the contractor or scope of outsourcing changes, the change will be reflected in this Policy or otherwise announced.'], [['Processor', 'Outsourced Activity'], ['Amazon Web Services, Inc. (AWS)', 'Cloud infrastructure, servers, and storage for BOSS deployment and operation'], ['OpenAI, L.L.C. (OpenAI API)', 'AI question-and-answer feature based on laws and manuals'], ['Google LLC (Gemini API / Google AI Studio)', 'AI-assisted safety-education material generation']]],
    ['Article 6. Rights of Data Subjects and How to Exercise Them', ['Data subjects may request access, correction, deletion, suspension of processing, withdrawal of consent, or account deletion. Requests may be made through the service’s personal-information settings or the operator’s support contact, and the operator will verify identity or proper representation before responding.', 'Requests may be restricted or deferred only to the extent permitted by law, including where another law requires retention or where fulfilling the request could seriously affect another user’s rights, safety, or essential facility-safety operations. BOSS is intended for facility-management work and does not permit registration by children under the age of 14.']],
    ['Article 7. Safeguards for Personal Information', ['The operator applies role-based access control, encryption of important information, protection of data in transit, access and use-log management, security software and vulnerability management, and procedures for minimizing and responding to leakage incidents.', 'CCTV footage, on-site photographs, inspection records, and action histories are handled as sensitive operational information. Users must not view, copy, or share such information unless it is necessary for their work. The operator reviews access rights and takes corrective action when changes or suspected misuse are identified.']],
    ['Article 8. Cookies and Refusal Method', ['The operator may use cookies to maintain login status, preserve user-environment settings, and secure the service. BOSS does not use tracking cookies as a default feature for targeted advertising.', 'Users may allow or block cookies through browser settings. Blocking essential cookies may prevent login or cause some service features to operate improperly.']],
    ['Article 9. Privacy Officer and Contact Information', ['For inquiries, complaints, or requests concerning personal-information processing, users may contact the privacy officer below. The operator will review requests promptly and respond without unreasonable delay.'], [['Category', 'Details'], ['Privacy Officer', 'Park Jiham'], ['Email', 'jiham@boss.com'], ['Contact Method', 'Email inquiry']]],
    ['Article 10. Remedies for Privacy Infringement', ['For consultation or reports concerning privacy infringement, users may contact the Personal Information Infringement Report Center (without area code, 118) or the Personal Information Dispute Mediation Committee (1833-6972).', 'If a user disagrees with the operator’s response or suffers harm from privacy infringement, the user may also seek counseling, mediation, or other remedies under applicable laws.']],
    ['Article 11. Changes to This Privacy Policy', ['If this Policy changes, the operator will announce the changes through service notices. When changes materially affect users’ rights or obligations, the key changes will be clearly announced before they take effect.', 'Notice date and effective date: July 29, 2026 / Version: v1.0.']],
  ],
  terms: [
    ['Article 1. Purpose', ['These Terms of Service set out the rights, obligations, and responsibilities of the operator and users in connection with BOSS, a facility-safety management platform provided by the operator.', 'These Terms apply to all use of BOSS, including account registration, login, facility-safety work records, inspection and action management, and AI features.']],
    ['Article 2. Definitions', ['“Service” means the facility monitoring, safety inspection, action management, education-completion management, reporting, and AI functions provided by BOSS. “User” means a person authorized by a company or customer to use the Service. “Administrator” means a user with authority to manage registrations, permissions, inspections, assignments, actions, or approvals.', 'Terms not defined in these Terms have the meanings provided by applicable laws and notices published in the Service.']],
    ['Article 3. Effect and Changes to the Terms', ['These Terms take effect when posted in the Service or otherwise notified to users. A user who registers for or continues to use the Service is deemed to have agreed to these Terms.', 'The operator may amend these Terms to the extent permitted by law. Amendments, their effective date, and their content will be announced, and material changes adverse to users will generally be announced at least 30 days in advance.']],
    ['Article 4. Service Use and Account Management', ['Users must register accounts with accurate information, protect passwords and authentication information, and must not transfer or share their accounts with another person. The operator may grant access rights only to the extent needed for the user’s duties.', 'When an employee leaves, changes duties, or no longer requires access, the customer or administrator must promptly change or revoke the user’s permissions. Users must immediately report suspected account theft, unauthorized access, or other security incidents.']],
    ['Article 5. Service Features', ['The Service provides CCTV and image-based risk detection, facility-safety checklists and assignment management, risk reporting and action requests, action photographs and approval histories, AI-assisted safety-education content and completion management, safety reports, and law- and manual-based AI question-and-answer features.', 'Specific functions and screen configurations may change as reasonably necessary for operation, security, or technical conditions. The operator will provide advance notice where a material feature change or interruption is expected.']],
    ['Article 6. User Responsibilities', ['Users must not use another person’s account without authorization; access CCTV footage or personal information outside the scope of their work; upload false work records or unlawful, infringing, or harmful material; bypass security features; disclose invitations or access codes; or otherwise violate applicable laws, customer rules, or facility-safety standards.', 'Inspection results, action photographs, approval information, and similar records must be entered accurately based on actual work. If an urgent hazard is discovered, users must prioritize on-site safety measures and the customer’s emergency procedures over data entry in the Service.']],
    ['Article 7. AI Features and Facility-Safety Information', ['AI risk-detection results are reference information that must be reviewed by an authorized facility manager. False positives, missed detections, or inaccurate results may occur; therefore, the decision to take safety measures and the decision to approve actions remain with the authorized person.', 'AI-generated education material, reports, legal information, and manual information must be reviewed against current laws, standards, and the actual site conditions before use. AI answers do not replace official advice from legal or safety-management professionals. In an emergency, follow facility emergency procedures first.']],
    ['Article 8. Service Changes, Interruption, and Restrictions', ['The operator may modify, suspend, or restrict all or part of the Service where necessary for maintenance, server or network operations, security incidents, natural disasters, government requests, or other operational reasons. Where practicable, the operator will provide prior notice.', 'The operator may restrict a user’s access before or after notice when a violation of these Terms, unauthorized personal-information access, account misuse, or a threat to Service security is identified. The reason for and method of raising an objection will be communicated where reasonably possible.']],
    ['Article 9. User Data and Rights', ['Rights in facility information, documents, photographs, and videos registered by users belong to the user, customer, or other lawful rights holder. Users must have proper authority to upload the material, and the operator processes it only to the extent necessary to provide and secure the Service.', 'Data processing and retention after Service termination or a deletion request are governed by the Privacy Policy and applicable laws. User data is not used to train general-purpose AI models without separate consent.']],
    ['Article 10. Liability, Dispute Resolution, and Effective Date', ['The operator endeavors to provide a stable Service and protect information securely. Where damage is caused by the operator’s willful misconduct or gross negligence, liability is determined under applicable law. A user may be responsible for damage caused by negligent account management, false information, or violation of these Terms.', 'Disputes will first be resolved through mutual consultation. If a dispute is not resolved, it will be handled in accordance with the laws of the Republic of Korea. Notice date and effective date: July 29, 2026 / Version: v1.0.']],
  ],
}

function PolicyDocumentPage({ type }) {
  const navigate = useNavigate()
  const { language, t } = useUiLanguage()
  const isPrivacy = type === 'privacy'
  const sections = language === 'en' ? englishDocuments[type] : (isPrivacy ? privacy : terms)
  const title = t(isPrivacy ? '개인정보 처리방침' : '이용약관')

  return (
    <main className="policy-page">
      <header className="policy-page-head">
        <button
          type="button"
          className="policy-back-button"
          onClick={() => navigate(-1)}
          aria-label={language === 'en' ? 'Go back' : '이전 페이지로 이동'}
        >
          <ArrowBackRoundedIcon />
          <span>{t('뒤로 가기')}</span>
        </button>
        <div>
          <span>POLICY CENTER</span>
          <h1>{title}</h1>
        </div>
        <p><b>{t('시행일')}</b> 2026. 07. 29. <i>v1.0</i></p>
      </header>
      <article className="policy-page-body">
        {sections.map(([sectionTitle, paragraphs, table]) => (
          <section key={sectionTitle}>
            <h2>{sectionTitle}</h2>
            {paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {table && (
              <div className="policy-table-wrap">
                <table>
                  <thead><tr>{table[0].map((cell) => <th key={cell}>{cell}</th>)}</tr></thead>
                  <tbody>{table.slice(1).map((row, index) => <tr key={index}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </article>
    </main>
  )
}
export const PrivacyPolicyPage = () => <PolicyDocumentPage type="privacy" />
export const TermsPage = () => <PolicyDocumentPage type="terms" />
