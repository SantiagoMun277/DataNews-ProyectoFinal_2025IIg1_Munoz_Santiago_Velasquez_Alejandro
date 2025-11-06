


// // src/App.jsx
// import './App.css'
// import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
// import Header from './Components/Header/Header.jsx'
// import Footer from './Components/Fooder/Footer.jsx'
// import Home from './Pages/Home/Home.jsx'
// import Section from './Pages/Section/Section.jsx'
// import NewsDetail from './Pages/NewsDetail/NewsDetail.jsx'
// import Login from './Pages/Auth/Login.jsx'
// import Register from './Pages/Auth/Register.jsx'
// import FocusReset from './Components/UX/FocusReset.jsx'

// import ProtectedRoute from './Components/RouteGuards/ProtectedRoute.jsx'

// // ==== ADMIN (layout + páginas)
// import EditorLayout from './Pages/Editor/EditorLayout.jsx'       // << NUEVO layout con <Outlet/>
// import EditorDashboard from './Pages/Editor/EditorDashboard.jsx' // tu panel actual (será la ruta index)
// import EditorUsers from './Pages/Editor/EditorUsers.jsx'         // placeholder si no existe
// import EditorSections from './Pages/Editor/EditorSections.jsx'   // placeholder si no existe
// import EditorNewsEdit from './Pages/Editor/EditorNewsEdit.jsx'   // placeholder si no existe

// // ==== REPORTERO
// import ReporterLayout from './Pages/Reporter/ReporterLayout.jsx'
// import ReporterCreate from './Pages/Reporter/ReporterCreate.jsx'
// import ReporterMyNews from './Pages/Reporter/ReporterMyNews.jsx'
// import ReporterEdit from './Pages/Reporter/ReporterEdit.jsx'

// // Header del reportero (el del editor lo pinta el layout)
// import ReporterHeader from './Components/Header/ReporterHeader.jsx'

// function AppShell() {
//   const { pathname } = useLocation()

//   const isAuth   = pathname.startsWith('/login') || pathname.startsWith('/register')
//   const isRep    = pathname.startsWith('/reportero')
//   const isEditor = pathname.startsWith('/admin')

//   return (
//     <>
//       {/* Header según la ruta */}
//       {!isAuth && !isRep && !isEditor && <Header />}
//       {isRep && <ReporterHeader />}
//       {/* isEditor: el header lo pinta EditorLayout */}

//       <FocusReset scrollToTop />

//       <Routes>
//         {/* Públicas */}
//         <Route path="/" element={<Home />} />
//         <Route path="/seccion/:slug" element={<Section />} />
//         <Route path="/noticia/:id" element={<NewsDetail />} />

//         {/* Auth */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         {/* ===== ADMIN (layout + subrutas) ===== */}
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute allow={['editor','admin']}>
//               <EditorLayout /> {/* contiene <EditorHeader /> y <Outlet /> */}
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<EditorDashboard />} />         {/* Panel de noticias */}
//           <Route path="usuarios" element={<EditorUsers />} />
//           <Route path="secciones" element={<EditorSections />} />
//           <Route path="noticias/:id" element={<EditorNewsEdit />} />
//         </Route>

//         {/* ===== REPORTERO ===== */}
//         <Route
//           path="/reportero"
//           element={
//             <ProtectedRoute allow={['reportero','editor','admin']}>
//               <ReporterLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<ReporterCreate />} />
//           <Route path="mis-noticias" element={<ReporterMyNews />} />
//           <Route path="editar/:id" element={<ReporterEdit />} />
//         </Route>

//         {/* 404 → home */}
//         <Route path="*" element={<NotFound />} />
//       </Routes>

//       <Footer />
//     </>
//   )
// }

// export default function App(){ return <AppShell /> }


// src/App.jsx
import './App.css'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './Components/Header/Header.jsx'
import Footer from './Components/Fooder/Footer.jsx'
import BackofficeFooter from './Components/Fooder/BackofficeFooter.jsx' // 👈 NUEVO
import Home from './Pages/Home/Home.jsx'
import Section from './Pages/Section/Section.jsx'
import NewsDetail from './Pages/NewsDetail/NewsDetail.jsx'
import Login from './Pages/Auth/Login.jsx'
import Register from './Pages/Auth/Register.jsx'
import FocusReset from './Components/UX/FocusReset.jsx'

import ProtectedRoute from './Components/RouteGuards/ProtectedRoute.jsx'
import NotFound from './Pages/NotFound/NotFound.jsx'

// ==== ADMIN (layout + páginas)
import EditorLayout from './Pages/Editor/EditorLayout.jsx'
import EditorDashboard from './Pages/Editor/EditorDashboard.jsx'
import EditorUsers from './Pages/Editor/EditorUsers.jsx'
import EditorSections from './Pages/Editor/EditorSections.jsx'
import EditorNewsEdit from './Pages/Editor/EditorNewsEdit.jsx'

// ==== REPORTERO
import ReporterLayout from './Pages/Reporter/ReporterLayout.jsx'
import ReporterCreate from './Pages/Reporter/ReporterCreate.jsx'
import ReporterMyNews from './Pages/Reporter/ReporterMyNews.jsx'
import ReporterEdit from './Pages/Reporter/ReporterEdit.jsx'

// Header del reportero (el del editor lo pinta el layout)
import ReporterHeader from './Components/Header/ReporterHeader.jsx'

function AppShell() {
  const { pathname } = useLocation()

  const isAuth   = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isRep    = pathname.startsWith('/reportero')
  const isEditor = pathname.startsWith('/admin')

  return (
    <>
      {/* Header según la ruta */}
      {!isAuth && !isRep && !isEditor && <Header />}
      {isRep && <ReporterHeader />}
      {/* isEditor: el header lo pinta EditorLayout */}

      <FocusReset scrollToTop />

      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/seccion/:slug" element={<Section />} />
        <Route path="/noticia/:id" element={<NewsDetail />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ===== ADMIN (layout + subrutas) ===== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={['editor','admin']}>
              <EditorLayout /> {/* contiene <EditorHeader /> y <Outlet /> */}
            </ProtectedRoute>
          }
        >
          <Route index element={<EditorDashboard />} />
          <Route path="usuarios" element={<EditorUsers />} />
          <Route path="secciones" element={<EditorSections />} />
          <Route path="noticias/:id" element={<EditorNewsEdit />} />
        </Route>

        {/* ===== REPORTERO ===== */}
        <Route
          path="/reportero"
          element={
            <ProtectedRoute allow={['reportero','editor','admin']}>
              <ReporterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ReporterCreate />} />
          <Route path="mis-noticias" element={<ReporterMyNews />} />
          <Route path="editar/:id" element={<ReporterEdit />} />
        </Route>

        {/* 404 → home */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer público vs backoffice */}
      {(isRep || isEditor) ? <BackofficeFooter /> : <Footer />}
    </>
  )
}

export default function App(){ return <AppShell /> }



