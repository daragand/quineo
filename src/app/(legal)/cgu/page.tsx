import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — Quinova",
}

export default function CguPage() {
  return (
    <article style={{ color: 'var(--color-text-primary)' }}>
      <h1
        className="font-bold mb-2"
        style={{ fontSize: 26, color: 'var(--color-navy)', fontFamily: 'var(--font-display)' }}
      >
        Conditions générales d&apos;utilisation
      </h1>
      <p className="mb-8" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        Version en vigueur au 1er mars 2026
      </p>

      <Section title="1. Objet">
        <p>
          Les présentes conditions générales d&apos;utilisation (ci-après « CGU ») régissent
          l&apos;accès et l&apos;utilisation de la plateforme Quinova, disponible à
          l&apos;adresse <strong>quinova.fr</strong>, éditée par Quinova.
        </p>
        <p>
          Quinova est une solution SaaS de gestion de loteries associatives permettant aux
          associations de créer des sessions de loto, gérer la vente de cartons en ligne
          et animer le tirage au sort.
        </p>
      </Section>

      <Section title="2. Acceptation des CGU">
        <p>
          L&apos;utilisation de la plateforme implique l&apos;acceptation pleine et entière
          des présentes CGU. En créant un compte, l&apos;utilisateur reconnaît avoir lu,
          compris et accepté les CGU sans réserve.
        </p>
        <p>
          Quinova se réserve le droit de modifier les présentes CGU à tout moment. Les
          utilisateurs seront informés des modifications par e-mail ou notification sur
          la plateforme. La poursuite de l&apos;utilisation après modification vaut
          acceptation des nouvelles CGU.
        </p>
      </Section>

      <Section title="3. Accès au service">
        <p>
          L&apos;accès à Quinova est réservé aux associations déclarées (loi 1901 ou
          équivalent) souhaitant organiser des loteries dans le cadre de la réglementation
          française (art. L.322-4 du Code de la sécurité intérieure).
        </p>
        <p>
          Pour créer un compte, l&apos;administrateur doit être une personne physique
          majeure habilitée à représenter ou agir pour le compte de l&apos;association.
          Un seul compte par association est autorisé.
        </p>
      </Section>

      <Section title="4. Responsabilités de l&apos;association">
        <p>
          L&apos;association utilisatrice est seule responsable :
        </p>
        <ul>
          <li>du respect de la réglementation applicable aux loteries associatives ;</li>
          <li>de l&apos;exactitude des informations saisies sur la plateforme ;</li>
          <li>de la bonne organisation des sessions de loto et du tirage au sort ;</li>
          <li>de la remise effective des lots aux gagnants ;</li>
          <li>de la sécurité des identifiants de connexion.</li>
        </ul>
        <p>
          Quinova ne constitue pas l&apos;organisateur des loteries et n&apos;endosse aucune
          responsabilité à ce titre.
        </p>
      </Section>

      <Section title="5. Description du service">
        <p>Quinova met à disposition :</p>
        <ul>
          <li>un espace de gestion des sessions de loto (création, configuration, lots) ;</li>
          <li>un outil de vente en ligne de cartons avec paiement sécurisé ;</li>
          <li>un écran de tirage en temps réel ;</li>
          <li>un outil de gestion de caisse et de rapports ;</li>
          <li>un système de diffusion du tirage accessible aux participants.</li>
        </ul>
        <p>
          Le service est fourni « en l&apos;état ». Quinova s&apos;efforce d&apos;assurer
          une disponibilité maximale mais ne garantit pas une accessibilité ininterrompue.
        </p>
      </Section>

      <Section title="6. Obligations de l&apos;utilisateur">
        <p>L&apos;utilisateur s&apos;engage à :</p>
        <ul>
          <li>ne pas utiliser la plateforme à des fins illicites ou frauduleuses ;</li>
          <li>ne pas tenter d&apos;accéder aux données d&apos;autres associations ;</li>
          <li>ne pas perturber le fonctionnement du service ;</li>
          <li>informer Quinova sans délai de tout accès non autorisé à son compte.</li>
        </ul>
      </Section>

      <Section title="7. Tarification">
        <p>
          Les conditions tarifaires en vigueur sont consultables sur la page de présentation
          de Quinova. Quinova se réserve le droit de modifier ses tarifs avec un préavis
          d&apos;un mois.
        </p>
      </Section>

      <Section title="8. Données personnelles">
        <p>
          Le traitement des données personnelles est régi par la{' '}
          <a href="/confidentialite" style={{ color: 'var(--color-amber-deep)', fontWeight: 600 }}>
            politique de confidentialité
          </a>{' '}
          de Quinova, conforme au RGPD.
        </p>
      </Section>

      <Section title="9. Propriété intellectuelle">
        <p>
          Quinova conserve l&apos;intégralité des droits de propriété intellectuelle sur
          la plateforme (logiciels, interfaces, marque, logo). Les CGU n&apos;emportent
          aucune cession de ces droits au profit de l&apos;utilisateur.
        </p>
      </Section>

      <Section title="10. Suspension et résiliation">
        <p>
          Quinova peut suspendre ou résilier un compte en cas de violation des présentes
          CGU ou de non-paiement, après mise en demeure restée sans effet pendant 8 jours.
        </p>
        <p>
          L&apos;utilisateur peut résilier son compte à tout moment depuis les paramètres
          ou en contactant Quinova. Les données sont conservées conformément à la politique
          de confidentialité.
        </p>
      </Section>

      <Section title="11. Limitation de responsabilité">
        <p>
          Dans les limites permises par la loi, Quinova ne saurait être tenu responsable
          des dommages indirects résultant de l&apos;utilisation de la plateforme,
          notamment la perte de revenus liée à une interruption de service.
        </p>
      </Section>

      <Section title="12. Droit applicable et litiges">
        <p>
          Les présentes CGU sont soumises au droit français. En cas de litige, les parties
          rechercheront une solution amiable avant tout recours judiciaire. À défaut
          d&apos;accord, les tribunaux compétents seront ceux du ressort du siège social
          de Quinova.
        </p>
      </Section>

      <Section title="13. Contact">
        <p>
          Pour toute question relative aux présentes CGU :{' '}
          <strong>contact@quinova.fr</strong> ou via notre{' '}
          <a href="/contact" style={{ color: 'var(--color-amber-deep)', fontWeight: 600 }}>
            formulaire de contact
          </a>.
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
        style={{
          fontSize:      14,
          color:         'var(--color-text-primary)',
          borderBottom:  '.5px solid var(--color-sep, rgba(0,0,0,.08))',
          paddingBottom: 8,
        }}
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
