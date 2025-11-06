// src/Pages/Editor/EditorLayout.jsx
import { Outlet } from "react-router-dom";
import EditorHeader from "../../Components/Header/EditorHeader.jsx";
import "./Editor.css";

export default function EditorLayout(){
  return (
    <>
      <EditorHeader />
      <main className="container ed-wrap">
        <Outlet />
      </main>
    </>
  );
}
