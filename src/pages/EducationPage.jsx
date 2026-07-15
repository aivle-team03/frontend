import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined'
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import { useState } from 'react'
import { EDUCATION_MOCK_DATA } from '../mocks/mockData.js'

function EducationPage() {
  const { content, requiredCourses, completion, generationOptions } = EDUCATION_MOCK_DATA
  const [contentIndex, setContentIndex] = useState(0)
  const [requiredPage, setRequiredPage] = useState(0)
  const [selectedTarget, setSelectedTarget] = useState('전체')
  const [options, setOptions] = useState({
    workTypes: generationOptions.workTypes[0],
    equipment: generationOptions.equipment[0],
    risks: generationOptions.risks[0],
  })
  const currentContent = content[contentIndex]
  const requiredPageSize = 5
  const requiredPageCount = Math.ceil(requiredCourses.length / requiredPageSize)
  const visibleCourses = requiredCourses.slice(requiredPage * requiredPageSize, (requiredPage + 1) * requiredPageSize)
  const selectedCompletion = completion.find((item) => item.label === selectedTarget) ?? completion[completion.length - 1]
  const completionOptions = [
    ...completion.filter((item) => item.label === '전체'),
    ...completion.filter((item) => item.label !== '전체'),
  ]
  const filteredTargetCourses = requiredCourses.filter((course) => selectedTarget === '전체' || course.target === selectedTarget || course.target === '전체')

  const selectCourse = (course) => {
    const nextContentIndex = content.findIndex((item) => item.id === course.contentId)
    if (nextContentIndex !== -1) setContentIndex(nextContentIndex)
  }

  const updateOption = (key, value) => {
    setOptions((currentOptions) => ({ ...currentOptions, [key]: value }))
  }

  return (
    <section className="education-page">
      <div className="education-top-grid">
        <article className="education-panel content-panel">
          <div className="panel-heading panel-heading-row">
            <div><span className="panel-kicker">교육 콘텐츠</span><h3>{currentContent.title}</h3></div>
            <span className="content-category">{currentContent.category}</span>
          </div>
          <div className="content-preview" aria-label="교육 콘텐츠 미리보기">
            <div className="preview-badge"><MenuBookOutlinedIcon /> 교육 자료</div>
            <div className="preview-center"><SchoolOutlinedIcon /><strong>{currentContent.title}</strong><span>교육 콘텐츠 준비 중</span></div>
            <div className="preview-time">재생 시간 {currentContent.duration}</div>
          </div>
          <p className="content-description">{currentContent.description}</p>
          <div className="content-navigation">
            <button type="button" disabled={contentIndex === 0} onClick={() => setContentIndex((value) => value - 1)}><ArrowBackIosNewOutlinedIcon fontSize="inherit" /> 이전</button>
            <button type="button" disabled={contentIndex === content.length - 1} onClick={() => setContentIndex((value) => value + 1)}>다음 <ArrowForwardIosOutlinedIcon fontSize="inherit" /></button>
          </div>
        </article>

        <article className="education-panel required-panel">
          <div className="panel-heading panel-heading-row"><div><span className="panel-kicker">교육 대상자</span><h3>대상자별 교육 리스트</h3></div></div>
          <div className="required-table-wrap"><table className="required-table"><thead><tr><th>교육명</th><th>대상</th><th>마감일</th><th>상태</th></tr></thead><tbody>
            {visibleCourses.map((course) => <tr className={content[contentIndex]?.id === course.contentId ? 'is-selected' : ''} key={course.id} onClick={() => selectCourse(course)} onKeyDown={(event) => event.key === 'Enter' && selectCourse(course)} role="button" tabIndex="0"><td>{course.title}</td><td>{course.target}</td><td>{course.deadline}</td><td><span className={`education-status status-${course.id}`}>{course.status}</span></td></tr>)}
          </tbody></table></div>
          <div className="required-footer"><span>총 {requiredCourses.length}개 과정</span><div className="required-pagination"><button type="button" aria-label="이전 교육 목록" disabled={requiredPage === 0} onClick={() => setRequiredPage((value) => value - 1)}><ArrowBackIosNewOutlinedIcon fontSize="inherit" /></button><span>{requiredPage + 1} / {requiredPageCount}</span><button type="button" aria-label="다음 교육 목록" disabled={requiredPage === requiredPageCount - 1} onClick={() => setRequiredPage((value) => value + 1)}><ArrowForwardIosOutlinedIcon fontSize="inherit" /></button></div></div>
        </article>
      </div>

      <div className="education-bottom-grid">
        <article className="education-panel completion-panel">
          <div className="panel-heading panel-heading-row"><div><span className="panel-kicker">대상자 기준</span><h3>교육 이수 현황</h3></div><select aria-label="교육 이수 현황 기준" value={selectedTarget} onChange={(event) => setSelectedTarget(event.target.value)}>{completionOptions.map((item) => <option key={item.label}>{item.label}</option>)}</select></div>
          {selectedTarget === '전체' ? (
            <>
              <div className="completion-chart">{completion.map((item) => <div className="completion-column" key={`${selectedTarget}-${item.label}`}><span className="completion-value">{item.value}%</span><div className="completion-track"><span style={{ height: `${item.value}%` }} /></div><span className="completion-label">{item.label}</span></div>)}</div>
              <p className="panel-footnote">완료율은 대상자 대비 교육을 이수한 인원 기준입니다.</p>
            </>
          ) : (
            <div className="completion-overview" key={selectedTarget}>
              <div className="completion-pie-wrap"><div className="completion-pie" style={{ '--completion-rate': `${selectedCompletion.value}%` }}><div><strong>{selectedCompletion.value}%</strong><span>이수율</span></div></div><span className="completion-target-label">{selectedCompletion.label}</span><small>{selectedCompletion.completed}명 / {selectedCompletion.total}명</small></div>
              <div className="completion-course-list"><div className="completion-list-heading"><strong>이수 대상 교육</strong><span>{filteredTargetCourses.length}개</span></div>{filteredTargetCourses.length ? filteredTargetCourses.map((course) => <button className="completion-course-item" type="button" key={course.id} onClick={() => selectCourse(course)}><span><strong>{course.title}</strong><small>{course.target} · 마감 {course.deadline}</small></span><span className={`education-status status-${course.id}`}>{course.status}</span></button>) : <p className="empty-course-message">해당 대상의 교육 과정이 없습니다.</p>}</div>
            </div>
          )}
        </article>

        <article className="education-panel generation-panel">
          <div className="panel-heading"><span className="panel-kicker">교육 준비</span><h3>AI 교육 자료 생성</h3></div>
          <div className="generation-form">
            <EducationSelect label="작업 유형" value={options.workTypes} options={generationOptions.workTypes} onChange={(value) => updateOption('workTypes', value)} />
            <EducationSelect label="사용 장비" value={options.equipment} options={generationOptions.equipment} onChange={(value) => updateOption('equipment', value)} />
            <EducationSelect label="위험 요인" value={options.risks} options={generationOptions.risks} onChange={(value) => updateOption('risks', value)} />
          </div>
          <button className="generation-button" type="button"><PostAddOutlinedIcon fontSize="small" /> AI 교육 자료 생성</button>
        </article>
      </div>

    </section>
  )
}

function EducationSelect({ label, value, options, onChange }) {
  return <label className="education-select"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

export default EducationPage
