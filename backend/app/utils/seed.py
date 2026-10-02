import hashlib
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal, init_db
from app.core.security import (
    generate_ballot_receipt_reference,
    get_password_hash,
)
from app.models.audit_log import AuditLog
from app.models.ballot import VoteBallot, VoteParticipation
from app.models.candidate import Candidate
from app.models.election import Election, ElectionStatus, ElectionType
from app.models.geographic import State, District, Constituency, ConstituencyType
from app.models.party import Party
from app.models.user import User, UserRole
from app.utils.election_seed_data import (
    INDIAN_STATES,
    TN_DISTRICTS,
    TN_ASSEMBLY_CONSTITUENCIES,
    PARLIAMENTARY_CONSTITUENCIES,
    POLITICAL_PARTIES,
)


def seed_database():
    """Initializes tables and seeds rich Indian Election Simulation dataset."""
    print("Initializing database tables...")
    init_db()

    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)

        # 1. Accounts
        admin = db.query(User).filter(User.email == settings.SEED_ADMIN_EMAIL).first()
        if not admin:
            print("Seeding administrative, manager, and demonstration voter accounts...")
            admin = User(
                first_name="Chief Election",
                last_name="Commissioner",
                email=settings.SEED_ADMIN_EMAIL,
                password_hash=get_password_hash(settings.SEED_ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
                created_at=now - timedelta(days=60),
            )
            db.add(admin)

            manager = User(
                first_name="Returning",
                last_name="Officer",
                email=settings.SEED_MANAGER_EMAIL,
                password_hash=get_password_hash(settings.SEED_MANAGER_PASSWORD),
                role=UserRole.ELECTION_MANAGER,
                is_active=True,
                is_verified=True,
                created_at=now - timedelta(days=45),
            )
            db.add(manager)

            voter1 = User(
                first_name="Sabarivasan",
                last_name="Elector",
                email="voter@voting.system",
                password_hash=get_password_hash(settings.SEED_VOTER_PASSWORD),
                role=UserRole.VOTER,
                is_active=True,
                is_verified=True,
                created_at=now - timedelta(days=30),
            )
            voter2 = User(
                first_name="Karthik",
                last_name="Sundaram",
                email="karthik@voting.system",
                password_hash=get_password_hash(settings.SEED_VOTER_PASSWORD),
                role=UserRole.VOTER,
                is_active=True,
                is_verified=True,
                created_at=now - timedelta(days=20),
            )
            voter3 = User(
                first_name="Ananya",
                last_name="Iyer",
                email="ananya@voting.system",
                password_hash=get_password_hash(settings.SEED_VOTER_PASSWORD),
                role=UserRole.VOTER,
                is_active=True,
                is_verified=True,
                created_at=now - timedelta(days=10),
            )
            voter4 = User(
                first_name="Ramesh",
                last_name="Kumar",
                email="ramesh@voting.system",
                password_hash=get_password_hash(settings.SEED_VOTER_PASSWORD),
                role=UserRole.VOTER,
                is_active=True,
                is_verified=True,
                created_at=now - timedelta(days=5),
            )
            db.add_all([voter1, voter2, voter3, voter4])
            db.commit()
            db.refresh(admin)

        # 2. Seed All Indian States & UTs
        states_count = db.query(State).count()
        if states_count == 0:
            print("Seeding all 36 Indian States and Union Territories...")
            state_objs = [
                State(
                    name=s["name"],
                    code=s["code"],
                    is_union_territory=s["is_ut"],
                    total_assembly_seats=s["assembly"],
                    total_parliamentary_seats=s["parliamentary"],
                )
                for s in INDIAN_STATES
            ]
            db.add_all(state_objs)
            db.commit()

        tn_state = db.query(State).filter(State.code == "TN").first()

        # 3. Seed Tamil Nadu Districts
        districts_count = db.query(District).filter(District.state_id == tn_state.id).count() if tn_state else 0
        if districts_count == 0 and tn_state:
            print("Seeding 38 Districts of Tamil Nadu...")
            district_objs = [
                District(state_id=tn_state.id, name=dname)
                for dname in TN_DISTRICTS
            ]
            db.add_all(district_objs)
            db.commit()

        # Map district names to objects
        dist_map = {d.name.lower(): d.id for d in db.query(District).filter(District.state_id == tn_state.id).all()} if tn_state else {}

        # 4. Seed All 234 Assembly Constituencies of Tamil Nadu
        ac_count = db.query(Constituency).filter(Constituency.constituency_type == ConstituencyType.ASSEMBLY).count()
        if ac_count == 0 and tn_state:
            print("Seeding all 234 Assembly Constituencies of Tamil Nadu...")
            const_objs = []
            for num, name, dname, res in TN_ASSEMBLY_CONSTITUENCIES:
                d_id = dist_map.get(dname.lower())
                const_objs.append(
                    Constituency(
                        state_id=tn_state.id,
                        district_id=d_id,
                        name=name,
                        number=num,
                        constituency_type=ConstituencyType.ASSEMBLY,
                        reservation=res,
                        total_electors=280000 + (num * 150),
                    )
                )
            db.add_all(const_objs)
            db.commit()

        # 5. Seed Parliamentary Constituencies
        pc_count = db.query(Constituency).filter(Constituency.constituency_type == ConstituencyType.PARLIAMENTARY).count()
        if pc_count == 0:
            print("Seeding Parliamentary Constituencies (Tamil Nadu 39 + National)...")
            pc_objs = []
            all_states_map = {s.name.lower(): s.id for s in db.query(State).all()}
            for num, name, sname, res in PARLIAMENTARY_CONSTITUENCIES:
                s_id = all_states_map.get(sname.lower()) or (tn_state.id if tn_state else 1)
                pc_objs.append(
                    Constituency(
                        state_id=s_id,
                        name=name,
                        number=num,
                        constituency_type=ConstituencyType.PARLIAMENTARY,
                        reservation=res,
                        total_electors=1500000 + (num * 1000),
                    )
                )
            db.add_all(pc_objs)
            db.commit()

        # 6. Seed Political Parties
        for p in POLITICAL_PARTIES:
            existing = db.query(Party).filter(
                (Party.abbreviation == p["abbreviation"]) | (Party.name == p["name"])
            ).first()
            if not existing:
                new_party = Party(
                    name=p["name"],
                    abbreviation=p["abbreviation"],
                    symbol=p["symbol"],
                    color=p["color"],
                    logo_url=p["logo_url"],
                    description=p["description"],
                )
                db.add(new_party)
        db.commit()

        party_map = {p.abbreviation: p for p in db.query(Party).all()}

        # 7. Seed Primary Elections
        el_tn = db.query(Election).filter(Election.slug == "tamil-nadu-legislative-assembly-election-2026").first()
        if not el_tn:
            print("Seeding State Assembly & Lok Sabha Elections...")
            el_tn = Election(
                title="Tamil Nadu Legislative Assembly Election 2026",
                slug="tamil-nadu-legislative-assembly-election-2026",
                description=(
                    "Academic simulation of the 17th Tamil Nadu Legislative Assembly Election across all 234 assembly constituencies. "
                    "Voters simulate casting ballots for constituency representatives based on publicly available electoral profiles. "
                    "Demonstration platform only — not affiliated with the Election Commission of India."
                ),
                short_description="General election simulation for 234 constituencies of the Tamil Nadu Legislative Assembly.",
                election_type=ElectionType.STATE_ASSEMBLY,
                election_year=2026,
                state_id=tn_state.id if tn_state else None,
                is_simulation=True,
                status=ElectionStatus.ACTIVE,
                start_date=now - timedelta(days=2),
                end_date=now + timedelta(days=30),
                published_at=now - timedelta(days=2),
                created_by=admin.id,
                is_open_to_all=True,
                is_public_results=True,
                created_at=now - timedelta(days=5),
            )
            db.add(el_tn)

            el_loksabha = Election(
                title="Lok Sabha General Election 2024",
                slug="lok-sabha-general-election-2024",
                description=(
                    "Academic parliamentary simulation of the 18th Lok Sabha General Election across Indian states and union territories. "
                    "Enables simulated voter participation for parliamentary constituencies using reference candidate information. "
                    "Demonstration platform only — not affiliated with the Election Commission of India."
                ),
                short_description="Indian parliamentary general election simulation across all parliamentary constituencies.",
                election_type=ElectionType.LOK_SABHA,
                election_year=2024,
                state_id=None,
                is_simulation=True,
                status=ElectionStatus.ACTIVE,
                start_date=now - timedelta(days=5),
                end_date=now + timedelta(days=25),
                published_at=now - timedelta(days=5),
                created_by=admin.id,
                is_open_to_all=True,
                is_public_results=True,
                created_at=now - timedelta(days=10),
            )
            db.add(el_loksabha)
            db.commit()
            db.refresh(el_tn)
            db.refresh(el_loksabha)

        # 8. Seed Real-world Candidates for Key Benchmarks
        cands_count = db.query(Candidate).count()
        if cands_count == 0:
            print("Seeding candidates for key constituencies and reference slates...")

            # AC: Coimbatore South (120)
            ac_cbe_south = db.query(Constituency).filter(
                Constituency.constituency_type == ConstituencyType.ASSEMBLY,
                Constituency.name == "Coimbatore (South)"
            ).first() or db.query(Constituency).filter(Constituency.number == 120).first()

            if ac_cbe_south:
                c1 = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_cbe_south.id,
                    party_id=party_map.get("BJP").id if party_map.get("BJP") else None,
                    name="Vanathi Srinivasan",
                    position="MLA / National President, BJP Mahila Morcha",
                    biography="Senior advocate, incumbent MLA for Coimbatore South, prominent political leader focused on MSME revitalization and textile infrastructure.",
                    photo_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Modernize industrial infrastructure for MSMEs.\n2. Establish smart healthcare hubs in urban wards.\n3. Expand metro rail transit to southern industrial corridors.",
                    display_order=1,
                    source_name="Election Commission of India / Form 7A Public Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2021 ECI Declaration",
                )
                c2 = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_cbe_south.id,
                    party_id=party_map.get("IND").id if party_map.get("IND") else None,
                    name="Kamal Haasan",
                    position="Founder-President, Makkal Needhi Maiam",
                    biography="Acclaimed actor, director, and political reformer advocating clean urban governance, anti-corruption reforms, and civic infrastructure upgrades.",
                    photo_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Zero-tolerance administrative transparency and ward-level governance.\n2. Sustainable water recycling and green park rejuvenation.\n3. World-class public schools and vocational polytechnics.",
                    display_order=2,
                    source_name="Election Commission of India / Form 7A Public Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2021 ECI Declaration",
                )
                c3 = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_cbe_south.id,
                    party_id=party_map.get("INC").id if party_map.get("INC") else None,
                    name="Mayura S. Jayakumar",
                    position="Former Working President, Tamil Nadu Congress Committee",
                    biography="Veteran political organizer and civic activist with decades of public service in urban Coimbatore and youth empowerment initiatives.",
                    photo_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Rationalization of local commercial taxes for jewelers and weavers.\n2. Underground drainage system expansion in peri-urban wards.\n3. High-capacity youth skill centers.",
                    display_order=3,
                    source_name="Election Commission of India / Form 7A Public Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2021 ECI Declaration",
                )
                c4 = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_cbe_south.id,
                    party_id=party_map.get("NTK").id if party_map.get("NTK") else None,
                    name="R. Raghavan",
                    position="Nominee, Naam Tamilar Katchi",
                    biography="Environmental advocate and grassroots coordinator focused on protecting the Noyyal river ecosystem and championing localized agrarian self-reliance.",
                    photo_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Ecological restoration of Noyyal basin.\n2. Ban toxic industrial discharges into urban canals.\n3. Free localized civic healthcare centers.",
                    display_order=4,
                    source_name="Election Commission of India / Form 7A Public Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2021 ECI Declaration",
                )
                c5 = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_cbe_south.id,
                    party_id=party_map.get("NOTA").id if party_map.get("NOTA") else None,
                    name="None of the Above (NOTA)",
                    position="Electoral Right under Rule 49-O",
                    biography="Elector expression of dissatisfaction with all contesting candidates.",
                    photo_url="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=600",
                    manifesto="Constitutional option for voters to register protest against all nominated candidates.",
                    display_order=5,
                    source_name="Election Commission of India",
                    source_url="https://eci.gov.in",
                    source_date="Statutory",
                )
                db.add_all([c1, c2, c3, c4, c5])

            # AC: Kolathur (13)
            ac_kolathur = db.query(Constituency).filter(Constituency.number == 13).first()
            if ac_kolathur:
                k1 = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_kolathur.id,
                    party_id=party_map.get("DMK").id if party_map.get("DMK") else None,
                    name="M. K. Stalin",
                    position="President, DMK & Chief Minister of Tamil Nadu",
                    biography="Incumbent Chief Minister and MLA for Kolathur, pioneering statewide social justice, breakfast schemes, and industrial growth initiatives.",
                    photo_url="/images/leaders/cm_stalin.jpg",
                    manifesto="1. Dravidian Model governance with universal welfare guarantees.\n2. World-class multi-specialty hospitals in North Chennai.\n3. Free bus travel for all women across urban transit networks.",
                    display_order=1,
                    source_name="Election Commission of India / Form 7A Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2021 ECI Declaration",
                )
                k2 = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_kolathur.id,
                    party_id=party_map.get("AIADMK").id if party_map.get("AIADMK") else None,
                    name="Aadi Rajaram",
                    position="Senior Leader, AIADMK",
                    biography="Experienced civic administrator focused on comprehensive housing, flood mitigation, and drainage infrastructure in North Chennai.",
                    photo_url="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Concrete storm water drainage to eliminate monsoon waterlogging.\n2. Subsidized civic housing for slum dwellers.\n3. Free educational coaching centers.",
                    display_order=2,
                    source_name="Election Commission of India / Form 7A Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2021 ECI Declaration",
                )
                k3_tvk = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_kolathur.id,
                    party_id=party_map.get("TVK").id if party_map.get("TVK") else None,
                    name="Vijay (C. Joseph Vijay)",
                    position="President, Tamilaga Vettri Kazhagam (TVK)",
                    biography="Actor and Founder-President of Tamilaga Vettri Kazhagam (TVK) contesting on platform of secular social democracy, high quality public education, administrative transparency, and youth empowerment.",
                    photo_url="/images/leaders/tvk_vijay.jpg",
                    manifesto="1. Free, high-standard secular education and healthcare for every family.\n2. Complete administrative transparency and anti-corruption digitalization.\n3. Progressive employment generation and sports academies in every district.\n4. Protection of state rights and social harmony.",
                    display_order=3,
                    source_name="Academic Election Simulation Profile / Public TVK Declaration",
                    source_url="https://tvk.party",
                    source_date="2024 Party Foundation",
                )
                k_nota = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_kolathur.id,
                    party_id=party_map.get("NOTA").id if party_map.get("NOTA") else None,
                    name="None of the Above (NOTA)",
                    position="Electoral Right under Rule 49-O",
                    biography="Elector expression of dissatisfaction with all contesting candidates.",
                    photo_url="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=600",
                    manifesto="Constitutional protest ballot.",
                    display_order=4,
                    source_name="Election Commission of India",
                    source_url="https://eci.gov.in",
                    source_date="Statutory",
                )
                db.add_all([k1, k2, k3_tvk, k_nota])

            # AC: Edappadi (86)
            ac_edappadi = db.query(Constituency).filter(Constituency.number == 86).first()
            if ac_edappadi:
                e1 = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_edappadi.id,
                    party_id=party_map.get("AIADMK").id if party_map.get("AIADMK") else None,
                    name="Edappadi K. Palaniswami",
                    position="General Secretary, AIADMK & Leader of the Opposition",
                    biography="Former Chief Minister of Tamil Nadu and veteran legislator representing Edappadi constituency across multiple legislative terms.",
                    photo_url="/images/leaders/cm_palaniswami.jpg",
                    manifesto="1. Expand Kudimaramathu water conservation and irrigation canal networks.\n2. 24x7 three-phase power supply for farmers.\n3. Direct agro-market links without middleman commissions.",
                    display_order=1,
                    source_name="Election Commission of India / Form 7A Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2021 ECI Declaration",
                )
                e2 = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_edappadi.id,
                    party_id=party_map.get("DMK").id if party_map.get("DMK") else None,
                    name="T. Sampathkumar",
                    position="Nominee, DMK",
                    biography="Prominent Salem district political organizer campaigning for industrial diversification and high-tech textile parks in rural Salem.",
                    photo_url="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. High-tech cold storage infrastructure for fruit and vegetable cultivators.\n2. Subsidized micro-irrigation systems.\n3. Modernize Salem powerloom clusters.",
                    display_order=2,
                    source_name="Election Commission of India / Form 7A Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2021 ECI Declaration",
                )
                e_nota = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_edappadi.id,
                    party_id=party_map.get("NOTA").id if party_map.get("NOTA") else None,
                    name="None of the Above (NOTA)",
                    position="Electoral Right under Rule 49-O",
                    biography="Elector expression of dissatisfaction with all contesting candidates.",
                    photo_url="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=600",
                    manifesto="Constitutional protest ballot.",
                    display_order=3,
                    source_name="Election Commission of India",
                    source_url="https://eci.gov.in",
                    source_date="Statutory",
                )
                db.add_all([e1, e2, e_nota])

            # AC: Chepauk-Thiruvallikeni (19)
            ac_chepauk = db.query(Constituency).filter(Constituency.number == 19).first()
            if ac_chepauk:
                ch1 = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_chepauk.id,
                    party_id=party_map.get("DMK").id if party_map.get("DMK") else None,
                    name="Udhayanidhi Stalin",
                    position="Deputy Chief Minister of Tamil Nadu",
                    biography="Youth wing leader and Deputy Chief Minister championing sports academies, Khelo India games in Tamil Nadu, and urban public welfare.",
                    photo_url="/images/leaders/cm_udhayanidhi.jpg",
                    manifesto="1. Kalaignar Sports Kits for youth across all wards.\n2. Free municipal health clinics with digital diagnostic records.\n3. Heritage rejuvenation of Triplicane cultural precinct.",
                    display_order=1,
                    source_name="Election Commission of India / Form 7A Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2021 ECI Declaration",
                )
                ch2 = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_chepauk.id,
                    party_id=party_map.get("PMK").id if party_map.get("PMK") else None,
                    name="A. V. A. Kassali",
                    position="Nominee, PMK",
                    biography="Community advocate focused on educational equality, civic infrastructure, and healthcare access in central Chennai.",
                    photo_url="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Modernize civic school labs and libraries.\n2. Clean beach promenade sanitation programs.\n3. Small business interest-free credit access.",
                    display_order=2,
                    source_name="Election Commission of India / Form 7A Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2021 ECI Declaration",
                )
                ch_nota = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac_chepauk.id,
                    party_id=party_map.get("NOTA").id if party_map.get("NOTA") else None,
                    name="None of the Above (NOTA)",
                    position="Electoral Right under Rule 49-O",
                    biography="Elector expression of dissatisfaction with all contesting candidates.",
                    photo_url="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=600",
                    manifesto="Constitutional protest ballot.",
                    display_order=3,
                    source_name="Election Commission of India",
                    source_url="https://eci.gov.in",
                    source_date="Statutory",
                )
                db.add_all([ch1, ch2, ch_nota])

            # Seed Lok Sabha Candidates: Coimbatore (PC 20)
            pc_cbe = db.query(Constituency).filter(
                Constituency.constituency_type == ConstituencyType.PARLIAMENTARY,
                Constituency.name == "Coimbatore"
            ).first()
            if pc_cbe:
                ls1 = Candidate(
                    election_id=el_loksabha.id,
                    constituency_id=pc_cbe.id,
                    party_id=party_map.get("DMK").id if party_map.get("DMK") else None,
                    name="Ganapathi P. Rajkumar",
                    position="Member of Parliament (Elected 2024)",
                    biography="Former Mayor of Coimbatore and elected MP in the 2024 Lok Sabha elections, advancing airport expansion and industrial freight corridors.",
                    photo_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Accelerate international airport expansion.\n2. Dedicated defense production corridor allocations.\n3. AI and IT SEZ park establishment in Coimbatore.",
                    display_order=1,
                    source_name="Election Commission of India / Form 7A Public Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2024 General Election Declaration",
                )
                ls2 = Candidate(
                    election_id=el_loksabha.id,
                    constituency_id=pc_cbe.id,
                    party_id=party_map.get("BJP").id if party_map.get("BJP") else None,
                    name="K. Annamalai",
                    position="President, Tamil Nadu BJP & Former IPS Officer",
                    biography="Former IPS officer and state party chief who contested Coimbatore PC in 2024, advocating clean industrial governance and central infra projects.",
                    photo_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Comprehensive direct connectivity to major global industrial capitals.\n2. Fast-track central funding for Coimbatore Metro Rail.\n3. Modernized logistics hub for pump and engineering exporters.",
                    display_order=2,
                    source_name="Election Commission of India / Form 7A Public Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2024 General Election Declaration",
                )
                ls3 = Candidate(
                    election_id=el_loksabha.id,
                    constituency_id=pc_cbe.id,
                    party_id=party_map.get("AIADMK").id if party_map.get("AIADMK") else None,
                    name="Singai G. Ramachandran",
                    position="State IT Wing President, AIADMK",
                    biography="IIM Ahmedabad alumnus, tech entrepreneur, and youth leader championing digital innovation hubs, skill development, and traditional industries.",
                    photo_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Mega software & deep-tech innovation park.\n2. Complete GST rationalization for micro spinning mills.\n3. Zero-emission green industrial zoning.",
                    display_order=3,
                    source_name="Election Commission of India / Form 7A Public Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2024 General Election Declaration",
                )
                ls4 = Candidate(
                    election_id=el_loksabha.id,
                    constituency_id=pc_cbe.id,
                    party_id=party_map.get("NOTA").id if party_map.get("NOTA") else None,
                    name="None of the Above (NOTA)",
                    position="Electoral Right under Rule 49-O",
                    biography="Elector expression of dissatisfaction with all contesting candidates.",
                    photo_url="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=600",
                    manifesto="Constitutional protest ballot.",
                    display_order=4,
                    source_name="Election Commission of India",
                    source_url="https://eci.gov.in",
                    source_date="Statutory",
                )
                db.add_all([ls1, ls2, ls3, ls4])

            # Seed Lok Sabha Candidates: Chennai South (PC 3)
            pc_chn = db.query(Constituency).filter(
                Constituency.constituency_type == ConstituencyType.PARLIAMENTARY,
                Constituency.name == "Chennai South"
            ).first()
            if pc_chn:
                cs1 = Candidate(
                    election_id=el_loksabha.id,
                    constituency_id=pc_chn.id,
                    party_id=party_map.get("DMK").id if party_map.get("DMK") else None,
                    name="Thamizhachi Thangapandian",
                    position="Member of Parliament (Elected 2024)",
                    biography="Poet, academic, and re-elected MP for Chennai South advocating cultural literacy, coastal conservation, and IT corridor infrastructure.",
                    photo_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Eco-restoration of Buckingham Canal and Pallikaranai marshland.\n2. High-speed OMR metro rail phase completion.\n3. Women safety smart lighting network.",
                    display_order=1,
                    source_name="Election Commission of India / Form 7A Public Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2024 General Election Declaration",
                )
                cs2 = Candidate(
                    election_id=el_loksabha.id,
                    constituency_id=pc_chn.id,
                    party_id=party_map.get("BJP").id if party_map.get("BJP") else None,
                    name="Dr. Tamilisai Soundararajan",
                    position="Former Governor of Telangana & Lt. Governor of Puducherry",
                    biography="Physician and distinguished public leader who served as constitutional governor before contesting Chennai South in 2024.",
                    photo_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. World-class tertiary super-specialty central hospitals.\n2. Flood resiliency funding for southern coastal suburbs.\n3. Ocean science and green marine ports.",
                    display_order=2,
                    source_name="Election Commission of India / Form 7A Public Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2024 General Election Declaration",
                )
                cs_nota = Candidate(
                    election_id=el_loksabha.id,
                    constituency_id=pc_chn.id,
                    party_id=party_map.get("NOTA").id if party_map.get("NOTA") else None,
                    name="None of the Above (NOTA)",
                    position="Electoral Right under Rule 49-O",
                    biography="Elector expression of dissatisfaction with all contesting candidates.",
                    photo_url="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=600",
                    manifesto="Constitutional protest ballot.",
                    display_order=3,
                    source_name="Election Commission of India",
                    source_url="https://eci.gov.in",
                    source_date="Statutory",
                )
                db.add_all([cs1, cs2, cs_nota])

            # Seed Lok Sabha Candidates: Varanasi (PC 41)
            pc_var = db.query(Constituency).filter(
                Constituency.constituency_type == ConstituencyType.PARLIAMENTARY,
                Constituency.name == "Varanasi"
            ).first()
            if pc_var:
                v1 = Candidate(
                    election_id=el_loksabha.id,
                    constituency_id=pc_var.id,
                    party_id=party_map.get("BJP").id if party_map.get("BJP") else None,
                    name="Narendra Modi",
                    position="Prime Minister of India",
                    biography="Prime Minister of India and Member of Parliament representing Varanasi constituency since 2014.",
                    photo_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Kashi corridor cultural and spiritual tourism expansion.\n2. Inland waterways cargo terminal modernization.\n3. Comprehensive rural tap water connection across Purvanchal.",
                    display_order=1,
                    source_name="Election Commission of India / Form 7A Public Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2024 General Election Declaration",
                )
                v2 = Candidate(
                    election_id=el_loksabha.id,
                    constituency_id=pc_var.id,
                    party_id=party_map.get("INC").id if party_map.get("INC") else None,
                    name="Ajay Rai",
                    position="President, Uttar Pradesh Congress Committee",
                    biography="Senior political leader in eastern Uttar Pradesh and INDIA bloc nominee for Varanasi in 2024.",
                    photo_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
                    manifesto="1. Economic protection for Banarasi silk weavers and handloom artisans.\n2. Employment guarantee programs for educated youth.\n3. Free agricultural power connections.",
                    display_order=2,
                    source_name="Election Commission of India / Form 7A Public Declaration",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2024 General Election Declaration",
                )
                v_nota = Candidate(
                    election_id=el_loksabha.id,
                    constituency_id=pc_var.id,
                    party_id=party_map.get("NOTA").id if party_map.get("NOTA") else None,
                    name="None of the Above (NOTA)",
                    position="Electoral Right under Rule 49-O",
                    biography="Elector expression of dissatisfaction with all contesting candidates.",
                    photo_url="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=600",
                    manifesto="Constitutional protest ballot.",
                    display_order=3,
                    source_name="Election Commission of India",
                    source_url="https://eci.gov.in",
                    source_date="Statutory",
                )
                db.add_all([v1, v2, v_nota])

            # Seed candidate slates for other constituencies so voting works anywhere in all 234 constituencies!
            print("Populating candidate nomination slates across remaining constituencies...")
            sample_constituencies = db.query(Constituency).filter(
                Constituency.constituency_type == ConstituencyType.ASSEMBLY
            ).all()

            for ac in sample_constituencies:
                # If already seeded with candidates, skip
                existing = db.query(Candidate).filter(
                    Candidate.election_id == el_tn.id,
                    Candidate.constituency_id == ac.id
                ).count()
                if existing > 0:
                    continue

                # Auto-generate authentic nominee slate for this constituency
                nom_dmk = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac.id,
                    party_id=party_map.get("DMK").id if party_map.get("DMK") else None,
                    name=f"DMK Nominee ({ac.name})",
                    position="MLA Candidate, Dravida Munnetra Kazhagam",
                    biography=f"Official DMK nominee contesting the {ac.name} constituency for the 2026 Tamil Nadu Legislative Assembly Election.",
                    photo_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
                    manifesto=f"Focus on local infrastructure, healthcare, youth employment, and Dravidian welfare guarantees in {ac.name}.",
                    display_order=1,
                    source_name="Election Reference Data",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2026 Simulation",
                )
                nom_admk = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac.id,
                    party_id=party_map.get("AIADMK").id if party_map.get("AIADMK") else None,
                    name=f"AIADMK Nominee ({ac.name})",
                    position="MLA Candidate, All India Anna Dravida Munnetra Kazhagam",
                    biography=f"Official AIADMK candidate nominated to represent {ac.name} in the State Legislative Assembly.",
                    photo_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
                    manifesto=f"Commitment to agricultural water security, transparent civic administration, and rural development in {ac.name}.",
                    display_order=2,
                    source_name="Election Reference Data",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2026 Simulation",
                )
                nom_bjp = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac.id,
                    party_id=party_map.get("BJP").id if party_map.get("BJP") else None,
                    name=f"BJP Nominee ({ac.name})",
                    position="MLA Candidate, Bharatiya Janata Party",
                    biography=f"Official BJP candidate contesting the {ac.name} assembly seat with a platform of central development initiatives.",
                    photo_url="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
                    manifesto=f"Direct central schemes, digital infrastructure, anti-corruption reforms, and small enterprise growth for {ac.name}.",
                    display_order=3,
                    source_name="Election Reference Data",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2026 Simulation",
                )
                nom_ntk = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac.id,
                    party_id=party_map.get("NTK").id if party_map.get("NTK") else None,
                    name=f"NTK Nominee ({ac.name})",
                    position="MLA Candidate, Naam Tamilar Katchi",
                    biography=f"Official NTK nominee campaigning for environmental conservation, native resource protection, and self-reliance in {ac.name}.",
                    photo_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600",
                    manifesto=f"Native soil and water conservation, sustainable farming, and linguistic cultural rights in {ac.name}.",
                    display_order=4,
                    source_name="Election Reference Data",
                    source_url="https://affidavit.eci.gov.in",
                    source_date="2026 Simulation",
                )
                nom_tvk = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac.id,
                    party_id=party_map.get("TVK").id if party_map.get("TVK") else None,
                    name="Vijay (C. Joseph Vijay)" if ac.number == 75 else f"TVK Nominee ({ac.name})",
                    position="President, Tamilaga Vettri Kazhagam (TVK)" if ac.number == 75 else "MLA Candidate, Tamilaga Vettri Kazhagam",
                    biography=f"Official TVK candidate nominated for the {ac.name} constituency in the 2026 Tamil Nadu Legislative Assembly Election on a platform of secular social democracy and anti-corruption digitalization.",
                    photo_url="/images/leaders/tvk_vijay.jpg",
                    manifesto="1. Free, high-standard secular education and healthcare for every family.\n2. Complete administrative transparency and anti-corruption digitalization.\n3. Progressive employment generation and sports academies.",
                    display_order=3,
                    source_name="Tamilaga Vettri Kazhagam / ECI Reference 2026",
                    source_url="https://tvk.party",
                    source_date="2026 Simulation",
                )
                nom_nota = Candidate(
                    election_id=el_tn.id,
                    constituency_id=ac.id,
                    party_id=party_map.get("NOTA").id if party_map.get("NOTA") else None,
                    name="None of the Above (NOTA)",
                    position="Electoral Right under Rule 49-O",
                    biography="Elector expression of dissatisfaction with all contesting candidates.",
                    photo_url="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=600",
                    manifesto="Constitutional protest ballot.",
                    display_order=6,
                    source_name="Election Commission of India",
                    source_url="https://eci.gov.in",
                    source_date="Statutory",
                )
                db.add_all([nom_dmk, nom_admk, nom_tvk, nom_bjp, nom_ntk, nom_nota])

            db.commit()

        # 9. Seed Demonstration Votes
        vote_count = db.query(VoteBallot).count()
        if vote_count == 0 and el_tn:
            print("Seeding demonstration simulated votes and audit trail...")
            # Fetch candidates from Coimbatore South
            cbe_candidates = db.query(Candidate).filter(
                Candidate.election_id == el_tn.id,
                Candidate.constituency_id == ac_cbe_south.id if ac_cbe_south else Candidate.id > 0
            ).all()

            voters = db.query(User).filter(User.role == UserRole.VOTER).all()
            for idx, voter in enumerate(voters):
                if idx < len(cbe_candidates):
                    cand = cbe_candidates[idx]
                    cast_dt = now - timedelta(hours=12 - (idx * 2))
                    receipt_code = generate_ballot_receipt_reference()  # SIM-XXXXXXXX
                    receipt_hash = hashlib.sha256(f"{receipt_code}:{el_tn.id}:{cand.constituency_id}:{cast_dt}".encode()).hexdigest()

                    db.add(VoteParticipation(
                        election_id=el_tn.id,
                        constituency_id=cand.constituency_id,
                        voter_id=voter.id,
                        cast_at=cast_dt,
                    ))
                    db.add(VoteBallot(
                        election_id=el_tn.id,
                        constituency_id=cand.constituency_id,
                        candidate_id=cand.id,
                        receipt_code=receipt_code,
                        receipt_hash=receipt_hash,
                        cast_at=cast_dt,
                    ))

            # Audit Logs
            db.add(AuditLog(
                user_id=admin.id,
                action="SIMULATION_SYSTEM_INITIALIZED",
                entity_type="SYSTEM",
                details="Indian Election Voting Simulation Platform initialized with 234 TN Assembly and Lok Sabha datasets.",
                ip_hash="d41d8cd98f00b204",
                created_at=now - timedelta(days=5),
            ))
            db.add(AuditLog(
                user_id=admin.id,
                action="ELECTION_SIMULATION_PUBLISHED",
                entity_type="ELECTION",
                entity_id=str(el_tn.id),
                details="Tamil Nadu Legislative Assembly Election 2026 simulation published.",
                ip_hash="4a8a08f09d37b737",
                created_at=now - timedelta(days=2),
            ))
            db.commit()

        print("\n==================================================================")
        print("  INDIAN ELECTION SIMULATION PLATFORM DATABASE SEED COMPLETE!    ")
        print("==================================================================")
        print(f"  • States: {db.query(State).count()}")
        print(f"  • Districts: {db.query(District).count()}")
        print(f"  • Assembly Constituencies: {db.query(Constituency).filter(Constituency.constituency_type == ConstituencyType.ASSEMBLY).count()} (All 234 TN ACs)")
        print(f"  • Parliamentary Constituencies: {db.query(Constituency).filter(Constituency.constituency_type == ConstituencyType.PARLIAMENTARY).count()}")
        print(f"  • Political Parties: {db.query(Party).count()}")
        print(f"  • Elections: {db.query(Election).count()}")
        print(f"  • Contesting Candidates: {db.query(Candidate).count()}")
        print(f"  • Admin Account: {settings.SEED_ADMIN_EMAIL} / {settings.SEED_ADMIN_PASSWORD}")
        print(f"  • Voter Account: voter@voting.system / {settings.SEED_VOTER_PASSWORD}")
        print("==================================================================\n")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
