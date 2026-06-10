# Project Charter

This charter defines the binding constraints of Neutral Risk (the Neutral DeFi Risk Intelligence
Aggregator). It exists so that
the project's neutrality is structural, not merely a present intention.

## 1. No composite scoring (binding)

The project **must not** produce its own risk score, rating, grade, ranking-by-risk, or
any composite or derived assessment of a protocol's or asset's risk. It presents the
assessments published by third-party feeds, **verbatim**, side by side. It may sort and
filter protocols by neutral, externally-sourced facts (e.g. TVL, category, feed-coverage
count) but never by a risk judgement of its own.

Aggregation is the product. Synthesis is out of scope.

## 2. Verbatim presentation (binding)

Feed ratings are shown as the provider publishes them, attributed to the provider, with a
link to the source. We do not paraphrase a rating in a way that changes its meaning, nor
combine multiple feeds into a single derived signal. Where feeds disagree, the
disagreement is shown, not resolved.

## 3. Neutrality and conflict disclosure (binding)

The project declares all commercial relationships between its maintainers and any listed
protocol or feed provider in `DISCLOSURES.md`. Disclosed relationships never alter how a
protocol or feed is presented, ranked, or labelled.

## 4. Provenance (binding)

Every datum is tagged with its provenance: `onchain`, `verified`, `self-reported`, or
`sample`. Self-reported governance claims are labelled as such and not presented as
independently confirmed.

## 5. Changing this charter

Constraints 1–4 may be changed **only** by:

1. A written, public proposal in this repository describing the change and its rationale; and
2. **Written agreement from the Ethereum Foundation**, recorded in this repository, for any
   change to Constraint 1 (no composite scoring); and
3. A maintainer-signed merge of the charter change, referencing (1) and (2).

Until all three conditions are met, the constraints above are in force. Any feature,
branch, or fork that violates them is out of charter and must not be deployed under this
project's name.

## 6. Steward

The named steward (see the project proposal) is accountable for upholding this charter and
for the long-term maintenance of the project.
