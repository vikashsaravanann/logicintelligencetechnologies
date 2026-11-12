import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Sparkles, Play } from 'lucide-react';
import { COMPANY } from '@/config/company';
import styles from './reference-hero.module.css';

const platformCards = [
  { label: 'Healthcare OS', title: 'Healthcare', detail: 'Clinical operations, in sync.', href: '/healthcare', logo: '/images/logos/circular/lit-healthcare-256.png', className: styles.health },
  { label: 'Voice intelligence', title: 'Logic Voice', detail: 'Technology that listens.', href: '/products/logic-voice', logo: '/images/logos/circular/lit-logic-voice-256.png', className: styles.voice },
  { label: 'AI security', title: 'Voice Shield', detail: 'Trust, built into every call.', href: '/voice-shield', logo: '/images/logos/circular/lit-voice-shield-256.png', className: styles.shield },
];

export default function ReferenceHero() {
  return (
    <section className={styles.hero} aria-labelledby="reference-home-title">
      <span className={styles.rule} aria-hidden="true" />
      <div className={styles.seal} role="img" aria-label="Thoughtfully engineered">
        <svg className={styles.sealMark} viewBox="0 0 120 120" aria-hidden="true">
          <path d="M54 13c3-7 13-5 14 3l4 25 24-11c8-4 15 5 9 12L85 60l16 19c5 7-2 16-10 13L67 83 57 106c-4 8-15 5-15-4l-1-25-25 7c-8 2-13-8-6-14l20-16-13-21c-4-7 5-15 12-10l21 14 4-24Z" />
          <path d="M104 5v23M92.5 16.5h23" />
          <circle cx="24" cy="100" r="9" />
        </svg>
      </div>
      <div className={styles.heading}>
        <p className={styles.kicker}>Logic Intelligence Technologies</p>
        <h1 id="reference-home-title">Where logic meets<br /><em>human ingenuity.</em></h1>
        <p className={styles.lede}>We connect ideas, intelligence, and engineering to make the important work feel clearer.</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/products">Explore our products <ArrowRight size={16} /></Link>
          <Link className={styles.secondary} href="/contact"><span><Play size={10} fill="currentColor" /></span> Talk to our team</Link>
        </div>
      </div>

      <div className={styles.stage}>
        <div className={styles.halo} aria-hidden="true" />
        <Image
          className={styles.portrait}
          src="/images/home-editorial-portrait.png"
          alt="Black and white portrait of a thoughtful person surrounded by translucent idea panels"
          width={1536}
          height={1024}
          priority
          sizes="(max-width: 768px) 100vw, 880px"
        />
        <Link href="/about" className={`${styles.note} ${styles.leftNote}`}>
          <span className={styles.noteIcon}><Sparkles size={15} /></span>
          <strong>Ideas into impact.</strong>
          <small>Thoughtful technology, made for real people.</small>
          <ArrowUpRight className={styles.noteArrow} size={13} />
        </Link>
        <Link href="/work" className={`${styles.note} ${styles.rightNote}`}>
          <Image className={styles.companyLogo} src="/images/logos/circular/lit-company-256.png" alt="Logic Intelligence Technologies logo" width={30} height={30} />
          <strong>Built around the work.</strong>
          <small>From first sketch to systems that scale.</small>
          <ArrowUpRight className={styles.noteArrow} size={13} />
        </Link>

        <div className={styles.featureCards} aria-label="Explore our flagship technology platforms">
          {platformCards.map(({ label, title, detail, href, logo, className }) => (
            <Link className={`${styles.featureCard} ${className}`} href={href} key={title}>
              <Image className={styles.productLogo} src={logo} alt={`${title} logo`} width={38} height={38} />
              <span className={styles.featureText}><small>{label}</small><strong>{title}</strong><span>{detail}</span></span>
              <ArrowUpRight className={styles.featureArrow} size={13} />
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.heroBottom}><span>Built in Coimbatore, India</span><span className={styles.bottomLine} /><span>{COMPANY.displayName}</span></div>
    </section>
  );
}
