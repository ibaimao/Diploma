import { RoomIllustration } from "./RoomIllustration";

/** The illustration stays independent of the future Blender / GLB renderer. */
export function PetRoomPlaceholder() {
  return (
    <aside
      className="pet-room"
      aria-label="Комната питомца — иллюстрация-заглушка"
    >
      <RoomIllustration layout="desktop" />
      <RoomIllustration layout="mobile" />
      <div
        className="room-date"
        aria-label="Демонстрационные дата и время: 1 сентября, 10:56"
      >
        <span>1 СЕНТ.</span>
        <span>10:56</span>
      </div>
    </aside>
  );
}
