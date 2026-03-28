import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Quineo',
}

export default function ConfidentialitePage() {
  return (
    <article style={{ color: 'var(--color-text-primary)' }}>
      <h1
        className="font-bold mb-2"
        style={{ fontSize: 26, color: 'var(--color-navy)', fontFamily: 'var(--font-display)' }}
      >
        Politique de confidentialité
      </h1>
      <p className="mb-8" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés
      </p>

      <Section title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données à caractère personnel collectées sur
          quineo.fr est : <strong>Quineo</strong>, joignable à l&apos;adresse{' '}
          <strong>rgpd@quineo.fr</strong>.
        </p>
      </Section>

      <Section title="2. Données collectées">
        <p>Quineo collecte les données suivantes :</p>
        <ul>
          <li>
            <strong>Lors de la création de compte :</strong> nom, prénom, adresse e-mail,
            mot de passe (chiffré), nom de l&apos;association.
          </li>
          <li>
            <strong>Lors de l&apos;achat de cartons :</strong> nom, prénom, adresse e-mail
            du participant, données de paiement (traitées par le prestataire de paiement —
            Quineo ne stocke pas de numéro de carte bancaire).
          </li>
          <li>
            <strong>Données de connexion :</strong> adresse IP, logs d&apos;accès, tokens
            d&apos;authentification (durée de vie : 8 h / 30 jours pour le refresh token).
          </li>
          <li>
            <strong>Données transmises via le formulaire de contact :</strong> nom, e-mail,
            message.
          </li>
        </ul>
      </Section>

      <Section title="3. Finalités et bases légales">
        <table>
          <thead>
            <tr>
              <th>Finalité</th>
              <th>Base légale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Création et gestion du compte association</td>
              <td>Exécution du contrat (CGU)</td>
            </tr>
            <tr>
              <td>Gestion des sessions de loto et émission des cartons</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Envoi des confirmations de commande par e-mail</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Traitement des paiements</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Sécurité et prévention de la fraude</td>
              <td>Intérêt légitime</td>
            </tr>
            <tr>
              <td>Réponse aux demandes via le formulaire de contact</td>
              <td>Intérêt légitime / Consentement</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="4. Durée de conservation">
        <ul>
          <li><strong>Données de compte :</strong> durée de la relation contractuelle + 3 ans après résiliation.</li>
          <li><strong>Données de transaction :</strong> 10 ans (obligation comptable légale).</li>
          <li><strong>Logs de connexion :</strong> 12 mois maximum.</li>
          <li><strong>Demandes de contact :</strong> 3 ans.</li>
        </ul>
      </Section>

      <Section title="5. Destinataires des données">
        <p>
          Les données collectées sont traitées par Quineo et ses sous-traitants dans le
          cadre strict de la fourniture du service :
        </p>
        <ul>
          <li><strong>Hébergeur :</strong> [nom de l&apos;hébergeur] (infrastructure cloud).</li>
          <li><strong>Service e-mail :</strong> Resend (envoi des emails transactionnels).</li>
          <li>
            <strong>Prestataires de paiement :</strong> Stripe, PayPal, HelloAsso, SumUp
            — chacun soumis à sa propre politique de confidentialité.
          </li>
        </ul>
        <p>
          Quineo ne vend ni ne loue vos données à des tiers.
        </p>
      </Section>

      <Section title="6. Transferts hors UE">
        <p>
          Certains de nos sous-traitants (Resend, Stripe) peuvent traiter des données
          en dehors de l&apos;Union européenne. Ces transferts sont encadrés par des clauses
          contractuelles types approuvées par la Commission européenne ou par une décision
          d&apos;adéquation.
        </p>
      </Section>

      <Section title="7. Vos droits">
        <p>
          Conformément au RGPD, vous disposez des droits suivants sur vos données :
        </p>
        <ul>
          <li><strong>Droit d&apos;accès</strong> — obtenir une copie de vos données.</li>
          <li><strong>Droit de rectification</strong> — corriger des données inexactes.</li>
          <li><strong>Droit à l&apos;effacement</strong> — demander la suppression de vos données.</li>
          <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré.</li>
          <li><strong>Droit d&apos;opposition</strong> — vous opposer à certains traitements.</li>
          <li><strong>Droit à la limitation du traitement.</strong></li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à{' '}
          <strong>rgpd@quineo.fr</strong>. En cas de réponse insatisfaisante, vous pouvez
          saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-amber-deep)', fontWeight: 600 }}>CNIL</a>.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          Quineo utilise uniquement des cookies strictement nécessaires au fonctionnement
          du service : token d&apos;authentification (httpOnly, durée de session ou 30 jours).
          Aucun cookie publicitaire ou de pistage tiers n&apos;est déposé.
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
