import React, { useState } from "react";
import "../../styles/Header.css";

function Header({ title, onSelect }) {
  const [isOpen, setIsOpen] = useState(false); // 드롭다운 메뉴에서 사용하는 useState
  return (
    <header className="app-header">
      <h1>{title}</h1>
      <div className="header-icons">
        <button className="icon-btn">🔔</button>
        {/* icon은 추후에 react-icons로 교체 예정 */}

        <div className="profile-menu">
          <button 
          className="icon-btn"
          onClick={() => setIsOpen(!isOpen)}
          // 클릭하면 isOpen값이 반대로 바뀐다
          >
            👤
          </button>
          {isOpen && (
            // isOpen이 true일때 다음내용을 보여줘라
          <div className="dropdown">
            <div className="dropdown-item"
            onClick={() => {
              onSelect('mypage')}}
            >
              <div>마이페이지</div>
            </div>
            <div className="dropdown-item">
              <div>로그아웃</div>
            </div>
          </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
