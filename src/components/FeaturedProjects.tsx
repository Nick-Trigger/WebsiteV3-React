import HorizontalCard from '../components/HorizontalCard';
import GameThumbnail from '../components/GameThumbnail';

export default function FeaturedProjects() {
    return (
        <div>
            <HorizontalCard
                title="Browser Games"
                media={<GameThumbnail />}
                desc="A small collection of playable browser games built as self-contained React components."
                url="/projects/games"
                badge="Interactive"
            />
            <HorizontalCard
                title="Pulse Mate - Radial Arterial Line Placement Training Device"
                img="/PulseMateLogo-01.svg"
                desc="Easy to use and durable, this training device is designed with students and medical professionals in mind. (VentureWell Summer 2023 Cohort)(Patent Pending)"
                url="/projects/arm"
            />
            <div className="divider my-0"></div>
            <HorizontalCard
                title="CLABSI Prevention Device"
                img="/clabfree.png"
                desc="A handheld medical device designed to disinfect central line hubs and prevent Central Line Associated Bloodstream Infections (CLABSI) in clinical settings. Features embedded C firmware, custom KiCad PCB design, and CAD-modeled enclosure."
                url="/projects/clabsi"
                badge="Medical Device"
            />
            <div className="divider my-0"></div>
        </div>
    );
}