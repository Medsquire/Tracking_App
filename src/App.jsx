import { useEffect, useMemo, useRef, useState } from 'react'

function RailwayIcon({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M18 10h28c4.4 0 8 3.6 8 8v18c0 5.5-4.5 10-10 10h-2.3l4.6 7.2h-6.8L35.8 46H28l-3.7 7.2h-6.8l4.6-7.2H20c-5.5 0-10-4.5-10-10V18c0-4.4 3.6-8 8-8zm4 8v8h20v-8H22zm0 14a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm20 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
        fill="currentColor"
      />
      <path d="M8 56h48v4H8z" fill="currentColor" opacity="0.35" />
    </svg>
  )
}

function App() {
  const ESTIMATES_STORAGE_KEY = 'tracking_estim_estimates'
  const CURRENT_USER_STORAGE_KEY = 'tracking_estim_current_user'
  const COMMON_PASSWORD = 'office@123'

  const userAccounts = useMemo(
    () => [
      { username: 'office1', password: COMMON_PASSWORD, role: 'Office 1', authorityLevel: 1 },
      { username: 'office2', password: COMMON_PASSWORD, role: 'Office 2', authorityLevel: 2 },
      { username: 'office3', password: COMMON_PASSWORD, role: 'Office 3', authorityLevel: 3 },
      { username: 'office4', password: COMMON_PASSWORD, role: 'Office 4', authorityLevel: 4 },
      { username: 'office5', password: COMMON_PASSWORD, role: 'Office 5', authorityLevel: 5 },
      { username: 'office6', password: COMMON_PASSWORD, role: 'Office 6', authorityLevel: 6 },
    ],
    [COMMON_PASSWORD],
  )

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')

  const [activeView, setActiveView] = useState('estimate-list')
  const [selectedPh, setSelectedPh] = useState('ALL')
  const [detailMode, setDetailMode] = useState(null)
  const [selectedEstimateId, setSelectedEstimateId] = useState(null)
  const [activeDetailTab, setActiveDetailTab] = useState('Letter from Concerned Dept.')
  const [draftEstimate, setDraftEstimate] = useState(null)
  const [isNewWorkOpen, setIsNewWorkOpen] = useState(false)
  const [entryMode, setEntryMode] = useState('manual')
  const [uploadedLocFile, setUploadedLocFile] = useState(null)
  const [locError, setLocError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const locFileInputRef = useRef(null)
  const workNameFileInputRef = useRef(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'bot',
      text: 'Hi, I am your file helper. Ask me where your files are, then click Work Name to browse files.',
    },
  ])
  const [recentFiles, setRecentFiles] = useState([])
  const [newWorkForm, setNewWorkForm] = useState({
    letterFileNo: '',
    date: '',
    subject: '',
    ph: '',
    workName: '',
    status: 'Pending',
    commentMessage: '',
  })

  const defaultEstimates = useMemo(
    () => [
      {
        id: 'EST-000',
        estimNo: 'Y/AS/Est/26-27',
        fileNo: 'EST-000',
        ph: 'NA',
        workName:
          'Hyderabad Division: Provision of additional loop line in kachiguda station - Signal arrangements.',
        sAndTCost: 'NA',
        storesCost: 'NA',
        rcilProvision: 'NA',
        commentMessage: 'Awaiting stage approvals',
        user: 'Priya',
        amount: 24500,
        currentStage: 'Submitted',
        status: 'Pending',
      },
      {
        id: 'EST-014',
        estimNo: 'Y/AS/Est/26-31',
        fileNo: 'EST-014',
        ph: 'PH-1',
        workName: 'Secunderabad Panel Interlocking material estimate.',
        sAndTCost: '4,25,000',
        storesCost: '1,12,000',
        rcilProvision: '15,000',
        commentMessage: 'Sent to manager review',
        user: 'Rahul',
        amount: 11200,
        currentStage: 'Manager Review',
        status: 'Approved',
      },
      {
        id: 'EST-026',
        estimNo: 'Y/AS/Est/26-35',
        fileNo: 'EST-026',
        ph: 'PH-2',
        workName: 'Point machine replacement safety estimate package.',
        sAndTCost: '2,90,000',
        storesCost: '75,000',
        rcilProvision: '10,000',
        commentMessage: 'Rework requested at QC review',
        user: 'Anita',
        amount: 6800,
        currentStage: 'QC Review',
        status: 'Reject',
      },
      {
        id: 'EST-041',
        estimNo: 'Y/AS/Est/26-42',
        fileNo: 'EST-041',
        ph: 'PH-4',
        workName: 'Surge arrester and relay renewal for route section.',
        sAndTCost: '3,18,000',
        storesCost: '91,500',
        rcilProvision: 'NA',
        commentMessage: 'Final approval in progress',
        user: 'Vikram',
        amount: 15300,
        currentStage: 'Final Approval',
        status: 'Processing',
      },
    ],
    [],
  )

  const [estimates, setEstimates] = useState(defaultEstimates)

  const detailTabs = useMemo(
    () => [
      'Letter from Concerned Dept.',
      'Inventory',
      'Drawing Information',
      'Covering Letter',
      'Justification',
      'DRM Approval',
      'TDC of Work',
      'Quotation and Reff',
    ],
    [],
  )

  const phOptions = useMemo(
    () => Array.from({ length: 30 }, (_, index) => `PH-${index + 1}`),
    [],
  )

  const filteredEstimates = useMemo(() => {
    if (selectedPh === 'ALL') {
      return estimates
    }

    return estimates.filter((estimate) => estimate.ph === selectedPh)
  }, [estimates, selectedPh])

  const filteredApprovedCount = filteredEstimates.filter(
    (estimate) => estimate.status === 'Approved',
  ).length
  const filteredProgressCount = filteredEstimates.filter(
    (estimate) => estimate.status === 'Processing',
  ).length
  const filteredRejectedCount = filteredEstimates.filter(
    (estimate) => estimate.status === 'Reject',
  ).length
  const filteredPendingCount = filteredEstimates.filter(
    (estimate) => estimate.status === 'Pending',
  ).length
  const totalStationCount = new Set(
    filteredEstimates
      .map((estimate) => estimate.ph)
      .filter((phValue) => phValue && phValue !== 'NA'),
  ).size
  const totalProposeCount = filteredEstimates.filter(
    (estimate) => estimate.currentStage === 'Submitted',
  ).length

  const levelUsers = useMemo(
    () =>
      userAccounts
        .map((account) => ({
          level: account.authorityLevel,
          office: account.role,
        })),
    [userAccounts],
  )

  const stageLevelMap = useMemo(
    () => ({
      Submitted: 1,
      'QC Review': 2,
      'Manager Review': 3,
      'Level 4 Review': 4,
      'Level 5 Review': 5,
      'Final Approval': 6,
    }),
    [],
  )

  const levelSummary = useMemo(
    () =>
      levelUsers.map((levelUser) => {
        const estimatesAtLevel = filteredEstimates.filter(
          (estimate) => (stageLevelMap[estimate.currentStage] || 1) === levelUser.level,
        )

        return {
          ...levelUser,
          pending: estimatesAtLevel.filter((estimate) => estimate.status === 'Pending').length,
          approved: estimatesAtLevel.filter((estimate) => estimate.status === 'Approved').length,
          reject: estimatesAtLevel.filter((estimate) => estimate.status === 'Reject').length,
        }
      }),
    [filteredEstimates, levelUsers, stageLevelMap],
  )

  const selectedEstimate = useMemo(
    () => estimates.find((estimate) => estimate.id === selectedEstimateId) || null,
    [estimates, selectedEstimateId],
  )

  const isEditMode = detailMode === 'edit'
  const detailData = draftEstimate || selectedEstimate

  useEffect(() => {
    try {
      const savedValue = localStorage.getItem(ESTIMATES_STORAGE_KEY)
      if (!savedValue) {
        return
      }

      const parsed = JSON.parse(savedValue)
      if (Array.isArray(parsed) && parsed.length > 0) {
        setEstimates(parsed)
      }
    } catch {
      setEstimates(defaultEstimates)
    }
  }, [ESTIMATES_STORAGE_KEY, defaultEstimates])

  useEffect(() => {
    localStorage.setItem(ESTIMATES_STORAGE_KEY, JSON.stringify(estimates))
  }, [estimates, ESTIMATES_STORAGE_KEY])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser))
      return
    }

    localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
  }, [currentUser, CURRENT_USER_STORAGE_KEY])

  const getOfficeLevelLabel = (estimate) => {
    const level = stageLevelMap[estimate.currentStage] || 1
    const office = userAccounts.find((account) => account.authorityLevel === level)?.role || 'Unknown Office'
    return `${office} (Level-${level})`
  }

  const getCommentMessage = (estimate) => estimate.commentMessage || estimate.remarks || '-'
  const canManageEstimates = !!currentUser && Number(currentUser.authorityLevel) >= 6

  const handleLoginChange = (field, value) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()

    const account = userAccounts.find(
      (candidate) =>
        candidate.username === loginForm.username.trim() &&
        candidate.password === loginForm.password,
    )

    if (!account) {
      setLoginError('Invalid username or password.')
      return
    }

    setCurrentUser(account)
    setLoginError('')
    setLoginForm({ username: '', password: '' })
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setDetailMode(null)
    setSelectedEstimateId(null)
    setDraftEstimate(null)
    setIsNewWorkOpen(false)
    setEntryMode('manual')
  }

  const openDetailPage = (estimate, mode) => {
    setSelectedEstimateId(estimate.id)
    setDetailMode(mode)
    setDraftEstimate({ ...estimate })
    setActiveDetailTab('Letter from Concerned Dept.')
  }

  const closeDetailPage = () => {
    setDetailMode(null)
    setSelectedEstimateId(null)
    setDraftEstimate(null)
  }

  const updateDraftField = (field, value) => {
    setDraftEstimate((prev) => ({ ...prev, [field]: value }))
  }

  const saveEditedEstimate = () => {
    if (!draftEstimate) {
      return
    }

    setEstimates((prev) => {
      const withoutCurrent = prev.filter((estimate) => estimate.id !== draftEstimate.id)
      const duplicateIndex = withoutCurrent.findIndex(
        (estimate) => estimate.fileNo === draftEstimate.fileNo,
      )

      if (duplicateIndex === -1) {
        return prev.map((estimate) =>
          estimate.id === draftEstimate.id ? { ...estimate, ...draftEstimate } : estimate,
        )
      }

      const updated = [...withoutCurrent]
      updated[duplicateIndex] = {
        ...updated[duplicateIndex],
        ...draftEstimate,
        id: updated[duplicateIndex].id,
      }
      return updated
    })
    closeDetailPage()
  }

  const deleteEstimate = (estimateId) => {
    setEstimates((prev) => prev.filter((estimate) => estimate.id !== estimateId))

    if (selectedEstimateId === estimateId) {
      closeDetailPage()
    }
  }

  const openNewWorkModal = () => {
    setEntryMode('upload')
    setUploadedLocFile(null)
    setLocError('')
    setIsDragOver(false)
    setNewWorkForm({
      letterFileNo: '',
      date: '',
      subject: '',
      ph: '',
      workName: '',
      status: 'Pending',
      commentMessage: '',
    })
    setIsNewWorkOpen(true)
  }

  const closeNewWorkModal = () => {
    setIsNewWorkOpen(false)
    setUploadedLocFile(null)
    setLocError('')
    setIsDragOver(false)
  }

  const handleNewWorkChange = (field, value) => {
    setNewWorkForm((prev) => ({ ...prev, [field]: value }))
  }

  const createEstimateId = () => {
    const maxNumber = estimates.reduce((max, estimate) => {
      const parsed = Number.parseInt(estimate.id.split('-')[1], 10)
      if (Number.isNaN(parsed)) {
        return max
      }

      return Math.max(max, parsed)
    }, 0)

    return `EST-${String(maxNumber + 1).padStart(3, '0')}`
  }

  const isAllowedLocFile = (fileName) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx']
    const normalizedName = fileName.toLowerCase()
    return allowedExtensions.some((extension) => normalizedName.endsWith(extension))
  }

  const handleLocFile = (file) => {
    if (!file) {
      return
    }

    if (!isAllowedLocFile(file.name)) {
      setUploadedLocFile(null)
      setLocError('Supported formats are PDF, DOC, DOCX only.')
      return
    }

    setUploadedLocFile(file)
    setLocError('')
  }

  const triggerLocFilePicker = () => {
    locFileInputRef.current?.click()
  }

  const openWorkNameFilePicker = () => {
    workNameFileInputRef.current?.click()
  }

  const handleWorkNameFileChange = (event) => {
    const file = event.target.files?.[0]

    if (file) {
      setRecentFiles((prev) => [file.name, ...prev.filter((name) => name !== file.name)].slice(0, 6))
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: `Selected file: ${file.name}. I can remember recent file names for quick lookup.`,
        },
      ])
    }

    event.target.value = ''
  }

  const getStoredEstimatesForChat = () => {
    try {
      const savedValue = localStorage.getItem(ESTIMATES_STORAGE_KEY)
      if (!savedValue) {
        return estimates
      }

      const parsed = JSON.parse(savedValue)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      return estimates
    }

    return estimates
  }

  const buildBotReply = (inputText) => {
    const normalized = inputText.toLowerCase()
    const sourceEstimates = getStoredEstimatesForChat()
    const fileNoMatch = inputText.match(/(est-\d{3}|[a-z]+\/[a-z]+\/[a-z]+\/\d{2}-\d{2})/i)
    const extractedFileNo = fileNoMatch?.[0]?.trim()

    if (
      extractedFileNo ||
      normalized.includes('file no') ||
      normalized.includes('status') ||
      normalized.includes('office level') ||
      normalized.includes('level')
    ) {
      const matchedEstimate = extractedFileNo
        ? sourceEstimates.find(
            (estimate) => estimate.fileNo.toLowerCase() === extractedFileNo.toLowerCase(),
          )
        : null

      if (!matchedEstimate) {
        const fileHints = sourceEstimates
          .slice(0, 4)
          .map((estimate) => estimate.fileNo)
          .join(', ')
        return `Please enter a valid File No (example: EST-014). Local storage file numbers: ${fileHints || 'No data found'}.`
      }

      const level = stageLevelMap[matchedEstimate.currentStage] || 1
      const office = userAccounts.find((account) => account.authorityLevel === level)?.role || 'Unknown Office'

      return `File No ${matchedEstimate.fileNo}: Status is ${matchedEstimate.status}. Current stage is ${matchedEstimate.currentStage}. Office level is ${office} (Level-${level}).`
    }

    if (normalized.includes('where') || normalized.includes('find') || normalized.includes('location')) {
      if (recentFiles.length > 0) {
        return `I can see recent files: ${recentFiles.join(', ')}. Click Work Name again to browse and pick another file.`
      }
      return `No files selected yet. I can still read ${sourceEstimates.length} records from local storage. Click any Work Name to open file picker and select a file first.`
    }

    if (normalized.includes('c drive') || normalized.includes('local disk')) {
      return 'Browser security does not allow forcing C drive. Use Work Name click to open picker, then choose Local Disk (C:) manually.'
    }

    if (normalized.includes('recent') || normalized.includes('last')) {
      return recentFiles.length > 0
        ? `Recent selected files: ${recentFiles.join(', ')}`
        : 'No recent files yet. Select a file through Work Name first.'
    }

    return 'Try asking: where is my file, show recent files, or how to open C drive.'
  }

  const handleChatSend = () => {
    const message = chatInput.trim()
    if (!message) {
      return
    }

    const reply = buildBotReply(message)
    setChatMessages((prev) => [...prev, { role: 'user', text: message }, { role: 'bot', text: reply }])
    setChatInput('')
  }

  const handleLocInputChange = (event) => {
    const file = event.target.files?.[0]
    handleLocFile(file)
  }

  const handleLocDragOver = (event) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleLocDragLeave = (event) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleLocDrop = (event) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files?.[0]
    handleLocFile(file)
  }

  const saveNewWork = () => {
    if (entryMode === 'manual' && !newWorkForm.workName.trim()) {
      return
    }

    if (entryMode === 'upload' && !uploadedLocFile) {
      return
    }

    const generatedId = createEstimateId()
    const uploadBaseName = uploadedLocFile?.name.replace(/\.[^/.]+$/, '') || ''
    const normalizedFileNo =
      entryMode === 'upload'
        ? generatedId
        : newWorkForm.letterFileNo.trim() || generatedId

    const nextEstimate = {
      id: generatedId,
      estimNo:
        entryMode === 'upload'
          ? uploadBaseName || generatedId
          : normalizedFileNo,
      fileNo: normalizedFileNo,
      ph: entryMode === 'upload' ? 'NA' : newWorkForm.ph.trim() || 'NA',
      workName:
        entryMode === 'upload'
          ? uploadBaseName || 'LOC Uploaded Work'
          : newWorkForm.workName.trim(),
      sAndTCost: 'NA',
      storesCost: 'NA',
      rcilProvision: 'NA',
      commentMessage:
        entryMode === 'upload'
          ? `LOC uploaded: ${uploadedLocFile.name}`
          : newWorkForm.commentMessage.trim() || '-',
      user: 'Current User',
      amount: 0,
      currentStage: 'Submitted',
      status: 'Pending',
      subject: entryMode === 'upload' ? '' : newWorkForm.subject.trim(),
      date: entryMode === 'upload' ? '' : newWorkForm.date,
    }

    setEstimates((prev) => {
      const existingIndex = prev.findIndex((estimate) => estimate.fileNo === nextEstimate.fileNo)

      if (existingIndex === -1) {
        const updatedEstimates = [nextEstimate, ...prev]
        localStorage.setItem(ESTIMATES_STORAGE_KEY, JSON.stringify(updatedEstimates))
        return updatedEstimates
      }

      const updated = [...prev]
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...nextEstimate,
        id: updated[existingIndex].id,
      }
      localStorage.setItem(ESTIMATES_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    closeNewWorkModal()
  }

  const isSaveDisabled = entryMode === 'upload' ? !uploadedLocFile : !newWorkForm.workName.trim()

  if (!currentUser) {
    return (
      <div className="login-page">
        <div className="login-card">
          <section className="login-showcase">
            <div className="login-showcase-badge">
              <RailwayIcon className="railway-icon small" />
              <span>Tracking Estimation Portal</span>
            </div>
            <div className="login-showcase-copy">
              <h1>Tracking_estim_app</h1>
            
            </div>
          </section>

          <section className="login-panel">
            <div className="login-brand-row">
              <RailwayIcon className="railway-icon" />
              <div>
                <h2>Office Login</h2>
             
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="login-form">
              <label>
                Username
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(event) => handleLoginChange('username', event.target.value)}
                  placeholder="Enter office username"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => handleLoginChange('password', event.target.value)}
                  placeholder="Enter shared password"
                />
              </label>

              {loginError && <p className="login-error">{loginError}</p>}

              <button type="submit" className="login-btn">
                Login
              </button>
            </form>

           
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title-row">
          <RailwayIcon className="railway-icon header" />
          <div>
            <h1>Tracking_estim_app</h1>
            <p>Track item approvals stage by stage for each user</p>
          </div>
        </div>
        <div className="header-user-block">
          <span className="user-pill">
            {currentUser.role} | Level-{currentUser.authorityLevel}
          </span>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <button
            type="button"
            className={activeView === 'dashboard' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={activeView === 'estimate-list' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActiveView('estimate-list')}
          >
            Estimate List
          </button>
        </aside>

        <main className="content">
          {activeView === 'dashboard' && (
            <section className="panel">
              <div className="dashboard-head">
                <h2>Approval Overview</h2>
                
              </div>
              <div className="kpi-grid">
                <article className="kpi-card">
                  <h3>Total Estimation</h3>
                  <p>{filteredEstimates.length}</p>
                </article>
                <article className="kpi-card">
                  <h3>Total Propose</h3>
                  <p>{totalProposeCount}</p>
                </article>
                <article className="kpi-card">
                  <h3>Total Station</h3>
                  <p>{totalStationCount}</p>
                </article>
                <article className="kpi-card">
                  <h3>Total Pending</h3>
                  <p>{filteredPendingCount}</p>
                </article>
                <article className="kpi-card">
                  <h3>Total Approval</h3>
                  <p>{filteredApprovedCount}</p>
                </article>
                <article className="kpi-card">
                  <h3>Total Reject</h3>
                  <p>{filteredRejectedCount}</p>
                </article>
              </div>

              <div className="panel-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Office</th>
                      <th>Office Level</th>
                      <th>Pending</th>
                      <th>Approved</th>
                      <th>Reject Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelSummary.map((levelItem, index) => (
                      <tr key={`${levelItem.office}-${levelItem.level}`}>
                        <td>{index + 1}</td>
                        <td>{levelItem.office}</td>
                        <td>Level-{levelItem.level}</td>
                        <td>{levelItem.pending}</td>
                        <td>{levelItem.approved}</td>
                        <td>{levelItem.reject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeView === 'estimate-list' && (
            <section className="panel estimate-table-panel">
              {detailMode && detailData ? (
                <>
                  <div className="detail-breadcrumb">Home / Work Details</div>

                  <div className="work-detail-card">
                    <div className="work-detail-head">
                      <h3>Work Details</h3>
                      <button type="button" className="back-to-list-btn" onClick={closeDetailPage}>
                        Back to List
                      </button>
                    </div>

                    <div className="detail-table-wrap">
                      <table className="detail-table">
                        <thead>
                          <tr>
                            <th>Estim No</th>
                            <th>File No</th>
                            <th>Office Level</th>
                            <th>PH</th>
                            <th>Work Name</th>
                            <th>S &amp; T Cost</th>
                            <th>Stores Cost</th>
                            <th>RCIL Provision</th>
                            <th>Status</th>
                            <th>Comment Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <input
                                value={detailData.estimNo}
                                onChange={(event) => updateDraftField('estimNo', event.target.value)}
                                disabled={!isEditMode}
                                className="detail-input"
                              />
                            </td>
                            <td>
                              <input
                                value={detailData.fileNo}
                                onChange={(event) => updateDraftField('fileNo', event.target.value)}
                                disabled={!isEditMode}
                                className="detail-input"
                              />
                            </td>
                            <td>
                              <input
                                value={getOfficeLevelLabel(detailData)}
                                disabled
                                className="detail-input"
                              />
                            </td>
                            <td>
                              {isEditMode ? (
                                <select
                                  className="detail-input"
                                  value={detailData.ph}
                                  onChange={(event) => updateDraftField('ph', event.target.value)}
                                >
                                  <option value="NA">NA</option>
                                  {phOptions.map((phValue) => (
                                    <option key={phValue} value={phValue}>
                                      {phValue}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input value={detailData.ph} disabled className="detail-input" />
                              )}
                            </td>
                            <td>
                              <input
                                value={detailData.workName}
                                onChange={(event) => updateDraftField('workName', event.target.value)}
                                disabled={!isEditMode}
                                className="detail-input"
                              />
                            </td>
                            <td>
                              <input
                                value={detailData.sAndTCost}
                                onChange={(event) => updateDraftField('sAndTCost', event.target.value)}
                                disabled={!isEditMode}
                                className="detail-input"
                              />
                            </td>
                            <td>
                              <input
                                value={detailData.storesCost}
                                onChange={(event) => updateDraftField('storesCost', event.target.value)}
                                disabled={!isEditMode}
                                className="detail-input"
                              />
                            </td>
                            <td>
                              <input
                                value={detailData.rcilProvision}
                                onChange={(event) => updateDraftField('rcilProvision', event.target.value)}
                                disabled={!isEditMode}
                                className="detail-input"
                              />
                            </td>
                            <td>
                              {isEditMode ? (
                                <select
                                  className="detail-input"
                                  value={detailData.status}
                                  onChange={(event) => updateDraftField('status', event.target.value)}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Reject">Reject</option>
                                </select>
                              ) : (
                                <span
                                  className={`status-badge status-${detailData.status
                                    .toLowerCase()
                                    .replace(' ', '-')}`}
                                >
                                  {detailData.status}
                                </span>
                              )}
                            </td>
                            <td>
                              <input
                                value={getCommentMessage(detailData)}
                                onChange={(event) =>
                                  updateDraftField('commentMessage', event.target.value)
                                }
                                disabled={!isEditMode}
                                className="detail-input"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="detail-tabs" role="tablist" aria-label="Work details tabs">
                      {detailTabs.map((tabName) => (
                        <button
                          key={tabName}
                          type="button"
                          className={activeDetailTab === tabName ? 'detail-tab active' : 'detail-tab'}
                          onClick={() => setActiveDetailTab(tabName)}
                        >
                          {tabName}
                        </button>
                      ))}
                    </div>

                    <div className="detail-tab-panel">
                      <p>
                        {activeDetailTab} section is ready for {detailMode === 'edit' ? 'editing' : 'viewing'}.
                      </p>
                    </div>

                    {isEditMode && (
                      <div className="detail-actions">
                        <button type="button" className="save-btn" onClick={saveEditedEstimate}>
                          Save Changes
                        </button>
                        <button type="button" className="cancel-btn" onClick={closeDetailPage}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="panel-heading">
                    <h2>Estimations</h2>
                    <div className="panel-actions">
                      <label htmlFor="ph-filter" className="filter-label">
                        PH Filter
                      </label>
                      <select
                        id="ph-filter"
                        className="ph-filter-select"
                        value={selectedPh}
                        onChange={(event) => setSelectedPh(event.target.value)}
                      >
                        <option value="ALL">All PH</option>
                        {phOptions.map((phValue) => (
                          <option key={phValue} value={phValue}>
                            {phValue}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="new-work-btn"
                        onClick={openNewWorkModal}
                    
                        title={!canManageEstimates ? 'Only Office 6 can create new work.' : ''}
                      >
                        + New Work
                      </button>
                    </div>
                  </div>

                  <div className="estimation-table-wrap">
                    <input
                      ref={workNameFileInputRef}
                      type="file"
                      className="loc-file-input"
                      onChange={handleWorkNameFileChange}
                    />
                    <table className="estimation-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Estim No</th>
                          <th>File No</th>
                          <th>Office Level</th>
                          <th>PH</th>
                          <th>Work Name</th>
                          <th>S &amp; T Cost</th>
                          <th>Stores Cost</th>
                          <th>RCIL Provision</th>
                          <th>Status</th>
                          <th>Comment Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEstimates.map((estimate, index) => (
                          <tr key={estimate.id}>
                            <td>{index + 1}</td>
                            <td>{estimate.estimNo}</td>
                            <td>{estimate.fileNo}</td>
                            <td>{getOfficeLevelLabel(estimate)}</td>
                            <td>{estimate.ph}</td>
                            <td className="work-name-cell">
                              <button
                                type="button"
                                className="work-name-link"
                                onClick={openWorkNameFilePicker}
                                title="Open local file picker"
                              >
                                {estimate.workName}
                              </button>
                            </td>
                            <td>{estimate.sAndTCost}</td>
                            <td>{estimate.storesCost}</td>
                            <td>{estimate.rcilProvision}</td>
                            <td>
                              <span
                                className={`status-badge status-${estimate.status
                                  .toLowerCase()
                                  .replace(' ', '-')}`}
                              >
                                {estimate.status}
                              </span>
                            </td>
                            <td>{getCommentMessage(estimate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-footer">
                    <p>
                      Showing {filteredEstimates.length === 0 ? 0 : 1} to {filteredEstimates.length}{' '}
                      of {filteredEstimates.length} entries
                    </p>
                    <div className="pager">
                      <button type="button" disabled>
                        Previous
                      </button>
                      <button type="button" className="pager-active">
                        1
                      </button>
                      <button type="button" disabled>
                        Next
                      </button>
                    </div>
                  </div>

                  {isNewWorkOpen && (
                    <div className="modal-overlay" role="dialog" aria-modal="true">
                      <div className="new-work-modal">
                        <div className="new-work-head">
                          <h3>New Work - Upload LOC</h3>
                          <button
                            type="button"
                            className="modal-close-btn"
                            onClick={closeNewWorkModal}
                            aria-label="Close"
                          >
                            x
                          </button>
                        </div>

                        <div className="new-work-body">
                          <div className="entry-toggle-row">
                            <button
                              type="button"
                              className={
                                entryMode === 'upload' ? 'entry-mode-btn active' : 'entry-mode-btn'
                              }
                              onClick={() => setEntryMode('upload')}
                            >
                              Upload LOC
                            </button>
                            <button
                              type="button"
                              className={
                                entryMode === 'manual' ? 'entry-mode-btn active' : 'entry-mode-btn'
                              }
                              onClick={() => setEntryMode('manual')}
                            >
                              Manual Entry
                            </button>
                          </div>

                          {entryMode === 'upload' ? (
                            <div className="upload-loc-wrap">
                              <input
                                ref={locFileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="loc-file-input"
                                onChange={handleLocInputChange}
                              />
                              <button
                                type="button"
                                className={isDragOver ? 'upload-dropzone drag-over' : 'upload-dropzone'}
                                onClick={triggerLocFilePicker}
                                onDragOver={handleLocDragOver}
                                onDragLeave={handleLocDragLeave}
                                onDrop={handleLocDrop}
                              >
                                <svg viewBox="0 0 24 24" className="upload-icon" aria-hidden="true">
                                  <path
                                    d="M19 17a4 4 0 0 0-1-7.87A5.5 5.5 0 0 0 7.2 10.3 3.5 3.5 0 0 0 7.5 17H11v-4H9l3-3 3 3h-2v4h6z"
                                    fill="currentColor"
                                  />
                                </svg>
                                <p className="upload-title">Drag &amp; Drop or Click to Upload LOC</p>
                                <p className="upload-subtitle">Supported formats: PDF, DOC, DOCX</p>
                              </button>
                              {uploadedLocFile && (
                                <p className="selected-file">Selected: {uploadedLocFile.name}</p>
                              )}
                              {locError && <p className="loc-error">{locError}</p>}
                            </div>
                          ) : (
                            <div className="new-work-grid">
                              <label className="form-field">
                                <span>Letter / File No</span>
                                <input
                                  type="text"
                                  placeholder="e.g., Y.M.153./PWP/2024-25"
                                  value={newWorkForm.letterFileNo}
                                  onChange={(event) =>
                                    handleNewWorkChange('letterFileNo', event.target.value)
                                  }
                                />
                              </label>

                              <label className="form-field">
                                <span>Date</span>
                                <input
                                  type="date"
                                  value={newWorkForm.date}
                                  onChange={(event) => handleNewWorkChange('date', event.target.value)}
                                />
                              </label>

                              <label className="form-field wide-field">
                                <span>Subject</span>
                                <textarea
                                  rows="2"
                                  placeholder="Enter work subject"
                                  value={newWorkForm.subject}
                                  onChange={(event) => handleNewWorkChange('subject', event.target.value)}
                                />
                              </label>

                              <label className="form-field">
                                <span>PH</span>
                                <select
                                  value={newWorkForm.ph}
                                  onChange={(event) => handleNewWorkChange('ph', event.target.value)}
                                >
                                  <option value="">Select PH</option>
                                  {phOptions.map((phValue) => (
                                    <option key={phValue} value={phValue}>
                                      {phValue}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="form-field">
                                <span>Work Name *</span>
                                <input
                                  type="text"
                                  placeholder="Enter work name"
                                  value={newWorkForm.workName}
                                  onChange={(event) => handleNewWorkChange('workName', event.target.value)}
                                />
                              </label>

                              {/* <label className="form-field">
                                <span>Status</span>
                                <select
                                  value={newWorkForm.status}
                                  onChange={(event) => handleNewWorkChange('status', event.target.value)}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Reject">Reject</option>
                                </select>
                              </label>

                              <label className="form-field">
                                <span>Comment Message</span>
                                <input
                                  type="text"
                                  placeholder="Enter comment message"
                                  value={newWorkForm.commentMessage}
                                  onChange={(event) =>
                                    handleNewWorkChange('commentMessage', event.target.value)
                                  }
                                />
                              </label> */}
                            </div>
                          )}
                        </div>

                        <div className="new-work-foot">
                          <button type="button" className="cancel-btn" onClick={closeNewWorkModal}>
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="save-btn"
                            onClick={saveNewWork}
                            disabled={isSaveDisabled}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </main>
      </div>

      <div className="chatbot-wrap">
        {chatOpen && (
          <section className="chatbot-panel" aria-label="AI file helper chat">
            <header className="chatbot-header">
              <h3>AI File Helper</h3>
              <button type="button" onClick={() => setChatOpen(false)} aria-label="Close chat">
                x
              </button>
            </header>
            <div className="chatbot-messages">
              {chatMessages.map((message, index) => (
                <p
                  key={`${message.role}-${index}`}
                  className={message.role === 'user' ? 'chat-msg user' : 'chat-msg bot'}
                >
                  {message.text}
                </p>
              ))}
            </div>
            <div className="chatbot-input-row">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleChatSend()
                  }
                }}
                placeholder="Ask where your files are..."
              />
              <button type="button" onClick={handleChatSend}>
                Send
              </button>
            </div>
          </section>
        )}

        <button type="button" className="chatbot-fab" onClick={() => setChatOpen((prev) => !prev)}>
          AI Chat
        </button>
      </div>
    </div>
  )
}

export default App
