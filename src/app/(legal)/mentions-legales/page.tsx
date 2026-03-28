import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales — Quineo',
}

export default function MentionsLegalesPage() {
  return (
    <article style={{ color: 'var(--color-text-primary)' }}>
      <h1
        className="font-bold mb-8"
        style={{ fontSize: 26, color: 'var(--color-navy)', fontFamily: 'var(--font-display)' }}
      >
        Mentions légales
      </h1>

      <Section title="1. Éditeur du site">
        <p>
          Le site <strong>quineo.fr</strong> est édité par :
        </p>
        <ul>
          <li><strong>Raison sociale :</strong> Quineo [forme juridique à compléter]</li>
          <li><strong>Siège social :</strong> [Adresse à compléter]</li>
          <li><strong>SIRET :</strong> [Numéro à compléter]</li>
          <li><strong>Capital social :</strong> [Montant à compléter]</li>
          <li><strong>Email :</strong> contact@quineo.fr</li>
        </ul>
        <p>
          Directeur de la publication : [Nom du directeur à compléter]
        </p>
      </Section>

      <Section title="2. Hébergement">
        <p>
          Le site est hébergé par :
        </p>
        <ul>
          <li><strong>Hébergeur :</strong> [Nom de l&apos;hébergeur à compléter]</li>
          <li><strong>Adresse :</strong> [Adresse de l&apos;hébergeur à compléter]</li>
        </ul>
      </Section>

      <Section title="3. Activité réglementée">
        <p>
          Quineo est une plateforme de gestion de loteries associatives, régies par
          l&apos;article L.322-4 du Code de la sécurité intérieure (CSI). Ces loteries
          sont réservées aux associations déclarées et ne peuvent être organisées qu&apos;à
          des fins sociales, culturelles, scientifiques ou d&apos;animation locale.
        </p>
        <p>
          Quineo fournit uniquement des outils de gestion et ne constitue pas
          l&apos;organisateur des loteries ; cette responsabilité incombe à chaque
          association utilisatrice.
        </p>
      </Section>

      <Section title="4. Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments du site quineo.fr (marque, logo, textes, logiciels,
          interfaces graphiques) est la propriété exclusive de Quineo ou de ses partenaires,
          et est protégé par les lois françaises et internationales relatives à la propriété
          intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou adaptation de
          tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé,
          est interdite sans autorisation écrite préalable de Quineo.
        </p>
      </Section>

      <Section title="5. Limitation de responsabilité">
        <p>
          Quineo ne saurait être tenu responsable des dommages directs ou indirects causés
          au matériel de l&apos;utilisateur lors de l&apos;accès au site, ni des informations
          publiées par les associations utilisatrices.
        </p>
      </Section>

      <Section title="6. Contact">
        <p>
          Pour toute question relative aux présentes mentions légales, vous pouvez nous
          contacter à l&apos;adresse suivante : <strong>contact@quineo.fr</strong> ou via
          notre <a href="/contact" style={{ color: 'var(--color-amber-deep)', fontWeight: 600 }}>formulaire de contact</a>.
        </p>
      </Section>

      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 32 }}>
        Dernière mise à jour : mars 2026
      </p>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2
        className="font-bold mb-3"
        style={{ fontSize: 14, color: 'var(--color-text-primary)', borderBottom: '.5px solid var(--color-sep, rgba(0,0,0,.08))', paddingBottom: 8 }}
      >
        {title}
      </h2>
      <div
        className="flex flex-col gap-3"
        style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}
      >
        {children}
      </div>
    </section>
  )
}
