

// src/Pages/Reporter/ReporterLayout.jsx
import { Outlet } from 'react-router-dom';
import './reporter.css';

export default function ReporterLayout(){
  return (
    <main className="container reporter-wrap">
      <section className="rep-body rep-body--full">
        <Outlet />
      </section>
    </main>
  );
}
