import styles from "./hero-illustration.module.css";

export function HeroIllustration() {
  return (
    <svg
      className={styles.container}
      viewBox="0 0 1600 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="LinkedIn job page on the left, with the canvasjob side panel on the right showing a checklist of filter verdicts derived from the description."
    >
      <foreignObject x="0" y="0" width="1600" height="900">
        <div xmlns="http://www.w3.org/1999/xhtml" className={styles.scene}>
        <div className={styles.headerStrip}>
          <span className={`${styles.stripLabel} ${styles.stripLabelLi}`}>
            <span className={styles.dot} />
            What LinkedIn shows
          </span>
          <span className={`${styles.stripLabel} ${styles.stripLabelCj}`}>
            <span className={styles.dot} />
            What canvasjob tells you
          </span>
        </div>

        {/* LinkedIn job page mock */}
        <div className={styles.liPage}>
          <div className={styles.liTopbar}>
            <div className={styles.liLogo}>
              <span>in</span>
            </div>
            <div className={styles.liSearch} />
            <div className={styles.liNavIcons}>
              <span /><span /><span /><span /><span />
            </div>
          </div>

          <div className={styles.liCard}>
            <div className={styles.liJobTitle}>
              Senior Deep Learning Software Engineer, Inference
            </div>
            <div className={styles.liCompanyLine}>
              <b>NVIDIA</b> · Amsterdam, North Holland, Netherlands · 2 weeks ago
            </div>
            <div className={styles.liMeta}>
              2,400 applicants · On-site · Full-time · Senior level
            </div>
            <div className={styles.liActions}>
              <div className={`${styles.liBtn} ${styles.liBtnPrimary}`}>Easy Apply</div>
              <div className={`${styles.liBtn} ${styles.liBtnGhost}`}>Save</div>
            </div>

            <div className={styles.liSectionTitle}>About the job</div>
            <div className={styles.liDesc}>
              <p>
                NVIDIA is at the forefront of AI inference. We&apos;re hiring a
                Senior Deep Learning Software Engineer to join our Inference team
                in <span className={styles.hlFail}>Amsterdam, North Holland</span>.
                This is an on-site role with a hybrid option of two days remote per
                week.
              </p>
              <p>
                You will design and optimize the runtime that serves the world&apos;s
                largest LLMs in production. The team works across{" "}
                <span className={styles.hlInfo}>
                  C/C++, Python, CUDA, CUTLASS, OAI Triton, and NCCL
                </span>
                , and you&apos;ll regularly contribute to{" "}
                <strong>PyTorch, vLLM, and SGLang</strong>.
              </p>
              <p>
                We offer competitive compensation. The{" "}
                <span className={styles.hlPass}>
                  base salary range is 221,250 PLN – 383,500 PLN for Level 3, and
                  292,500 PLN – 507,000 PLN for Level 4
                </span>
                , plus equity and a comprehensive benefits package.
              </p>
              <p>
                Requirements include 5+ years of systems engineering experience,
                deep familiarity with GPU programming, and a track record of
                shipping production ML systems. We work with leading research
                institutions and contribute to open-source.
              </p>
              <p>
                NVIDIA is an equal opportunity employer. We celebrate diversity and
                are committed to creating an inclusive environment for all
                employees.
              </p>
              <p>
                Benefits include private healthcare, life insurance, equity, and a
                generous learning budget for conferences and courses.
              </p>
            </div>
          </div>
        </div>

        {/* canvasjob side panel */}
        <div className={styles.cjPanel}>
          <div className={styles.badgeDerived}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Derived from the description
          </div>

          <div className={styles.cjHeader}>
            <div className={styles.cjBrand}>canvasjob</div>
            <div className={styles.cjIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12" y2="17" />
              </svg>
            </div>
            <div className={styles.cjIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </div>
            <div className={styles.cjProfilePill}>
              Senior Software …
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className={styles.cjBody}>
            <div className={styles.cjTagRow}>
              <span className={styles.cjTag}>Cached evaluation</span>
              <button className={styles.cjTrackBtn} type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Track this job
              </button>
            </div>

            <div className={styles.cjJobTitle}>
              Senior Deep Learning Software Engineer, Inference
            </div>
            <div className={styles.cjJobMeta}>
              NVIDIA · Amsterdam, North Holland, Netherlands
            </div>

            <div className={styles.cjList}>
              <div className={styles.cjRow}>
                <div className={`${styles.cjBullet} ${styles.cjBulletFail}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </div>
                <div>
                  <div className={styles.cjRowTitle}>Fully remote in any EU country</div>
                  <div className={styles.cjRowEvidence}>
                    Location: Amsterdam, North Holland, Netherlands
                  </div>
                </div>
              </div>

              <div className={styles.cjRow}>
                <div className={`${styles.cjBullet} ${styles.cjBulletPass}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div className={styles.cjRowTitle}>Salary above €6k</div>
                  <div className={styles.cjRowEvidence}>
                    base salary range is 221,250 PLN – 383,500 PLN for Level 3, and
                    292,500 PLN – 507,000 PLN for Level 4
                  </div>
                </div>
              </div>

              <div className={styles.cjRow}>
                <div className={`${styles.cjBullet} ${styles.cjBulletUnknown}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12" y2="17" />
                  </svg>
                </div>
                <div>
                  <div className={styles.cjRowTitle}>Visa sponsorship?</div>
                  <div className={styles.cjRowEvidence}>not mentioned</div>
                </div>
              </div>

              <div className={styles.cjRow}>
                <div className={`${styles.cjBullet} ${styles.cjBulletInfo}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="12" y1="8" x2="12" y2="8" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                  </svg>
                </div>
                <div>
                  <div className={styles.cjRowTitle}>What tech stack is required?</div>
                  <div className={styles.cjRowEvidence}>
                    <b>Answer:</b> C/C++, Python, CUDA, CUTLASS, OAI Triton, NCCL.
                    Plus: Deep Learning frameworks (PyTorch, vLLM, SGLang).
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cjFooter}>
            <span>215 / 5000 this month</span>
            <span className={styles.cjFooterAction}>Settings</span>
          </div>
        </div>
        </div>
      </foreignObject>

      {/* Connector arrows: highlighted phrases in the description -> matching verdict rows */}
      <defs>
        <marker
          id="hero-arrow-fail"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#e11d48" />
        </marker>
        <marker
          id="hero-arrow-pass"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#059669" />
        </marker>
        <marker
          id="hero-arrow-info"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#2563eb" />
        </marker>
      </defs>

      {/* White outline halos for legibility on any background */}
      <g fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" opacity="0.9">
        <path d="M 900 348 C 1010 348, 1080 358, 1130 365" />
        <path d="M 700 460 C 870 460, 970 442, 1130 442" />
        <path d="M 950 400 C 1030 400, 1100 530, 1130 590" />
      </g>

      {/* Red: "Amsterdam" -> Fully remote (FAIL) row */}
      <path
        d="M 900 348 C 1010 348, 1080 358, 1130 365"
        fill="none"
        stroke="#e11d48"
        strokeWidth="3"
        strokeDasharray="7 6"
        strokeLinecap="round"
        markerEnd="url(#hero-arrow-fail)"
      />

      {/* Green: salary range -> Salary above €6k (PASS) row */}
      <path
        d="M 700 460 C 870 460, 970 442, 1130 442"
        fill="none"
        stroke="#059669"
        strokeWidth="3"
        strokeDasharray="7 6"
        strokeLinecap="round"
        markerEnd="url(#hero-arrow-pass)"
      />

      {/* Blue: "C/C++" -> Tech stack (INFO) row */}
      <path
        d="M 950 400 C 1030 400, 1100 530, 1130 590"
        fill="none"
        stroke="#2563eb"
        strokeWidth="3"
        strokeDasharray="7 6"
        strokeLinecap="round"
        markerEnd="url(#hero-arrow-info)"
      />
    </svg>
  );
}
