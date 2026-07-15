import '../styles/monitoringdetail.css'

function MonitoringDetailPage() {

return(
    <>   
    <div className="page-Layout">
        <div className="cctv-main-Layout">
            <div className="subCard">
                <h4>
                    main
                </h4> 
            </div>
            <div className="subCard">
                <h1>CCTV</h1>
            </div>
            <div className="subCard">
                <h1>Thumbnail</h1>
            </div>
            
        </div>

        <div className="detection-main-Layout">
            <div className="detection-Section">
                <div className="subCard">
                    <h1>1</h1>
                </div>
                <div className="subCard">
                    <h1>2</h1>
                </div>
            </div>
            <div className="subCard">
                    <h1>3</h1>
            </div>
        </div>
    </div>
    </>
)
}

export default MonitoringDetailPage