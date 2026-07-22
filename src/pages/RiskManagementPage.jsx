import '../styles/risk.css'
import { EVENT_CATEGORY_MOCKUP_DATA } from '../mocks/mockData.js'
import RiskFactorTypeChart from '../components/riskmanagement/RiskFactorTypeChart.jsx'
import EventCategotyTable from '../components/riskmanagement/EventCategotyTable.jsx'
import {
    Typography,
} from '@mui/material'


function Riskicon({ name }) {
  const commonProps = {
    className: 'riskicon',
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  }

  if (name === 'warning') {
    return (
      <svg {...commonProps}>
         <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
        />
      </svg>
    )
  }

}
function RiskManagementPage()
{

    return(

      <section className='risk-page-layout'>

        <div className='risk-top-layout'>
            <div className='count-card'>
                  
                  <div className='risk-count-layout'> 
                     <Typography variant="h6">위험 요인</Typography>
                     <div className='count-icon-text'>
                            <div className='count-icon-box'>
                                <Riskicon name="warning"></Riskicon>
                            </div>

                            <div className='count-text-box'>
                                <Typography variant="h6">전체 위험<br /> 요인 갯수</Typography>
                                <Typography variant="h6">32건</Typography>
                            </div>
                     </div>
                </div>
                 
                  
            </div>

            <div className='count-graph'>
                <div className='risk-graph-layout'>
                    <Typography variant="h6">
                        위험 요인 유형 그래프
                    </Typography>
                        <RiskFactorTypeChart
                            risks={EVENT_CATEGORY_MOCKUP_DATA}
                        />
                </div>
                 
            </div>

        </div>



        <div className='risk-bottom-layout'>
            <div className='risk-list'>
                 <Typography variant="h6">위험 요인 리스트</Typography>
                <EventCategotyTable events={EVENT_CATEGORY_MOCKUP_DATA}/>
            </div>

            <div className='risk-list-button'>
                <div className='risk-button-layout'>
                <button className='risk-add-button'>
                    항목 추가
                </button>

                <button className='risk-add-button'>
                    항목 제거
                </button>
                </div>
                
            </div>

        </div>
      </section>
    
    )
}


export default RiskManagementPage