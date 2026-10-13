// Hand-authored line-art in 1080x1920 space. One-line drawing style: each figure is a few long strokes.

/** "You": a one-line profile facing right, from the back of the neck over the skull to the throat. */
export const PROFILE =
  'M 360 1560 C 380 1420 340 1330 300 1230 C 230 1080 230 820 360 690 C 470 580 660 560 760 650 ' +
  'C 830 715 850 800 845 870 C 843 905 860 930 880 965 C 905 1005 925 1040 915 1055 C 905 1068 880 1068 870 1075 ' +
  'C 878 1095 885 1110 872 1122 C 865 1130 880 1140 876 1155 C 870 1175 862 1195 850 1210 ' +
  'C 820 1240 760 1250 720 1255 C 690 1300 690 1420 700 1560';
/** Closed head region (for clipping thoughts inside the skull). */
export const PROFILE_CLOSED = PROFILE + ' L 360 1560 Z';
/** Shoulders continuing from the neck ends. */
export const SHOULDERS = 'M 360 1560 C 300 1610 170 1640 90 1720 M 700 1560 C 760 1600 900 1630 1000 1700';
export const EAR = 'M 548 905 C 490 880 470 990 528 1012 C 545 1018 552 1000 540 985';
export const EYE_OPEN = 'M 772 890 Q 796 872 818 890 Q 796 902 772 890 Z';
export const EYE_PUPIL = {cx: 801, cy: 889, r: 7};
export const EYE_CLOSED = 'M 770 892 Q 795 908 820 890';
export const BROW = 'M 765 852 Q 795 836 828 848';
/** Hair: a sweep from the forehead to a low bun, plus strands. */
export const HAIR =
  'M 780 676 C 700 600 520 590 420 650 C 350 690 300 760 290 840 ' +
  'M 720 640 C 640 660 560 700 520 760 M 640 610 C 560 640 470 700 430 790';
export const BUN = 'M 300 760 C 210 740 190 640 260 610 C 330 580 380 660 340 720 C 320 750 280 740 285 705';
export const LIPS_HINT = 'M 860 1112 L 878 1110';

/** "Her": a soft front-facing face (eyes closed, smiling) used as a ghost portrait inside your head. */
export const HER_FACE =
  'M 540 640 C 420 640 360 740 370 880 C 380 1000 450 1080 540 1085 C 630 1080 700 1000 710 880 C 720 740 660 640 540 640';
export const HER_HAIR =
  'M 545 615 C 400 600 320 720 330 880 C 335 980 300 1060 250 1110 M 545 615 C 690 600 770 720 755 880 C 750 980 790 1060 840 1110 ' +
  'M 545 618 C 520 680 470 720 400 735';
export const HER_EYES = 'M 455 860 Q 480 878 505 860 M 575 860 Q 600 878 625 860';
export const HER_NOSE = 'M 540 880 C 535 920 528 945 548 950';
export const HER_MOUTH = 'M 500 1000 Q 540 1022 580 1000';

/** Heart outline split in halves (left half drawn in gold, right half stays a pencil guide). */
export const HEART_LEFT = 'M 540 1330 C 400 1220 230 1090 240 920 C 250 790 380 740 460 780 C 505 802 530 840 540 880';
export const HEART_RIGHT = 'M 540 880 C 550 840 575 802 620 780 C 700 740 830 790 840 920 C 850 1090 680 1220 540 1330';

/** Phone held in a hand (phone body drawn separately as a rounded rect). */
export const HAND_PHONE =
  'M 150 1960 C 170 1840 190 1720 238 1640 C 250 1580 262 1520 300 1480 C 332 1452 356 1482 334 1514 C 306 1556 296 1610 306 1676 ' +
  'M 820 1190 C 870 1160 900 1210 870 1250 C 850 1280 820 1290 800 1300 ' +
  'M 820 1330 C 880 1310 905 1360 870 1400 C 850 1420 820 1425 800 1430 M 815 1460 C 870 1450 890 1500 850 1530 C 820 1550 790 1555 770 1560 ' +
  'M 812 1585 C 860 1580 875 1620 845 1645 C 830 1658 812 1662 800 1664 M 845 1645 C 880 1720 900 1820 920 1960';

/** Her hand resting on the pillow (top-down bed), entering from the right edge. */
export const HER_HAND =
  'M 1120 560 C 1000 590 900 610 820 600 C 780 596 740 610 720 630 C 700 650 720 668 750 660 ' +
  'M 820 600 C 780 620 740 650 735 680 C 732 700 755 705 770 690 M 840 610 C 810 650 790 690 800 710 C 808 724 828 718 836 700 ' +
  'M 870 612 C 860 650 855 690 870 705 C 880 714 895 705 896 690 L 900 640 M 1120 640 C 1020 650 950 650 900 640';

/** Her hair in profile: long, falling past the shoulder (used for the mirrored "her" profile). */
export const HER_HAIR_SIDE =
  'M 780 676 C 700 590 500 580 400 640 C 300 700 260 820 270 960 C 280 1100 250 1260 200 1400 ' +
  'M 700 630 C 600 650 500 720 440 840 C 400 930 380 1060 330 1200 M 600 610 C 480 640 380 760 350 900';
