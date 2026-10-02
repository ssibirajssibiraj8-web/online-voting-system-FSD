from app.core.database import SessionLocal
from app.models.geographic import Constituency, ConstituencyType, District, State
from app.models.party import Party
from app.models.election import Election, ElectionType
from app.models.candidate import Candidate

def ensure_tvk_in_all_constituencies():
    db = SessionLocal()
    try:
        # 1. Get or create TVK party
        tvk = db.query(Party).filter((Party.abbreviation == "TVK") | (Party.name == "Tamilaga Vettri Kazhagam")).first()
        if not tvk:
            tvk = Party(
                name="Tamilaga Vettri Kazhagam",
                abbreviation="TVK",
                symbol="Whistle",
                color="#8E24AA",
                logo_url="/images/parties/tvk_flag.png",
                description="Political party founded in 2024 by Vijay championing secular social democracy.",
            )
            db.add(tvk)
            db.commit()
            db.refresh(tvk)
        print(f"TVK Party ID: {tvk.id}, Name: {tvk.name}, Symbol: {tvk.symbol}")

        # 2. Get 2026 TN Election
        election = db.query(Election).filter(
            (Election.slug == "tamil-nadu-legislative-assembly-election-2026") | (Election.id == 1)
        ).first()
        if not election:
            print("Tamil Nadu 2026 Election not found.")
            return

        # 3. Fetch all 234 Assembly Constituencies
        acs = db.query(Constituency).filter(Constituency.constituency_type == ConstituencyType.ASSEMBLY).order_by(Constituency.number).all()
        print(f"Found {len(acs)} assembly constituencies in database.")

        added_count = 0
        existing_count = 0

        for ac in acs:
            existing_tvk = db.query(Candidate).filter(
                Candidate.election_id == election.id,
                Candidate.constituency_id == ac.id,
                Candidate.party_id == tvk.id,
            ).first()

            if existing_tvk:
                existing_count += 1
                continue

            # Add TVK candidate for this constituency
            is_vijay_seat = (ac.number == 75) # Vikravandi
            cand = Candidate(
                election_id=election.id,
                constituency_id=ac.id,
                party_id=tvk.id,
                name="Vijay (C. Joseph Vijay)" if is_vijay_seat else f"TVK Nominee ({ac.name})",
                position="President, Tamilaga Vettri Kazhagam (TVK)" if is_vijay_seat else f"MLA Candidate, Tamilaga Vettri Kazhagam (TVK)",
                biography=(
                    "Actor and Founder-President of Tamilaga Vettri Kazhagam (TVK) contesting on platform of secular social democracy, quality education & healthcare, administrative transparency, and youth empowerment."
                    if is_vijay_seat else
                    f"Official TVK candidate nominated to contest the {ac.name} constituency in the 2026 Tamil Nadu Legislative Assembly Election on a platform of secular social democracy and anti-corruption digitalization."
                ),
                photo_url="/images/leaders/tvk_vijay.jpg",
                manifesto=(
                    "1. Free, high-standard secular education and healthcare for every family.\n"
                    "2. Complete administrative transparency and anti-corruption digitalization.\n"
                    "3. Progressive employment generation and modern youth sports centers in every district.\n"
                    "4. Protection of state autonomy, social harmony, and environmental restoration."
                ),
                display_order=2,
                source_name="Tamilaga Vettri Kazhagam / ECI Reference 2026",
                source_url="https://tvk.party",
                source_date="2026 Simulation",
            )
            db.add(cand)
            added_count += 1

        db.commit()
        print(f"Successfully ensured TVK in all constituencies! Added: {added_count}, Pre-existing: {existing_count}, Total: {added_count + existing_count}/234")

    finally:
        db.close()

if __name__ == "__main__":
    ensure_tvk_in_all_constituencies()
