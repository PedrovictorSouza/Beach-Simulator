from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
TMP_DIR = ROOT / "tmp" / "pdfs"
TMP_DIR.mkdir(parents=True, exist_ok=True)


def build_update_page(path: Path) -> None:
    styles = getSampleStyleSheet()
    document = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )
    story = [
        Paragraph("Atualizacao de Game Design - Economia", styles["Title"]),
        Spacer(1, 8 * mm),
        Paragraph(
            "Inspiracao: Factorio Learning Environment. O primeiro incremento aplica "
            "a ideia de Production Score como uma leitura continua da atividade "
            "economica, sem transformar a economia em estado global.",
            styles["BodyText"],
        ),
        Spacer(1, 5 * mm),
        Paragraph("Implementado", styles["Heading2"]),
        Paragraph(
            "economy/beachEconomyModel.js agora expoe receita acumulada, despesas "
            "acumuladas, variacao liquida e atividade economica acumulada. "
            "A atividade e a soma absoluta de entradas e saidas e serve como uma "
            "medida de throughput financeiro da run.",
            styles["BodyText"],
        ),
        Spacer(1, 5 * mm),
        Paragraph("Efeito no jogo", styles["Heading2"]),
        Paragraph(
            "O saldo continua sendo a fonte autoritativa para compras e manutencao. "
            "As novas metricas sao somente observaveis neste ciclo e permitem, em "
            "um proximo passo, exibir desempenho e criar marcos sem duplicar regras "
            "de dinheiro em UI ou gameplay.",
            styles["BodyText"],
        ),
        Spacer(1, 5 * mm),
        Paragraph("Atualizacao visual", styles["Heading2"]),
        Paragraph(
            "O botao de construcao deixou de depender do texto BUILDING e agora usa "
            "o asset creft-thumb.png como thumbnail. O comportamento de clique, "
            "bloqueio por saldo e os estados visuais continuam no mesmo componente.",
            styles["BodyText"],
        ),
        Spacer(1, 5 * mm),
        Paragraph("Legibilidade dos textos", styles["Heading2"]),
        Paragraph(
            "Os fundos dos overlays e contadores textuais foram removidos: status, "
            "reclamacoes, feedback de coleta, relogio, tarefas e FPS. Fundos de "
            "botoes, dialogos e barras de progresso permanecem como elementos de "
            "interacao e estrutura visual.",
            styles["BodyText"],
        ),
        Spacer(1, 5 * mm),
        Paragraph("Contador de banhistas", styles["Heading2"]),
        Paragraph(
            "O texto numerico de bather-counter__count passou de 1.6rem para 3.2rem "
            "e recebeu rotacao visual de 30 graus. O thumbnail e os demais contadores "
            "nao foram alterados.",
            styles["BodyText"],
        ),
        Spacer(1, 5 * mm),
        Paragraph("Proximo incremento sugerido", styles["Heading2"]),
        Paragraph(
            "Adicionar marcos de progressao baseados em operacoes reais da praia, "
            "com regras explicitas e limite por run. Esse passo deve ser separado "
            "da camada de apresentacao para preservar a direcao gameManager -> "
            "modelos -> UI.",
            styles["BodyText"],
        ),
    ]
    document.build(story)


def append_update(source: Path, output: Path, update_page: Path) -> None:
    reader = PdfReader(str(source))
    update_reader = PdfReader(str(update_page))
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    for page in update_reader.pages:
        writer.add_page(page)
    with output.open("wb") as stream:
        writer.write(stream)


def main() -> None:
    update_page = TMP_DIR / "design-document-economy-update.pdf"
    build_update_page(update_page)
    for filename in (
        "beach-simulator-mapa-de-game-design.pdf",
        "beach-simulator-game-design-map-en.pdf",
    ):
        target = ROOT / "output" / "pdf" / filename
        backup = TMP_DIR / filename
        if not backup.exists():
            backup.write_bytes(target.read_bytes())
        append_update(backup, target, update_page)


if __name__ == "__main__":
    main()
